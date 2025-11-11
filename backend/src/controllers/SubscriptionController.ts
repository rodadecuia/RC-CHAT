import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import CreateWebpushSubscriptionService from "../services/WebpushSubscriptionServices/CreateWebpushSubscriptionService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId } = req.user;
  const { endpoint, p256dh, auth } = req.body;

  const schema = Yup.object().shape({
    endpoint: Yup.string().required(),
    p256dh: Yup.string().required(),
    auth: Yup.string().required()
  });

  try {
    await schema.validate(req.body);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const subscription = await CreateWebpushSubscriptionService({
    userId,
    endpoint,
    p256dh,
    auth
  });

  return res.status(200).json(subscription);
};
