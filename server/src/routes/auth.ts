import { Router } from "express";
import { register, login, getCurrentUser } from "../controllers/auth";
import bcrypt from "bcrypt";
import { readData, writeData } from "../utils/fileStorage";
import jwt from "jsonwebtoken";

interface User {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

interface Data {
  users: User[];
  messages: any[];
  onlineUsers: any[];
}

export const authRoutes = Router();

authRoutes.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = await readData();

    // 检查用户名是否已存在
    const existingUser = data.users.find(
      (user: User) => user.username === username
    );
    if (existingUser) {
      return res.status(409).json({ message: "用户名已存在" });
    }

    // 创建新用户
    const newUser: User = {
      id: Date.now().toString(),
      username,
      password: await bcrypt.hash(password, 10),
      createdAt: new Date().toISOString(),
    };

    // 保存用户数据
    data.users.push(newUser);
    await writeData(data);

    // 生成 token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      process.env.JWT_SECRET || "default-secret-key-for-development-only",
      { expiresIn: "24h" }
    );

    // 返回用户数据和 token
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("注册失败:", error);
    res.status(500).json({ message: "注册失败" });
  }
});

authRoutes.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = await readData();

    // 查找用户
    const user = data.users.find((user: User) => user.username === username);
    if (!user) {
      return res.status(401).json({ message: "用户名或密码错误" });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "用户名或密码错误" });
    }

    // 生成 token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // 返回用户数据和 token
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("登录失败:", error);
    res.status(500).json({ message: "登录失败" });
  }
});

authRoutes.get("/me", getCurrentUser);
