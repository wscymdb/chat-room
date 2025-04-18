import api from "./api";

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender?: string;
  timestamp: string;
  username?: string;
}

export interface Username {
  value: string;
  label: string;
}

/**
 * 消息API服务
 */
export const messageService = {
  /**
   * 获取所有消息
   * @param params 查询参数
   * @returns Promise<Message[]>
   */
  getAllMessages: async (params?: { content?: string; username?: string }) => {
    const response = await api.get<Message[]>("/messages", { params });
    return response.data;
  },

  /**
   * 获取所有用户名列表
   * @returns Promise<Username[]>
   */
  getUsernames: async () => {
    const response = await api.get<Username[]>("/messages/usernames");
    return response.data;
  },

  /**
   * 发送消息
   * @param content 消息内容
   * @param senderId 发送者ID
   * @returns Promise<Message>
   */
  sendMessage: async (content: string, senderId: string) => {
    const response = await api.post<Message>("/messages", {
      content,
      senderId,
    });
    return response.data;
  },

  /**
   * 删除消息
   * @param id 消息ID
   * @returns Promise<void>
   */
  deleteMessage: async (id: string) => {
    await api.delete(`/messages/${id}`);
  },

  /**
   * 清空所有消息（仅超级管理员）
   * @returns Promise<{ message: string; count: number }>
   */
  clearAllMessages: async () => {
    const response = await api.delete<{ message: string; count: number }>(
      "/messages/all/clear"
    );
    return response.data;
  },
};

export default messageService;
