import express from "express";
import fs from "fs";
import path from "path";
import { getDataFilePath } from "../utils/fileStorage";

const router = express.Router();

const CONFIG_FILE = getDataFilePath("bot-config.json");
console.log("机器人配置文件路径:", CONFIG_FILE);

// 确保配置文件存在
if (!fs.existsSync(CONFIG_FILE)) {
  const defaultConfig = {
    temperature: 0.7,
    maxTokens: 1500,
    topP: 0.9,
    frequencyPenalty: 0.5,
    presencePenalty: 0.5,
    systemPrompt:
      "你是一个专业的AI助手，请用简洁明了的语言回答用户的问题。回答要准确、专业，同时保持友好和易于理解。如果遇到不确定的问题，请诚实地告诉用户。",
  };

  // 创建数据目录（如果不存在）
  const dataDir = path.dirname(CONFIG_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
}

// 获取配置
router.get("/", (req, res) => {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    res.json(config);
  } catch (error) {
    console.error("读取配置失败:", error);
    res.status(500).json({ error: "读取配置失败" });
  }
});

// 更新配置
router.post("/", (req, res) => {
  try {
    const {
      temperature,
      maxTokens,
      topP,
      frequencyPenalty,
      presencePenalty,
      systemPrompt,
    } = req.body;

    // 验证配置值
    if (typeof temperature !== "number" || temperature < 0 || temperature > 2) {
      return res.status(400).json({ error: "无效的 temperature 值" });
    }

    if (typeof maxTokens !== "number" || maxTokens < 100 || maxTokens > 4000) {
      return res.status(400).json({ error: "无效的 maxTokens 值" });
    }

    if (typeof topP !== "number" || topP < 0 || topP > 1) {
      return res.status(400).json({ error: "无效的 topP 值" });
    }

    if (
      typeof frequencyPenalty !== "number" ||
      frequencyPenalty < -2 ||
      frequencyPenalty > 2
    ) {
      return res.status(400).json({ error: "无效的 frequencyPenalty 值" });
    }

    if (
      typeof presencePenalty !== "number" ||
      presencePenalty < -2 ||
      presencePenalty > 2
    ) {
      return res.status(400).json({ error: "无效的 presencePenalty 值" });
    }

    if (typeof systemPrompt !== "string" || !systemPrompt.trim()) {
      return res.status(400).json({ error: "无效的 systemPrompt 值" });
    }

    const config = {
      temperature,
      maxTokens,
      topP,
      frequencyPenalty,
      presencePenalty,
      systemPrompt,
    };

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    res.json(config);
  } catch (error) {
    console.error("保存配置失败:", error);
    res.status(500).json({ error: "保存配置失败" });
  }
});

export default router;
