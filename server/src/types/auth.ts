export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
}

// 扩展 Express 的 Request 类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
