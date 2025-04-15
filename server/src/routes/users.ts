import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { readData, writeData } from "../utils/fileStorage";
import { User, UserRole } from "../types/auth";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

export const userRoutes = express.Router();

// 获取用户列表
userRoutes.get(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const data = await readData();
      const sanitizedUsers = data.users.map(
        ({ password, ...user }: User) => user
      );
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "获取用户列表失败" });
    }
  }
);

// 添加新用户
userRoutes.post(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const {
        username,
        password,
        role,
      }: { username: string; password: string; role: UserRole } = req.body;
      const data = await readData();

      // 检查用户名是否已存在
      if (data.users.some((user: User) => user.username === username)) {
        return res.status(400).json({ message: "用户名已存在" });
      }

      // 检查权限
      const requestUser = req.user as User;
      if (
        requestUser.role !== UserRole.SUPER_ADMIN &&
        role === UserRole.ADMIN
      ) {
        return res.status(403).json({ message: "无权创建管理员用户" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser: User = {
        id: uuidv4(),
        username,
        password: hashedPassword,
        role,
      };

      data.users.push(newUser);
      await writeData(data);

      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "创建用户失败" });
    }
  }
);

// 更新用户信息
userRoutes.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData: Partial<User> = req.body;
      const data = await readData();

      const userIndex = data.users.findIndex((user: User) => user.id === id);
      if (userIndex === -1) {
        return res.status(404).json({ message: "用户不存在" });
      }

      // 不允许修改超级管理员
      if (data.users[userIndex].role === UserRole.SUPER_ADMIN) {
        return res.status(403).json({ message: "不能修改超级管理员" });
      }

      // 如果要更新密码，需要加密
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      data.users[userIndex] = { ...data.users[userIndex], ...updateData };
      await writeData(data);

      const { password: _, ...userWithoutPassword } = data.users[userIndex];
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "更新用户失败" });
    }
  }
);

// 删除用户
userRoutes.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await readData();

      const userToDelete = data.users.find((user: User) => user.id === id);
      if (!userToDelete) {
        return res.status(404).json({ message: "用户不存在" });
      }

      // 不允许删除超级管理员
      if (userToDelete.role === UserRole.SUPER_ADMIN) {
        return res.status(403).json({ message: "不能删除超级管理员" });
      }

      data.users = data.users.filter((user: User) => user.id !== id);
      await writeData(data);

      res.json({ message: "用户已删除" });
    } catch (error) {
      res.status(500).json({ message: "删除用户失败" });
    }
  }
);
