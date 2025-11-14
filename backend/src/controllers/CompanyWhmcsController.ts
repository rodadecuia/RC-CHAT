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
  const { whmcsStatus, updateRcChatStatus, syncDueDate } = req.body; // whmcsStatus: Active, Inactive, Closed, Suspended

  const schema = Yup.object().shape({
    whmcsStatus: Yup.string()
      .oneOf(["Active", "Inactive", "Closed", "Suspended"])
      .notRequired(),
    updateRcChatStatus: Yup.boolean(),
    syncDueDate: Yup.boolean()
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
    if (whmcsStatus) {
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
      } else {
        throw new AppError(
          whmcsResponse?.message || "Failed to update WHMCS client status.",
          500
        );
      }
    }

    if (syncDueDate) {
      const productsResponse = await WhmcsService.execute({
        action: "GetClientsProducts",
        clientid: company.whmcsClientId,
        status: "Active"
      });

      if (productsResponse && productsResponse.products && productsResponse.products.product) {
        const clientProducts = Array.isArray(productsResponse.products.product)
          ? productsResponse.products.product
          : [productsResponse.products.product];

        const plan = await company.$get("plan");
        const whmcsProductId = plan.whmcsProductId;

        const product = clientProducts.find(p => p.pid === whmcsProductId);

        if (product && product.nextduedate) {
          await company.update({ dueDate: product.nextduedate });
          logger.info(`RC-CHAT Company ${company.id} due date updated to ${product.nextduedate}.`);
        }
      }
    }

    return res.status(200).json({ message: "WHMCS sync completed successfully." });

  } catch (error) {
    logger.error({ err: error }, "Error during WHMCS sync.");
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to sync with WHMCS.", 500);
  }
};
