import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { setupRoutes } from "./routes/index";
import { setupSocket } from "./socket";
import fs from "fs";

// 配置 dotenv 从项目根目录读取 .env 文件
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://110.40.153.4:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
  allowEIO3: true,
});

// 中间件
app.use(express.json());
app.use(
  cors({
    origin: ["http://110.40.153.4:3000", "http://localhost:5173"],
    credentials: true,
  })
);

// 设置静态资源目录
const publicPath = path.join(__dirname, "public");
console.log("静态资源目录路径:", publicPath);

// 检查 public 目录是否存在
if (!fs.existsSync(publicPath)) {
  console.log("创建 public 目录");
  fs.mkdirSync(publicPath, { recursive: true });
}

// 设置静态资源服务
app.use(express.static(publicPath));

// 设置 API 路由
app.use("/api", (req, res, next) => {
  console.log("API 请求:", req.path);
  next();
});

// 设置路由
setupRoutes(app);

// 添加默认路由，确保访问根路径时返回 index.html
app.get("/*", (req, res) => {
  console.log("访问了默认路由");
  console.log("请求路径:", req.path);
  console.log("publicPath:", publicPath);
  const indexPath = path.join(publicPath, "index.html");

  if (!fs.existsSync(indexPath)) {
    console.log("index.html 不存在:", indexPath);
    return res.status(404).send("找不到 index.html");
  }

  console.log("提供 index.html:", indexPath);
  res.sendFile(indexPath);
});

// 设置 Socket.IO
setupSocket(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`静态资源目录已设置在: ${publicPath}`);
  console.log("可用的路由:");
  console.log("- /api/*: API 路由");
  console.log("- /*: 静态资源和前端路由");
});
