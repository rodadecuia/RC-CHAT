import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import ProvisionWhmcsService from "../services/WhmcsServices/ProvisionWhmcsService";
import { logger } from "../utils/logger";

export const provisionService = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    clientid,
    serviceid,
    status, // Active, Suspended, Terminated, Fraud
    domain, // Opcional, pode ser o nome da companhia
    // Outros dados do WHMCS que podem ser úteis
  } = req.body;

  const schema = Yup.object().shape({
    clientid: Yup.number().required(),
    serviceid: Yup.number().required(),
    status: Yup.string().oneOf(["Active", "Suspended", "Terminated", "Fraud"]).required(),
  });

  try {
    await schema.validate(req.body);
  } catch (err: any) {
    logger.warn({ body: req.body, err: err.message }, "WHMCS Webhook: Invalid payload received.");
    throw new AppError(err.message, 400);
  }

  try {
    await ProvisionWhmcsService({
      whmcsClientId: clientid,
      whmcsProductId: serviceid,
      whmcsStatus: status,
      companyName: domain, // Usar domain como nome da companhia se disponível
    });

    return res.status(200).json({ message: "Webhook processed successfully." });
  } catch (error) {
    logger.error({ err: error, body: req.body }, "Error processing WHMCS webhook.");
    throw new AppError("Error processing webhook.", 500);
  }
};
