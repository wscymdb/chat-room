import api from "./api";

export interface PromptPreset {
  id: string;
  name: string;
  content: string;
}

/**
 * 预设API服务
 */
export const promptPresetsService = {
  /**
   * 获取所有预设
   * @returns Promise<PromptPreset[]>
   */
  getAllPresets: async () => {
    const response = await api.get<PromptPreset[]>("/prompt-presets");
    return response.data;
  },

  /**
   * 添加预设
   * @param name 预设名称
   * @param content 预设内容
   * @returns Promise<PromptPreset>
   */
  addPreset: async (name: string, content: string) => {
    const response = await api.post<PromptPreset>("/prompt-presets", {
      name,
      content,
    });
    return response.data;
  },

  /**
   * 更新预设
   * @param id 预设ID
   * @param name 预设名称
   * @param content 预设内容
   * @returns Promise<PromptPreset>
   */
  updatePreset: async (id: string, name: string, content: string) => {
    const response = await api.put<PromptPreset>(`/prompt-presets/${id}`, {
      name,
      content,
    });
    return response.data;
  },

  /**
   * 删除预设
   * @param id 预设ID
   * @returns Promise<void>
   */
  deletePreset: async (id: string) => {
    await api.delete(`/prompt-presets/${id}`);
  },
};

export default promptPresetsService;
