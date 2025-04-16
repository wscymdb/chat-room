import { Server, Socket } from "socket.io";
import { readData, writeData } from "./utils/fileStorage";

interface User {
  id: string;
  username: string;
  avatar: string;
}

interface Message {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: string;
  avatar: string;
  type: "user" | "bot";
}

export const setupSocket = (io: Server) => {
  io.on("connection", async (socket: Socket) => {
    const { userId, username, avatar } = socket.handshake.query;

    if (!userId || !username) {
      socket.disconnect();
      return;
    }

    // 读取数据
    const data = await readData();

    // 发送历史消息
    const formattedMessages = data.messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp).getTime(),
      avatar: msg.avatar || "",
      type: msg.type || "user",
    }));
    socket.emit("messages", formattedMessages);

    // 更新在线用户
    const currentUser = {
      id: userId as string,
      username: username as string,
      avatar: avatar as string,
    };

    // 更新在线用户列表
    const onlineUsers = Array.from(
      new Set(
        [...(data.onlineUsers || []), currentUser].map((user) =>
          JSON.stringify(user)
        )
      )
    ).map((str) => JSON.parse(str));

    data.onlineUsers = onlineUsers;
    await writeData(data);

    // 广播在线用户列表
    io.emit("users", onlineUsers);

    // 处理新消息
    socket.on(
      "message",
      async (
        messageData: Omit<Message, "id" | "timestamp" | "type">,
        callback: (response: { success: boolean }) => void
      ) => {
        try {
          const newMessage = {
            id: Date.now().toString(),
            ...messageData,
            timestamp: new Date().toISOString(),
            type: messageData.content.startsWith("@bot") ? "bot" : "user",
          };

          // 保存消息
          data.messages.push(newMessage);
          await writeData(data);

          // 广播消息
          io.emit("message", newMessage);

          // 发送成功回调
          callback({ success: true });
        } catch (error) {
          console.error("消息处理错误:", error);
          callback({ success: false });
        }
      }
    );

    // 处理断开连接
    socket.on("disconnect", async () => {
      const data = await readData();
      data.onlineUsers = data.onlineUsers.filter(
        (user: User) => user.id !== userId
      );
      await writeData(data);
      io.emit("users", data.onlineUsers);
    });
  });
};
