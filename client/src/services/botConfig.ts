import api from "./api";

export interface BotConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt: string;
}

/**
 * 机器人配置API服务
 */
export const botConfigService = {
  /**
   * 获取机器人配置
   * @returns Promise<BotConfig>
   */
  getConfig: async () => {
    const response = await api.get<BotConfig>("/bot-config");
    return response.data;
  },

  /**
   * 更新机器人配置
   * @param config 配置对象
   * @returns Promise<BotConfig>
   */
  updateConfig: async (config: BotConfig) => {
    const response = await api.post<BotConfig>("/bot-config", config);
    return response.data;
  },
};

export default botConfigService;
