import api from "./api";
import botConfigService from "./botConfig";
import messageService from "./messages";
import promptPresetsService from "./promptPresets";
import userService from "./users";

export {
  api,
  botConfigService,
  messageService,
  promptPresetsService,
  userService,
};

// 也可以通过此处导出类型
export type { BotConfig } from "./botConfig";
export type { Message, Username } from "./messages";
export type { PromptPreset } from "./promptPresets";
export type { User, LoginResponse } from "./users";
export { UserRole } from "./users";
