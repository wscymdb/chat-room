import { Router } from "express";
import { readData, writeData } from "../utils/fileStorage";

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
}

interface Data {
  users: any[];
  messages: Message[];
  onlineUsers: any[];
}

export const messageRoutes = Router();

// 获取所有消息
messageRoutes.get("/", async (req, res) => {
  try {
    const data = await readData();
    res.json(data.messages);
  } catch (error) {
    console.error("获取消息失败:", error);
    res.status(500).json({ message: "获取消息失败" });
  }
});

// 发送新消息
messageRoutes.post("/", async (req, res) => {
  try {
    const { content, senderId } = req.body;
    const data = await readData();

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      senderId,
      timestamp: new Date().toISOString(),
    };

    // 保存消息
    data.messages.push(newMessage);
    await writeData(data);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("发送消息失败:", error);
    res.status(500).json({ message: "发送消息失败" });
  }
});
