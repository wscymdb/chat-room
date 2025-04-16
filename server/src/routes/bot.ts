import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
  const { message } = req.body;
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.error("未设置 DEEPSEEK_API_KEY 环境变量");
    return res.status(500).json({ error: "机器人服务配置错误" });
  }

  if (!message) {
    return res.status(400).json({ error: "消息不能为空" });
  }

  try {
    console.log("收到机器人请求:", message);
    console.log("使用的API Key:", apiKey.substring(0, 5) + "...");

    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [{ role: "user", content: message }],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    console.log("DeepSeek API响应:", response.data);

    const botResponse = response.data.choices[0].message.content;
    const tokens = {
      prompt_tokens: response.data.usage.prompt_tokens,
      completion_tokens: response.data.usage.completion_tokens,
      total_tokens: response.data.usage.total_tokens,
    };

    res.json({
      message: botResponse,
      tokens,
    });
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
