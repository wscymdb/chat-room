import React, { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { Message, User } from "../types/message";
import { createSocketConnection } from "../services/socket";

interface SocketContextType {
  messages: Message[];
  onlineUsers: User[];
  sendMessage: (content: string) => void;
  socket: Socket | null;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const newSocket = createSocketConnection({
      userId: user.id,
      username: user.username,
      // avatar: user.avatar,
    });

    setSocket(newSocket);

    newSocket.on("message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
      // 如果当前窗口不是活动窗口，显示新消息提示
      if (document.hidden) {
        updateTitle(true);
      }
    });

    newSocket.on("messages", (historyMessages: Message[]) => {
      setMessages(historyMessages);
    });

    newSocket.on("users", (users: User[]) => {
      setOnlineUsers(users);
    });

    newSocket.on(
      "userTyping",
      (typingUser: { id: string; isTyping: boolean }) => {
        setOnlineUsers((prev) =>
          prev.map((user) =>
            user.id === typingUser.id
              ? { ...user, isTyping: typingUser.isTyping }
              : user
          )
        );
      }
    );

    // 监听窗口可见性变化
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateTitle(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      newSocket.close();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  const sendMessage = (content: string) => {
    if (socket && user) {
      const message: Omit<Message, "id" | "timestamp" | "type"> = {
        content,
        userId: user.id,
        username: user.username,
      };
      socket.emit("message", message, (response: { success: boolean }) => {
        if (!response.success) {
          console.error("消息发送失败");
        }
      });
    }
  };

  const value = {
    messages,
    onlineUsers,
    sendMessage,
    socket,
    setMessages,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

// 创建并更新 favicon
const updateTitle = (hasNewMessage: boolean) => {
  if (hasNewMessage) {
    document.title = "🟢 聊天室";
  } else {
    document.title = "聊天室";
  }
};
