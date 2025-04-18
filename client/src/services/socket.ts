import io, { Socket } from "socket.io-client";

/**
 * 获取Socket连接URL
 * @returns Socket连接URL
 */
export const getSocketUrl = (): string => {
  // 尝试从环境变量获取API URL
  const envApiUrl = import.meta.env.VITE_API_URL;

  // 如果有环境变量，使用环境变量
  if (envApiUrl) {
    return envApiUrl;
  }

  // 否则根据当前URL自动判断
  // 如果是localhost，则使用本地API URL
  // 否则使用当前域名作为API URL
  const hostname = window.location.hostname;
  const port =
    window.location.port === "80" ||
    window.location.port === "443" ||
    window.location.port === ""
      ? "3000" // 默认API端口
      : window.location.port;

  if (hostname === "localhost") {
    return `http://localhost:${port}`;
  } else {
    return `${window.location.protocol}//${hostname}:${port}`;
  }
};

/**
 * 创建Socket连接
 * @param query 连接查询参数
 * @returns Socket实例
 */
export const createSocketConnection = (
  query: Record<string, string>
): Socket => {
  const socketUrl = getSocketUrl();
  console.log("Socket连接到:", socketUrl);

  return io(socketUrl, {
    query,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });
};

export default {
  getSocketUrl,
  createSocketConnection,
};
