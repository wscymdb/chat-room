import api from "./api";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export interface LoginResponse {
  user: User;
  token: string;
}

/**
 * 用户API服务
 */
export const userService = {
  /**
   * 用户登录
   * @param username 用户名
   * @param password 密码
   * @returns Promise<LoginResponse>
   */
  login: async (username: string, password: string) => {
    const response = await api.post<LoginResponse>("/auth/login", {
      username,
      password,
    });
    return response.data;
  },

  /**
   * 获取所有用户
   * @returns Promise<User[]>
   */
  getAllUsers: async () => {
    const response = await api.get<User[]>("/users");
    return response.data;
  },

  /**
   * 添加用户
   * @param username 用户名
   * @param password 密码
   * @param role 角色
   * @returns Promise<User>
   */
  addUser: async (username: string, password: string, role: UserRole) => {
    const response = await api.post<User>("/users", {
      username,
      password,
      role,
    });
    return response.data;
  },

  /**
   * 更新用户
   * @param id 用户ID
   * @param data 更新数据
   * @returns Promise<User>
   */
  updateUser: async (
    id: string,
    data: Partial<User & { password?: string }>
  ) => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * 删除用户
   * @param id 用户ID
   * @returns Promise<void>
   */
  deleteUser: async (id: string) => {
    await api.delete(`/users/${id}`);
  },
};

export default userService;
