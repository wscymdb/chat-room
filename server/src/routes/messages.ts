import express from "express";
import { readData, writeData } from "../utils/fileStorage";
import { authMiddleware } from "../middleware/auth";
import { UserRole } from "../types/auth";

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender?: string;
  timestamp: string;
  username?: string;
}

interface Data {
  users: any[];
  messages: Message[];
  onlineUsers: any[];
}

export const messageRoutes = express.Router();

// 获取所有消息
messageRoutes.get("/", async (req, res) => {
  try {
    const { content, username } = req.query;
    const data = await readData();

    // 获取所有用户信息，用于关联用户名
    const users = data.users;

    // 处理消息，添加用户名
    let messages = data.messages.map((msg: Message) => {
      return {
        ...msg,
        sender: msg.username || "未知用户",
      };
    });

    // 根据搜索条件过滤消息
    if (content) {
      messages = messages.filter((msg: Message) =>
        msg.content.toLowerCase().includes((content as string).toLowerCase())
      );
    }

    if (username) {
      messages = messages.filter((msg: Message) =>
        msg.sender?.toLowerCase().includes((username as string).toLowerCase())
      );
    }

    // 按时间戳正序排序
    messages = messages.sort(
      (a: Message, b: Message) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    res.json(messages);
  } catch (error) {
    console.error("获取消息失败:", error);
    res.status(500).json({ message: "获取消息失败" });
  }
});

// 获取所有用户名列表
messageRoutes.get("/usernames", async (req, res) => {
  try {
    const data = await readData();
    const usernames = data.users.map((user: any) => ({
      value: user.username,
      label: user.username,
    }));
    res.json(usernames);
  } catch (error) {
    console.error("获取用户名列表失败:", error);
    res.status(500).json({ message: "获取用户名列表失败" });
  }
});

// 发送新消息
messageRoutes.post("/", async (req, res) => {
  try {
    const { content, senderId } = req.body;
    const data = await readData();

    const newMessage = {
      id: Date.now().toString(),
      content,
      senderId,
      timestamp: new Date().toISOString(),
    };

    data.messages.push(newMessage);
    await writeData(data);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("发送消息失败:", error);
    res.status(500).json({ message: "发送消息失败" });
  }
});

// 删除消息
messageRoutes.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readData();

    // 找到要删除的消息索引
    const messageIndex = data.messages.findIndex((msg: any) => msg.id === id);

    if (messageIndex === -1) {
      return res.status(404).json({ message: "消息不存在" });
    }

    // 删除消息
    data.messages.splice(messageIndex, 1);
    await writeData(data);

    res.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除消息失败:", error);
    res.status(500).json({ message: "删除消息失败" });
  }
});

// 删除所有消息 (仅超级管理员可用)
messageRoutes.delete("/all/clear", authMiddleware, async (req, res) => {
  try {
    // 检查用户权限，只有超级管理员才能执行此操作
    if (req.user?.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({
        message: "权限不足，只有超级管理员可以清空所有消息",
      });
    }

    const data = await readData();

    // 备份删除前的消息数量
    const deletedCount = data.messages.length;

    // 清空消息列表
    data.messages = [];
    await writeData(data);

    res.json({
      message: "所有消息已删除",
      count: deletedCount,
    });
  } catch (error) {
    console.error("删除所有消息失败:", error);
    res.status(500).json({ message: "删除所有消息失败" });
  }
});
