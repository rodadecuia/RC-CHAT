import express from "express";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";
import * as CompanyWhmcsController from "../controllers/CompanyWhmcsController";

const companyWhmcsRoutes = express.Router();

companyWhmcsRoutes.put(
  "/companies/:companyId/whmcs-status",
  isAuth,
  isAdmin,
  CompanyWhmcsController.updateWhmcsStatus
);

export default companyWhmcsRoutes;
