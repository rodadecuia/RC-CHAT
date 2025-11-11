import express from "express";
import * as WhmcsWebhookController from "../controllers/WhmcsWebhookController";
import { webhookTokenAuth } from "../middleware/webhookTokenAuth";

const whmcsWebhookRoutes = express.Router();

whmcsWebhookRoutes.post(
  "/webhooks/whmcs/provision",
  webhookTokenAuth,
  WhmcsWebhookController.provisionService
);

export default whmcsWebhookRoutes;
