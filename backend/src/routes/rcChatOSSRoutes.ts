import { Router } from "express";

import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isAdmin";
import * as RcChatOSSController from "../controllers/RcChatOSSController";

const rcChatOSSRoutes = Router();

rcChatOSSRoutes.get(
  "/rc-chat/registry",
  isAuth,
  isSuper,
  RcChatOSSController.show
);

rcChatOSSRoutes.post(
  "/rc-chat/registry",
  isAuth,
  isSuper,
  RcChatOSSController.store
);

export default rcChatOSSRoutes;
