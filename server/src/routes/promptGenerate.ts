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

// 生成系统提示词
router.post("/", async (req, res) => {
  try {
    const { currentPrompt } = req.body;

    // 构建消息列表
    const messages = [
      {
        role: MessageRole.SYSTEM,
        content:
          "你是一个专业的AI提示词优化专家。你的任务是优化或完善用户提供的系统提示词。",
      },
      {
        role: MessageRole.USER,
        content: `请基于以下提示词，创建一个更完善、更具体的系统提示词，使AI助手的回答更加有用：\n\n"${
          currentPrompt || "你是一个AI助手"
        }"\n\n只返回优化后的提示词文本，不要包含任何解释或额外信息。`,
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

      res.json({ prompt: aiResponse.content });
    } catch (apiError) {
      console.error("API调用失败，使用本地模拟函数");

      // 使用模拟响应
      const mockResponse = mockAIResponse(messages);
      res.json({ prompt: mockResponse.content });
    }
  } catch (error: unknown) {
    console.error("生成提示词失败:", error);

    if (axios.isAxiosError(error)) {
      console.error("API错误详情:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });

      res.status(error.response?.status || 500).json({
        error: "提示词生成服务暂时不可用",
        details: error.response?.data || error.message,
      });
    } else {
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      res.status(500).json({
        error: "提示词生成服务暂时不可用",
        details: errorMessage,
      });
    }
  }
});

export default router;
