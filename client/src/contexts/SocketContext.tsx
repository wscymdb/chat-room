import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface Message {
  id: string;
  content: string;
  userId: string;
  username: string;
  timestamp: number;
}

interface User {
  id: string;
  username: string;
  isTyping?: boolean;
}

interface SocketContextType {
  messages: Message[];
  onlineUsers: User[];
  sendMessage: (content: string) => void;
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

    const newSocket = io(import.meta.env.VITE_API_URL, {
      query: {
        userId: user.id,
        username: user.username,
        // avatar: user.avatar,
      },
    });

    setSocket(newSocket);

    newSocket.on("message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
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

    return () => {
      newSocket.close();
    };
  }, [user]);

  const sendMessage = (content: string) => {
    if (socket && user) {
      const message: Omit<Message, "id" | "timestamp"> = {
        content,
        userId: user.id,
        username: user.username,
      };
      socket.emit("message", message);
    }
  };

  const value = {
    messages,
    onlineUsers,
    sendMessage,
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
