import { Server } from "socket.io";
import { readData, writeData } from "../utils/fileStorage";

export const setupSocket = (io: Server) => {
  io.on("connection", async (socket) => {
    console.log("用户连接:", socket.id);

    // 用户加入
    socket.on("user:join", async (userId: string) => {
      try {
        console.log("用户加入:", userId);
        const data = await readData();

        // 添加在线用户
        data.onlineUsers.push({
          userId,
          socketId: socket.id,
          lastActive: new Date().toISOString(),
        });

        await writeData(data);

        // 广播用户列表更新
        io.emit(
          "user:list",
          data.onlineUsers.map((user: any) => user.userId)
        );

        // 发送历史消息给新加入的用户
        socket.emit("message:history", data.messages);
      } catch (error) {
        console.error("用户加入错误:", error);
      }
    });

    // 发送消息
    socket.on("message:send", async (message: any) => {
      try {
        console.log("收到新消息:", message);
        const data = await readData();

        // 添加消息
        const newMessage = {
          id: Date.now().toString(),
          userId: message.userId,
          username: message.username,
          content: message.content,
          timestamp: new Date().toISOString(),
        };

        data.messages.push(newMessage);
        await writeData(data);

        // 广播消息
        io.emit("message:receive", newMessage);
        console.log("消息已广播:", newMessage);
      } catch (error) {
        console.error("发送消息错误:", error);
        socket.emit("message:error", { message: "发送消息失败" });
      }
    });

    // 用户断开连接
    socket.on("disconnect", async () => {
      try {
        console.log("用户断开连接:", socket.id);
        const data = await readData();

        // 移除在线用户
        data.onlineUsers = data.onlineUsers.filter(
          (user: any) => user.socketId !== socket.id
        );

        await writeData(data);

        // 广播用户列表更新
        io.emit(
          "user:list",
          data.onlineUsers.map((user: any) => user.userId)
        );
      } catch (error) {
        console.error("用户断开连接错误:", error);
      }
    });
  });
};
