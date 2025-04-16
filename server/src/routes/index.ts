import { Router } from "express";
import { authRoutes } from "./auth";
import { messageRoutes } from "./messages";
import { userRoutes } from "./users";
import botRoutes from "./bot";

export const setupRoutes = (app: any) => {
  const router = Router();

  // 路由分组
  router.use("/auth", authRoutes);
  router.use("/messages", messageRoutes);
  router.use("/users", userRoutes);
  router.use("/bot", botRoutes);

  app.use("/api", router);
};
