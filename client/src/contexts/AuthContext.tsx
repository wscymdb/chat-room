import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { UserRole, User } from "../types/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { username, password }
      );

      const { user: userData, token: newToken } = response.data;

      // 使用服务器返回的用户数据，包括角色
      setUser(userData);
      setToken(newToken);

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", newToken);

      // 设置 axios 默认 headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.response?.data?.message || "登录失败");
    }
  };

  const register = async (data: { username: string; password: string }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Register error:", error);
      throw new Error(error.response?.data?.message || "注册失败");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!user) return false;

    const roleHierarchy = {
      [UserRole.SUPER_ADMIN]: 3,
      [UserRole.ADMIN]: 2,
      [UserRole.USER]: 1,
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);

  const value = {
    user,
    token,
    login,
    register,
    logout,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
