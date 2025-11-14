import express from "express";
import isAuth from "../middleware/isAuth";

import * as DashboardController from "../controllers/DashboardController";
import isAdmin from "../middleware/isAdmin";
import isCompliant from "../middleware/isCompliant";

const routes = express.Router();

routes.get(
  "/dashboard/status",
  isAuth,
  isAdmin,
  isCompliant,
  DashboardController.statusSummary
);

routes.get(
  "/dashboard/tickets",
  isAuth,
  isAdmin,
  isCompliant,
  DashboardController.ticketsStatistic
);

routes.get(
  "/dashboard/users",
  isAuth,
  isAdmin,
  isCompliant,
  DashboardController.usersReport
);

routes.get(
  "/dashboard/ratings",
  isAuth,
  isAdmin,
  isCompliant,
  DashboardController.ratingsReport
);

routes.get(
  "/dashboard/contacts",
  isAuth,
  isAdmin,
  isCompliant,
  DashboardController.contactsReport
);

// Nova rota para obter informações de ativação do sistema
routes.get(
  "/dashboard/activation-info",
  isAuth,
  isAdmin, // Apenas administradores devem poder ver/configurar isso
  DashboardController.getActivationInfo
);

// Nova rota para atualizar informações de ativação do sistema
routes.put(
  "/dashboard/activation-info",
  isAuth,
  isAdmin, // Apenas administradores devem poder configurar isso
  DashboardController.updateActivationInfo
);

export default routes;
