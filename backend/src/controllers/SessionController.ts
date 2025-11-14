import { Request, Response } from "express";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";

import AuthUserService from "../services/UserServices/AuthUserService";
import { SendRefreshToken } from "../helpers/SendRefreshToken";
import { RefreshTokenService } from "../services/AuthServices/RefreshTokenService";
import FindUserFromToken from "../services/AuthServices/FindUserFromToken";
import User from "../models/User";
import { SerializeUser } from "../helpers/SerializeUser";
import { createAccessToken, createRefreshToken } from "../helpers/CreateTokens";
import Company from "../models/Company";
import Setting from "../models/Setting";
import Translation from "../models/Translation";
import { validateClientProductLogin, getClientDetails } from "../services/WhmcsService"; // Importar getClientDetails
import { logger } from "../utils/logger";
import Plan from "../models/Plan";
import CreateUserService from "../services/UserServices/CreateUserService"; // Importar CreateUserService
import CreateCompanyService from "../services/CompanyService/CreateCompanyService"; // Importar CreateCompanyService

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;
  let originalError: Error | null = null;

  try {
    // --- TENTATIVA 1: LOGIN NORMAL (OPERADORES, ADMINS) ---
    const { token, serializedUser, refreshToken } = await AuthUserService({
      email,
      password
    });

    SendRefreshToken(res, refreshToken);

    const io = getIO();
    io.to(`user-${serializedUser.id}`).emit(
      `company-${serializedUser.companyId}-auth`,
      {
        action: "update",
        user: {
          id: serializedUser.id,
          email: serializedUser.email,
          companyId: serializedUser.companyId
        }
      }
    );

    return res.status(200).json({
      token,
      user: serializedUser
    });

  } catch (err) {
    originalError = err;
    // Se o login normal falhar, não retorna erro ainda.
    logger.warn(`Normal login failed for ${email}. Attempting WHMCS fallback...`);

    try {
      // --- TENTATIVA 2: FALLBACK PARA LOGIN VIA WHMCS (CLIENTE FINAL) ---
      const { clientId, productId: whmcsProductId, nextDueDate } = await validateClientProductLogin(email, password);

      let company = await Company.findOne({ where: { whmcsClientId: clientId } });
      let user: User;

      if (!company) {
        logger.info(`[WHMCS] Company not found for client ID: ${clientId}. Attempting to create new company.`);

        // Obter detalhes do cliente no WHMCS para o nome da empresa
        const clientDetails = await getClientDetails(clientId);
        const companyName = (clientDetails?.companyname?.trim())
          ? clientDetails.companyname.trim()
          : `${clientDetails?.firstname} ${clientDetails?.lastname}`.trim() || `WHMCS Client ${clientId}`;

        // Encontrar o plano correspondente no RC-CHAT
        const plan = await Plan.findOne({ where: { whmcsProductId } });
        if (!plan) {
          throw new AppError(`[WHMCS] Product ID ${whmcsProductId} not mapped to any plan in RC-CHAT.`, 404);
        }

        // Criar a nova empresa no RC-CHAT
        company = await CreateCompanyService({
          name: companyName,
          planId: plan.id,
          whmcsClientId: clientId,
          dueDate: nextDueDate
        });
        logger.info(`[WHMCS] New company '${company.name}' created with ID: ${company.id} and WHMCS Client ID: ${company.whmcsClientId}`);

        // Criar um usuário administrador padrão para a nova empresa
        const createdAdmin = await CreateUserService({
          name: "Admin WHMCS", // Nome padrão para o admin da empresa WHMCS
          email: email, // Usar o email do WHMCS como email do admin
          password: Math.random().toString(36).substring(2, 15), // Gerar uma senha aleatória
          profile: "admin",
          companyId: company.id
        });
        // Recuperar o modelo completo do usuário para uso na criação dos tokens
        user = await User.findByPk(createdAdmin.id);
        if (!user) {
          // fallback por chave de e-mail caso o PK não esteja disponível por algum motivo
          user = await User.findOne({ where: { email } });
        }
        if (!user) {
          throw new AppError("ERR_NO_USER_FOUND", 404);
        }
        logger.info(`[WHMCS] Admin user '${createdAdmin.email}' created for new company ID: ${company.id}`);

      } else {
        // Se a empresa já existe, sincronizar o plano e encontrar/criar o usuário admin
        const plan = await Plan.findOne({ where: { whmcsProductId } });
        if (plan && company.planId !== plan.id) {
          logger.info(`[WHMCS] Syncing plan for company ${company.id}. Old: ${company.planId}, New: ${plan.id}`);
          company.planId = plan.id;
          await company.save();
        }

        user = await User.findOne({
          where: { companyId: company.id, profile: "admin" },
          order: [["createdAt", "ASC"]]
        });

        if (!user) {
          logger.info(`[WHMCS] Company ${company.id} found, but no admin user configured. Attempting to create one.`);
          // Criar um usuário administrador padrão para a empresa existente
          const createdAdmin = await CreateUserService({
            name: "Admin WHMCS", // Nome padrão para o admin da empresa WHMCS
            email: email, // Usar o email do WHMCS como email do admin
            password: Math.random().toString(36).substring(2, 15), // Gerar uma senha aleatória
            profile: "admin",
            companyId: company.id
          });
          // Recuperar o modelo completo do usuário para uso na criação dos tokens
          user = await User.findByPk(createdAdmin.id);
          if (!user) {
            // fallback por chave de e-mail caso o PK não esteja disponível por algum motivo
            user = await User.findOne({ where: { email } });
          }
          if (!user) {
            throw new AppError("ERR_NO_USER_FOUND_AFTER_CREATION", 404); // Alterado para clareza
          }
          logger.info(`[WHMCS] Admin user '${createdAdmin.email}' created for existing company ID: ${company.id}`);
        }
      }

      // Gerar a sessão para o usuário admin encontrado ou recém-criado
      const token = createAccessToken(user);
      const refreshToken = createRefreshToken(user);
      const serializedUser = await SerializeUser(user);

      SendRefreshToken(res, refreshToken);

      return res.status(200).json({
        token,
        user: serializedUser
      });

    } catch (whmcsErr) {
      // Se o fallback do WHMCS também falhar, agora sim retornamos o erro.
      logger.warn({ err: whmcsErr.message }, `WHMCS fallback failed for ${email}.`);
      throw originalError || new AppError("ERR_INVALID_CREDENTIALS", 401);
    }
  }
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const token: string = req.cookies.jrt;

  if (!token) {
    throw new AppError("ERR_UNAUTHORIZED", 401);
  }

  const { user, newToken, refreshToken } = await RefreshTokenService(
    res,
    token
  );

  SendRefreshToken(res, refreshToken);

  return res.json({ token: newToken, user });
};

