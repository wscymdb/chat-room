export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export const ROLE_NAMES = {
  [UserRole.SUPER_ADMIN]: "超级管理员",
  [UserRole.ADMIN]: "管理员",
  [UserRole.USER]: "普通用户",
};
