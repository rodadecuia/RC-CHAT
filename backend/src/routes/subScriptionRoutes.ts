import express from "express";
import isAuth from "../middleware/isAuth";
import * as SubscriptionController from "../controllers/SubscriptionController";

const subscriptionRoutes = express.Router();

subscriptionRoutes.post(
  "/subscriptions",
  isAuth,
  SubscriptionController.store
);

export default subscriptionRoutes;
