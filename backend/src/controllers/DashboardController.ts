import { Request, Response } from "express";

import {
  DashboardDateRange,
  statusSummaryService,
  ticketsStatisticsService,
  usersReportService,
  ratingsReportService,
  contactsReportService,
} from "../services/ReportService/DashboardService";
import Setting from "../models/Setting"; // Importar o modelo Setting
import { getSystemActivationDetails, validateSystemActivation } from "../services/WhmcsServices/rc-api-lic"; // Importar o serviço de ativação e a função de validação

// Constantes para as chaves das configurações
const WHMCS_ACTIVATION_KEY_SETTING = 'whmcsActivationKey';
const WHMCS_ACTIVATION_VALIDATION_URL_SETTING = 'whmcsActivationValidationUrl';

export const ticketsStatistic = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const params: DashboardDateRange = req.query;
  const { companyId } = req.user;

  const result = await ticketsStatisticsService(companyId, params);
  return res.status(200).json(result);
};

export const usersReport = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const params: DashboardDateRange = req.query;
  const { companyId } = req.user;

  const result = await usersReportService(companyId, params);
  return res.status(200).json(result);
};

export const statusSummary = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;

  const dashboardData = await statusSummaryService(companyId);
  return res.status(200).json(dashboardData);
};

export const ratingsReport = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const params: DashboardDateRange = req.query;
  const { companyId } = req.user;

  const result = await ratingsReportService(companyId, params);
  return res.status(200).json(result);
};

export const contactsReport = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const params: DashboardDateRange = req.query;
  const { companyId } = req.user;

  const result = await contactsReportService(companyId, params);
  return res.status(200).json(result);
};

// Endpoint para obter informações de ativação
export const getActivationInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const activationKeySetting = await Setting.findOne({ where: { key: WHMCS_ACTIVATION_KEY_SETTING } });
  const validationUrlSetting = await Setting.findOne({ where: { key: WHMCS_ACTIVATION_VALIDATION_URL_SETTING } });
  const systemActivationDetails = await getSystemActivationDetails();

  return res.status(200).json({
    whmcsActivationKey: activationKeySetting ? activationKeySetting.value : null,
    whmcsActivationValidationUrl: validationUrlSetting ? validationUrlSetting.value : null,
    systemActivationDetails: systemActivationDetails
  });
};

// Novo endpoint para atualizar informações de ativação
export const updateActivationInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whmcsActivationKey, whmcsActivationValidationUrl } = req.body;

  // Atualiza ou cria a chave de ativação
  await Setting.upsert({
    key: WHMCS_ACTIVATION_KEY_SETTING,
    value: whmcsActivationKey || '' // Garante que não seja null/undefined
  });

  // Atualiza ou cria a URL de validação
  await Setting.upsert({
    key: WHMCS_ACTIVATION_VALIDATION_URL_SETTING,
    value: whmcsActivationValidationUrl || '' // Garante que não seja null/undefined
  });

  // Revalida a ativação do sistema com as novas configurações
  await validateSystemActivation();

  // Retorna as informações atualizadas
  const activationKeySetting = await Setting.findOne({ where: { key: WHMCS_ACTIVATION_KEY_SETTING } });
  const validationUrlSetting = await Setting.findOne({ where: { key: WHMCS_ACTIVATION_VALIDATION_URL_SETTING } });
  const systemActivationDetails = await getSystemActivationDetails();

  return res.status(200).json({
    whmcsActivationKey: activationKeySetting ? activationKeySetting.value : null,
    whmcsActivationValidationUrl: validationUrlSetting ? validationUrlSetting.value : null,
    systemActivationDetails: systemActivationDetails
  });
};
