import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { readData, writeData } from "../utils/fileStorage";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const data = await readData();

    // 检查用户名是否已存在
    if (data.users.some((user: any) => user.username === username)) {
      return res.status(400).json({ message: "用户名已存在" });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const newUser = {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    data.users.push(newUser);
    await writeData(data);

    // 生成 token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error("注册错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const data = await readData();

    const user = data.users.find((user: any) => user.username === username);
    if (!user) {
      return res.status(401).json({ message: "用户名或密码错误" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "用户名或密码错误" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("登录错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "未授权" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const data = await readData();
    const user = data.users.find((user: any) => user.id === decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    res.json({
      id: user.id,
      username: user.username,
    });
  } catch (error) {
    console.error("获取用户信息错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};
