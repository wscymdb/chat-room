import React, { useState } from "react";
import { Layout, Button } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import axios from "axios";
import "./index.less";
import { Message as MessageType } from "@/types/message";

// 引入抽取的组件
import ChatHeader from "@/components/ChatHeader";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import OnlineUserList from "@/components/OnlineUserList";
import BotHelpModal from "@/components/BotHelpModal";

const { Header, Content, Sider } = Layout;

const ChatRoomPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { messages, onlineUsers, sendMessage, socket, setMessages } =
    useSocket();
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [siderCollapsed, setSiderCollapsed] = useState(true);

  const toggleSider = () => {
    setSiderCollapsed(!siderCollapsed);
  };

  const handleSendMessage = (newMessage: string) => {
    if (!newMessage.trim()) return;

    if (newMessage.toLowerCase().includes("@bot")) {
      handleBotMessage(newMessage);
    } else if (newMessage.toLowerCase().includes("@poem")) {
      handlePoemBotMessage(newMessage);
    } else {
      sendMessage(newMessage);
    }
  };

  const handleBotMessage = async (message: string) => {
    let tempMessageId: string | null = null;
    try {
      // 先发送用户的消息
      sendMessage(message);

      // 等待一小段时间确保消息已经显示
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 添加一个临时的"思考中"消息
      tempMessageId = Date.now().toString();
      const tempMessage: MessageType = {
        id: tempMessageId,
        content: "🤔 机器人思考中...",
        userId: "bot",
        username: "AI助手",
        timestamp: Date.now(),
        type: "bot",
      };

      setMessages((prev: MessageType[]) => [...prev, tempMessage]);

      // 去掉@bot前缀发送请求
      const cleanMessage = message.replace(/^@bot\s*/i, "");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bot`,
        {
          message: cleanMessage,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const botResponse =
        response.data.message || "抱歉，我现在无法回答这个问题。";
      const tokens = response.data.tokens;

      // 发送机器人回复，使用特殊的消息格式
      if (socket && user) {
        const botMessage = {
          content: botResponse,
          userId: "bot",
          username: "AI助手",
          type: "bot" as const,
          tokens,
        };
        socket.emit("message", botMessage);

        // 移除临时消息
        if (tempMessageId) {
          setMessages((prev: MessageType[]) =>
            prev.filter((msg: MessageType) => msg.id !== tempMessageId)
          );
        }
      }
    } catch (error) {
      // 移除临时消息
      if (tempMessageId) {
        setMessages((prev: MessageType[]) =>
          prev.filter((msg: MessageType) => msg.id !== tempMessageId)
        );
      }

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        if (socket && user) {
          const errorBotMessage = {
            content: `抱歉，发生了错误：${errorMessage}`,
            userId: "bot",
            username: "AI助手",
            type: "bot" as const,
          };
          socket.emit("message", errorBotMessage);
        }
      } else {
        if (socket && user) {
          const errorBotMessage = {
            content: "抱歉，机器人暂时无法响应，请稍后再试。",
            userId: "bot",
            username: "AI助手",
            type: "bot" as const,
          };
          socket.emit("message", errorBotMessage);
        }
      }
    }
  };

  const handlePoemBotMessage = async (message: string) => {
    let tempMessageId: string | null = null;
    try {
      // 先发送用户的消息
      sendMessage(message);

      // 等待一小段时间确保消息已经显示
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 添加一个临时的"思考中"消息
      tempMessageId = Date.now().toString();
      const tempMessage: MessageType = {
        id: tempMessageId,
        content: "🤔 诗词机器人思考中...",
        userId: "poemBot",
        username: "诗词机器人",
        timestamp: Date.now(),
        type: "bot",
      };

      setMessages((prev: MessageType[]) => [...prev, tempMessage]);

      // 去掉@poem前缀发送请求
      let cleanMessage = message.replace(/^@poem\s*/i, "").trim();

      // 如果消息为空，设置为"随机"，这样后端就知道是要随机推荐
      if (!cleanMessage) {
        cleanMessage = "随机";
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/poemBot`,
        {
          message: cleanMessage,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const botResponse = response.data.message || "抱歉，我现在无法推荐诗词。";
      const tokens = response.data.tokens;

      // 发送机器人回复，使用特殊的消息格式
      if (socket && user) {
        const poemBotMessage = {
          content: botResponse,
          userId: "poemBot",
          username: "诗词机器人",
          type: "bot" as const,
          tokens,
        };
        socket.emit("message", poemBotMessage);

        // 移除临时消息
        if (tempMessageId) {
          setMessages((prev: MessageType[]) =>
            prev.filter((msg: MessageType) => msg.id !== tempMessageId)
          );
        }
      }
    } catch (error) {
      // 移除临时消息
      if (tempMessageId) {
        setMessages((prev: MessageType[]) =>
          prev.filter((msg: MessageType) => msg.id !== tempMessageId)
        );
      }

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        if (socket && user) {
          const errorBotMessage = {
            content: `抱歉，发生了错误：${errorMessage}`,
            userId: "poemBot",
            username: "诗词机器人",
            type: "bot" as const,
          };
          socket.emit("message", errorBotMessage);
        }
      } else {
        if (socket && user) {
          const errorBotMessage = {
            content: "抱歉，诗词机器人暂时无法响应，请稍后再试。",
            userId: "poemBot",
            username: "诗词机器人",
            type: "bot" as const,
          };
          socket.emit("message", errorBotMessage);
        }
      }
    }
  };

  return (
    <Layout className="chat-room">
      <Sider
        width={220}
        className="sider"
        collapsible
        collapsed={siderCollapsed}
        trigger={null}
        collapsedWidth={0}
        zeroWidthTriggerStyle={{ display: "none" }}
      >
        <OnlineUserList onlineUsers={onlineUsers} />
      </Sider>
      <Layout>
        <Header className="header">
          <div className="header-left">
            <Button
              type="text"
              icon={
                siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
              }
              onClick={toggleSider}
              className="sider-toggle"
            />
            <ChatHeader
              username={user?.username}
              role={user?.role}
              onLogout={logout}
              onShowHelp={() => setHelpModalVisible(true)}
            />
          </div>
        </Header>
        <Content className="content">
          <MessageList messages={messages} currentUserId={user?.id} />
          <ChatInput onSendMessage={handleSendMessage} />
        </Content>
      </Layout>

      <BotHelpModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
      />
    </Layout>
  );
};

export default ChatRoomPage;
