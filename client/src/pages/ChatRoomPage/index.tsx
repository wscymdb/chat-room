import React, { useState, useRef, useEffect } from "react";
import {
  Layout,
  Input,
  Button,
  List,
  Avatar,
  Typography,
  Space,
  Badge,
  Flex,
  Mentions,
} from "antd";
import type { MentionsProps } from "antd/es/mentions";
import {
  SendOutlined,
  LogoutOutlined,
  UserOutlined,
  SearchOutlined,
  SettingOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";
import { useNavigate } from "react-router-dom";
import { UserRole } from "../../types/auth";
import ThemeSwitch from "../../components/ThemeSwitch";
import Message from "../../components/Message";
import axios from "axios";
import "./index.less";

const { Header, Content, Sider } = Layout;
const { TextArea } = Input;
const { Text } = Typography;

const ChatRoomPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { messages, onlineUsers, sendMessage } = useSocket();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBotMention, setShowBotMention] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log(user?.role);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (newMessage.toLowerCase().includes("@bot")) {
      handleBotMessage(newMessage);
    } else {
      sendMessage(newMessage);
    }
    setNewMessage("");
  };

  const handleBotMessage = async (message: string) => {
    try {
      console.log("发送机器人请求:", message);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bot`,
        {
          message: message,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("机器人响应:", response.data);
      const botResponse =
        response.data.message || "抱歉，我现在无法回答这个问题。";
      sendMessage(`@bot ${botResponse}`);
    } catch (error) {
      console.error("机器人响应错误:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        sendMessage(`@bot 抱歉，发生了错误：${errorMessage}`);
      } else {
        sendMessage("@bot 抱歉，机器人暂时无法响应，请稍后再试。");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !showBotMention) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);
    setShowBotMention(value.toLowerCase().includes("@"));
  };

  const handleSelect = (option: any, prefix: string) => {
    setNewMessage("@" + option.value + " ");
    setShowBotMention(false);
  };

  const mentionOptions = [
    {
      value: "bot",
      label: (
        <Space>
          <RobotOutlined />
          <span>AI助手</span>
        </Space>
      ),
    },
  ];

  const formatDate = (timestamp: string | number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "今天";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "昨天";
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Layout className="chat-room">
      <Sider width={320} className="sider">
        <div className="search-container">
          <Input
            placeholder="搜索消息..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="online-users-title">在线用户</div>
        <List
          dataSource={onlineUsers}
          renderItem={(user) => (
            <List.Item>
              <Space>
                <Badge status="success" />
                <Avatar icon={<UserOutlined />} />
                <Text>{user.username}</Text>
                {user.isTyping && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    正在输入...
                  </Text>
                )}
              </Space>
            </List.Item>
          )}
        />
      </Sider>
      <Layout>
        <Header className="header">
          <Space>
            <Avatar icon={<UserOutlined />} />
            <Text>{user?.username}</Text>
          </Space>
          <Space>
            <ThemeSwitch />
            {(user?.role === UserRole.ADMIN ||
              user?.role === UserRole.SUPER_ADMIN) && (
              <Button
                type="text"
                icon={<SettingOutlined />}
                onClick={() => navigate("/admin")}
              >
                管理
              </Button>
            )}
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={logout}
              danger
            >
              退出
            </Button>
          </Space>
        </Header>
        <Content className="content">
          <div className="messages-container">
            {messages.map((message, index) => {
              const isCurrentUser = message.userId === user?.id;
              const showDate =
                index === 0 ||
                formatDate(message.timestamp) !==
                  formatDate(messages[index - 1].timestamp);

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="message-date">
                      {formatDate(message.timestamp)}
                    </div>
                  )}
                  <Message
                    content={message.content}
                    timestamp={message.timestamp}
                    username={message.username}
                    isSelf={
                      isCurrentUser && !message.content.startsWith("@bot")
                    }
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <Flex className="input-container">
            <form onSubmit={handleSendMessage}>
              <Mentions
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onSelect={handleSelect}
                placeholder="输入消息，使用@来呼叫机器人..."
                options={showBotMention ? mentionOptions : []}
                style={{ width: "100%", height: "100%" }}
                prefix="@"
                split=" "
              />
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                disabled={!newMessage.trim()}
              >
                发送
              </Button>
            </form>
          </Flex>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ChatRoomPage;
