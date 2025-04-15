import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: { username: string; password: string }) => Promise<void>;
  logout: () => void;
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
    try {
      const savedUser = localStorage.getItem("user");
      if (!savedUser) return null;

      const parsedUser = JSON.parse(savedUser);
      // 验证解析后的数据是否符合 User 接口
      if (
        !parsedUser ||
        typeof parsedUser !== "object" ||
        !parsedUser.id ||
        !parsedUser.username
      ) {
        throw new Error("Invalid user data format");
      }
      return parsedUser;
    } catch (error) {
      console.error("解析用户数据失败:", error);
      // 清除无效数据
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  // 设置 axios 默认请求头
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      console.log("开始登录...");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          username,
          password,
        }
      );

      const { user, token } = response.data;
      console.log("登录成功:", { user, token });

      // 保存到 localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      // 更新状态
      setUser(user);
      setToken(token);
    } catch (error: any) {
      console.error("登录失败:", error);
      throw new Error(error.response?.data?.message || "登录失败");
    }
  };

  const register = async (data: { username: string; password: string }) => {
    try {
      console.log("开始注册...");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        data
      );

      const { user, token } = response.data;
      console.log("注册成功:", { user, token });

      // 保存到 localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      // 更新状态
      setUser(user);
      setToken(token);
    } catch (error: any) {
      console.error("注册失败:", error);
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        throw new Error(errorMessage);
      } else if (error.response?.status === 409) {
        throw new Error("用户名已存在");
      } else if (error.response?.status === 400) {
        throw new Error("输入数据无效");
      } else {
        throw new Error("注册失败，请稍后重试");
      }
    }
  };

  const logout = () => {
    console.log("登出...");
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
