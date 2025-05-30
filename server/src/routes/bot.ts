import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import {
  generateAIResponse,
  mockAIResponse,
  MessageRole,
  AIModelType,
} from "../services/aiService";

dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "消息不能为空" });
  }

  try {
    console.log("收到机器人请求:", message);

    // 构建消息列表
    const messages = [
      {
        role: MessageRole.USER,
        content: message,
      },
    ];

    try {
      // 调用AI服务
      const aiResponse = await generateAIResponse(
        messages,
        AIModelType.DEEPSEEK,
        {
          temperature: 0.7,
          max_tokens: 1000,
        }
      );

      res.json({
        message: aiResponse.content,
        tokens: aiResponse.usage,
      });
    } catch (apiError) {
      console.error("API调用失败，使用本地模拟函数");

      // 使用模拟响应
      const mockResponse = mockAIResponse(messages);
      res.json({
        message: mockResponse.content,
        tokens: mockResponse.usage,
      });
    }
  } catch (error: unknown) {
    console.error("机器人API错误:", error);
    if (axios.isAxiosError(error)) {
      console.error("API错误详情:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      res.status(error.response?.status || 500).json({
        error: "机器人服务暂时不可用",
        details: error.response?.data || error.message,
      });
    } else {
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      res.status(500).json({
        error: "机器人服务暂时不可用",
        details: errorMessage,
      });
    }
  }
});

export default router;
