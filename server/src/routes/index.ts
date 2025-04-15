import { Router } from "express";
import { authRoutes } from "./auth";
import { messageRoutes } from "./messages";
import { userRoutes } from "./users";

export const setupRoutes = (app: any) => {
  const router = Router();

  // 路由分组
  router.use("/auth", authRoutes);
  router.use("/messages", messageRoutes);
  router.use("/users", userRoutes);

  app.use("/api", router);
};
