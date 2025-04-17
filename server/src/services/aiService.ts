import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// AI模型类型
export enum AIModelType {
  DEEPSEEK = "deepseek",
  // 后续可以添加其他模型
}

// 消息角色类型
export enum MessageRole {
  SYSTEM = "system",
  USER = "user",
  ASSISTANT = "assistant",
}

// 消息结构
export interface Message {
  role: MessageRole;
  content: string;
}

// AI调用配置
export interface AIConfig {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  model?: string;
}

// AI响应
export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 默认配置
const defaultConfig: AIConfig = {
  temperature: 0.7,
  max_tokens: 1000,
  top_p: 0.9,
  model: "deepseek-chat",
};

/**
 * 调用AI模型生成回复
 * @param messages 消息列表
 * @param modelType AI模型类型
 * @param config 配置选项
 * @returns 生成的回复内容
 */
export async function generateAIResponse(
  messages: Message[],
  modelType: AIModelType = AIModelType.DEEPSEEK,
  config: AIConfig = {}
): Promise<AIResponse> {
  // 合并默认配置
  const mergedConfig = { ...defaultConfig, ...config };

  switch (modelType) {
    case AIModelType.DEEPSEEK:
      return await callDeepseekAPI(messages, mergedConfig);
    default:
      throw new Error(`不支持的AI模型类型: ${modelType}`);
  }
}

/**
 * 调用Deepseek API
 * @param messages 消息列表
 * @param config 配置选项
 * @returns 生成的回复内容
 */
async function callDeepseekAPI(
  messages: Message[],
  config: AIConfig
): Promise<AIResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("Deepseek API密钥未配置");
  }

  try {
    console.log("调用Deepseek API，消息数量:", messages.length);
    console.log("使用的API Key:", apiKey.substring(0, 5) + "...");

    const requestData = {
      model: config.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.max_tokens,
      top_p: config.top_p,
      frequency_penalty: config.frequency_penalty,
      presence_penalty: config.presence_penalty,
    };

    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return {
      content: response.data.choices[0].message.content.trim(),
      usage: response.data.usage,
    };
  } catch (error) {
    console.error("Deepseek API调用失败:", error);
    throw error;
  }
}

/**
 * 模拟AI回复（当API不可用时使用）
 * @param messages 消息列表
 * @returns 模拟生成的回复内容
 */
export function mockAIResponse(messages: Message[]): AIResponse {
  // 获取用户最后一条消息
  const userMessage =
    messages.filter((m) => m.role === MessageRole.USER).pop()?.content || "";

  // 获取系统消息
  const systemMessage =
    messages.find((m) => m.role === MessageRole.SYSTEM)?.content || "";

  // 根据消息内容生成模拟回复
  let response = "这是一个模拟的AI回复。";

  if (userMessage.includes("提示词") || systemMessage.includes("提示词")) {
    // 如果是请求生成提示词
    const basePrompt =
      userMessage.split('"').filter((s) => s.length > 10)[0] ||
      "你是一个AI助手";

    if (basePrompt.length < 30) {
      response = `${basePrompt}。请提供准确、专业的回答，保持友好和耐心。如果用户问题不清楚，请礼貌地要求澄清。回答应该简洁明了，重点突出，避免冗余信息。`;
    } else {
      response = `${basePrompt} 在回答时，请确保信息准确可靠，语言简洁清晰，逻辑结构合理。对于专业问题，给出深入但易懂的解释；对于主观问题，提供平衡的多角度观点。始终保持友好、耐心的态度，尊重用户的不同背景和需求。`;
    }
  } else if (userMessage) {
    // 普通问答
    response = `关于"${userMessage.substring(
      0,
      20
    )}..."的回复：我理解您的问题，这是一个模拟的回答。实际AI会根据您的问题提供更详细的信息。`;
  }

  return {
    content: response,
    usage: {
      prompt_tokens: userMessage.length,
      completion_tokens: response.length,
      total_tokens: userMessage.length + response.length,
    },
  };
}
