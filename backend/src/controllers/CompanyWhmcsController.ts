import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import Company from "../models/Company";
import WhmcsService from "../services/WhmcsServices/WhmcsService";
import { logger } from "../utils/logger";

export const updateWhmcsStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.params;
  const { whmcsStatus, updateRcChatStatus } = req.body; // whmcsStatus: Active, Inactive, Closed, Suspended

  const schema = Yup.object().shape({
    whmcsStatus: Yup.string()
      .oneOf(["Active", "Inactive", "Closed", "Suspended"])
      .required(),
    updateRcChatStatus: Yup.boolean()
  });

  try {
    await schema.validate(req.body);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const company = await Company.findByPk(companyId);

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  if (!company.whmcsClientId) {
    throw new AppError(
      "Company is not linked to a WHMCS client. Please link the company first.",
      400
    );
  }

  try {
    const whmcsResponse = await WhmcsService.execute({
      action: "UpdateClient",
      clientid: company.whmcsClientId,
      status: whmcsStatus
    });

    if (whmcsResponse && whmcsResponse.result === "success") {
      logger.info(
        `WHMCS Client ${company.whmcsClientId} status updated to ${whmcsStatus}.`
      );

      if (updateRcChatStatus) {
        let rcChatStatus = true; // Active
        if (whmcsStatus === "Inactive" || whmcsStatus === "Closed" || whmcsStatus === "Suspended") {
          rcChatStatus = false;
        }
        await company.update({ status: rcChatStatus });
        logger.info(`RC-CHAT Company ${company.id} status updated to ${rcChatStatus}.`);
      }

      return res.status(200).json({ message: "WHMCS client status updated successfully." });
    } else {
      throw new AppError(
        whmcsResponse?.message || "Failed to update WHMCS client status.",
        500
      );
    }
  } catch (error) {
    logger.error({ err: error }, "Error updating WHMCS client status.");
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to update WHMCS client status.", 500);
  }
};
