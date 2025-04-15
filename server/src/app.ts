import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { setupSocket } from "./socket";
import { messageRoutes } from "./routes/messages";
import { authRoutes } from "./routes/auth";

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

// 路由
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRoutes);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

setupSocket(io);

export { httpServer };
