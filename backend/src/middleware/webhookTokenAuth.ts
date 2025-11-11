import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

export const webhookTokenAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["x-whmcs-webhook-token"] || req.query.token;

  if (!token || token !== process.env.WHMCS_WEBHOOK_TOKEN) {
    throw new AppError("Unauthorized webhook access.", 401);
  }

  next();
};
