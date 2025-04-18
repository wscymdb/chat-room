import express from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getDataFilePath } from "../utils/fileStorage";

const router = express.Router();

// 预设接口
interface PromptPreset {
  id: string;
  name: string;
  content: string;
}

// 存储预设的文件路径
const PRESETS_FILE = getDataFilePath("prompt-presets.json");
console.log("预设文件路径:", PRESETS_FILE);
console.log("当前环境:", process.env.NODE_ENV || "development");

// 读取所有预设
router.get("/", (req, res) => {
  try {
    // 确认文件存在
    if (!fs.existsSync(PRESETS_FILE)) {
      console.error(`提示词预设文件不存在: ${PRESETS_FILE}`);
      return res.status(404).json({ error: "提示词预设文件不存在" });
    }

    const presets = JSON.parse(
      fs.readFileSync(PRESETS_FILE, "utf-8")
    ) as PromptPreset[];

    // 将预设数据倒序排列
    const reversedPresets = [...presets].reverse();

    res.json(reversedPresets);
  } catch (error) {
    console.error("读取预设失败:", error);
    res.status(500).json({ error: "读取预设失败" });
  }
});

// 添加新预设
router.post("/", (req, res) => {
  try {
    const { name, content } = req.body;

    // 验证输入
    if (!name || !content) {
      return res.status(400).json({ error: "名称和内容不能为空" });
    }

    // 确认文件存在
    if (!fs.existsSync(PRESETS_FILE)) {
      console.error(`提示词预设文件不存在: ${PRESETS_FILE}`);
      return res.status(404).json({ error: "提示词预设文件不存在" });
    }

    // 读取现有预设
    const presets = JSON.parse(
      fs.readFileSync(PRESETS_FILE, "utf-8")
    ) as PromptPreset[];

    // 创建新预设
    const newPreset: PromptPreset = {
      id: uuidv4(), // 生成唯一ID
      name,
      content,
    };

    // 添加到预设列表
    presets.push(newPreset);

    // 保存到文件
    fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2));

    res.status(201).json(newPreset);
  } catch (error) {
    console.error("添加预设失败:", error);
    res.status(500).json({ error: "添加预设失败" });
  }
});

// 更新预设
router.put("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { name, content } = req.body;

    // 验证输入
    if (!name || !content) {
      return res.status(400).json({ error: "名称和内容不能为空" });
    }

    // 确认文件存在
    if (!fs.existsSync(PRESETS_FILE)) {
      console.error(`提示词预设文件不存在: ${PRESETS_FILE}`);
      return res.status(404).json({ error: "提示词预设文件不存在" });
    }

    // 读取现有预设
    const presets = JSON.parse(
      fs.readFileSync(PRESETS_FILE, "utf-8")
    ) as PromptPreset[];

    // 查找并更新预设
    const presetIndex = presets.findIndex(
      (preset: PromptPreset) => preset.id === id
    );

    if (presetIndex === -1) {
      return res.status(404).json({ error: "预设不存在" });
    }

    presets[presetIndex] = {
      ...presets[presetIndex],
      name,
      content,
    };

    // 保存到文件
    fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2));

    res.json(presets[presetIndex]);
  } catch (error) {
    console.error("更新预设失败:", error);
    res.status(500).json({ error: "更新预设失败" });
  }
});

// 删除预设
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;

    // 确认文件存在
    if (!fs.existsSync(PRESETS_FILE)) {
      console.error(`提示词预设文件不存在: ${PRESETS_FILE}`);
      return res.status(404).json({ error: "提示词预设文件不存在" });
    }

    // 读取现有预设
    const presets = JSON.parse(
      fs.readFileSync(PRESETS_FILE, "utf-8")
    ) as PromptPreset[];

    // 查找预设
    const presetIndex = presets.findIndex(
      (preset: PromptPreset) => preset.id === id
    );

    if (presetIndex === -1) {
      return res.status(404).json({ error: "预设不存在" });
    }

    // 删除预设
    presets.splice(presetIndex, 1);

    // 保存到文件
    fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2));

    res.status(204).end();
  } catch (error) {
    console.error("删除预设失败:", error);
    res.status(500).json({ error: "删除预设失败" });
  }
});

export default router;
