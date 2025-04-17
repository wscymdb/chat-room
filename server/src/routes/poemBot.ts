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
    return res.status(500).json({ error: "诗词机器人服务配置错误" });
  }

  if (!message) {
    return res.status(400).json({ error: "消息不能为空" });
  }

  try {
    console.log("收到诗词机器人请求:", message);
    console.log("使用的API Key:", apiKey.substring(0, 5) + "...");

    // 构建提示词，引导AI生成诗词相关回复
    let prompt = "";

    // 处理"随机"请求，直接随机推荐
    if (message.trim() === "随机") {
      prompt =
        "请随机推荐一首中国古诗词，要求：\n" +
        "1. 必须是不同的诗词，不要重复推荐\n" +
        "2. 第1行必须是诗名\n" +
        "3. 第2行必须是作者名（作者不详的也请标明'作者不详'）\n" +
        "4. 第3行开始是诗句\n" +
        "5. 最后部分是解析\n" +
        "格式为：\n诗名\n作者\n\n诗句\n\n【解析】：详细解析";
    }
    // 改进作者识别规则
    else {
      // 尝试识别作者名
      // 1. 直接匹配"XX的诗词"格式
      let authorMatch = message.match(/^(.+?)的诗词?$/);

      // 2. 如果没匹配到，尝试直接将整个消息作为作者名
      if (!authorMatch && message.length < 10) {
        // 只有短消息才当作作者名，避免长文本被误识别
        authorMatch = [null, message.trim()];
      }

      if (authorMatch && authorMatch[1]) {
        const authorName = authorMatch[1].trim();
        prompt = `请随机推荐一首${authorName}的古诗词，并确保推荐的是${authorName}的作品。第1行必须是诗名，第2行必须是"${authorName}"，第3行开始是诗句，最后部分是解析。格式为：\n诗名\n${authorName}\n\n诗句\n\n【解析】：详细解析`;
      } else {
        // 如果无法识别作者，则按关键词检索
        prompt = `请根据"${message}"这个关键词，推荐一首相关的中国古诗词。第1行必须是诗名，第2行必须是作者名，第3行开始是诗句，最后部分是解析。格式为：\n诗名\n作者\n\n诗句\n\n【解析】：详细解析`;
      }
    }

    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: message.trim() === "随机" ? 1.0 : 0.7,
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
    console.error("诗词机器人API错误:", error);
    if (axios.isAxiosError(error)) {
      console.error("API错误详情:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      res.status(error.response?.status || 500).json({
        error: "诗词机器人服务暂时不可用",
        details: error.response?.data || error.message,
      });
    } else {
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      res.status(500).json({
        error: "诗词机器人服务暂时不可用",
        details: errorMessage,
      });
    }
  }
});

export default router;
