import { Router } from "express";
import { authRoutes } from "./auth";
import { messageRoutes } from "./messages";
import { userRoutes } from "./users";
import botRoutes from "./bot";
import poemBotRoutes from "./poemBot";
import botConfigRoutes from "./botConfig";
import promptGenerateRoutes from "./promptGenerate";

export const setupRoutes = (app: any) => {
  const router = Router();

  // 路由分组
  router.use("/auth", authRoutes);
  router.use("/messages", messageRoutes);
  router.use("/users", userRoutes);
  router.use("/bot", botRoutes);
  router.use("/poemBot", poemBotRoutes);
  router.use("/bot-config", botConfigRoutes);
  router.use("/generate-prompt", promptGenerateRoutes);

  app.use("/api", router);
};