export const me = async (req: Request, res: Response): Promise<Response> => {
  const token: string = req.cookies.jrt;
  const user = await FindUserFromToken(token);
  const { id, profile, email, super: superAdmin } = user;

  if (!token) {
    throw new AppError("ERR_UNAUTHORIZED", 401);
  }

  return res.json({ id, profile, email, super: superAdmin });
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  res.clearCookie("jrt");

  return res.send();
};

export const impersonate = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const token: string = req.cookies.jrt;
  const { companyId } = req.params;

  if (!token) {
    throw new AppError("ERR_UNAUTHORIZED", 401);
  }

  const user = await User.findOne({
    where: { companyId: Number(companyId), profile: "admin" },
    include: ["queues", { model: Company, include: [{ model: Setting }] }]
  });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  const newToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  const serializedUser = await SerializeUser(user);

  SendRefreshToken(res, refreshToken);

  const io = getIO();
  io.to(`user-${serializedUser.id}`).emit(
    `company-${serializedUser.companyId}-auth`,
    {
      action: "update",
      user: {
        id: serializedUser.id,
        email: serializedUser.email,
        companyId: serializedUser.companyId,
        impersonated: true
      }
    }
  );

  return res.status(200).json({
    token: newToken,
    user: serializedUser
  });
};
