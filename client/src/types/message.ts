export interface Message {
  id: string;
  content: string;
  userId: string;
  username: string;
  timestamp: number;
  type: "user" | "bot";
  tokens?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface User {
  id: string;
  username: string;
  isTyping?: boolean;
}
