import express from "express";
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

export const messageRoutes = express.Router();

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
