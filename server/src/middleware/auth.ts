import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, UserRole } from "../types/auth";
import { readData } from "../utils/fileStorage";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "未提供认证令牌" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as {
      userId: string;
      username: string;
    };

    const data = await readData();
    const user = data.users.find((u: User) => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "用户不存在" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "无效的认证令牌" });
  }
};

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "未认证" });
  }

  if (
    req.user.role !== UserRole.ADMIN &&
    req.user.role !== UserRole.SUPER_ADMIN
  ) {
    return res.status(403).json({ message: "需要管理员权限" });
  }

  next();
};
