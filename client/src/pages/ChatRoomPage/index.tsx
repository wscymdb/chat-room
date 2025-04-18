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
  Modal,
  Divider,
  Card,
  Tooltip,
} from "antd";
import {
  SendOutlined,
  LogoutOutlined,
  UserOutlined,
  SearchOutlined,
  SettingOutlined,
  RobotOutlined,
  BookOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";
import { useNavigate } from "react-router-dom";
import { UserRole } from "../../types/auth";
import ThemeSwitch from "../../components/ThemeSwitch";
import Message from "../../components/Message";
import axios from "axios";
import "./index.less";
import { Message as MessageType } from "../../types/message";

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const ChatRoomPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { messages, onlineUsers, sendMessage, socket, setMessages } =
    useSocket();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBotMention, setShowBotMention] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [helpModalVisible, setHelpModalVisible] = useState(false);

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
    } else if (newMessage.toLowerCase().includes("@poem")) {
      handlePoemBotMessage(newMessage);
    } else {
      sendMessage(newMessage);
    }
    setNewMessage("");
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

  const handleSelect = (option: any) => {
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
    {
      value: "poem",
      label: (
        <Space>
          <BookOutlined />
          <span>诗词机器人</span>
          <span style={{ fontSize: "12px", color: "#999" }}>
            (可输入作者名/关键词)
          </span>
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
          <Space size="middle">
            <Tooltip title="查看机器人使用指南">
              <Button
                type="text"
                icon={<QuestionCircleOutlined className="header-icon" />}
                onClick={() => setHelpModalVisible(true)}
                className="header-button"
              />
            </Tooltip>
            <ThemeSwitch />
            {(user?.role === UserRole.ADMIN ||
              user?.role === UserRole.SUPER_ADMIN) && (
              <Tooltip title="管理设置">
                <Button
                  type="text"
                  icon={<SettingOutlined className="header-icon" />}
                  onClick={() => navigate("/admin")}
                  className="header-button"
                />
              </Tooltip>
            )}
            <Tooltip title="退出登录">
              <Button
                type="text"
                icon={<LogoutOutlined className="header-icon" />}
                onClick={logout}
                className="header-button header-button-danger"
              />
            </Tooltip>
          </Space>
        </Header>
        <Content className="content">
          <div className="messages-container">
            {messages
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((message, index) => {
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
                      isSelf={message.userId === user?.id}
                      type={message.type}
                      tokens={message.tokens}
                      userId={message.userId}
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
                placeholder="输入消息，使用@bot呼叫AI助手，@poem呼叫诗词机器人..."
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

      {/* 帮助模态框 */}
      <Modal
        title="聊天机器人使用指南"
        open={helpModalVisible}
        onCancel={() => setHelpModalVisible(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setHelpModalVisible(false)}
          >
            知道了
          </Button>,
        ]}
        width={600}
      >
        <Divider orientation="left">AI助手</Divider>
        <p>
          <strong>使用方法：</strong>在消息框中输入 @bot 加上您的问题
        </p>
        <p>
          <strong>示例：</strong>@bot 今天天气怎么样？
        </p>

        <Divider orientation="left">诗词机器人</Divider>
        <Card title="诗词机器人使用指南" className="bot-guide-card">
          <p>
            <strong>基本用法：</strong>
          </p>
          <ul>
            <li>
              <strong>随机推荐诗词：</strong>输入 @poem 并发送
            </li>
            <li>
              <strong>推荐特定作者的诗词：</strong>输入 @poem 李白
            </li>
            <li>
              <strong>根据主题查找诗词：</strong>输入 @poem 思乡
            </li>
          </ul>
          <p>
            <strong>示例：</strong>
          </p>
          <ul>
            <li>@poem （随机推荐一首诗词）</li>
            <li>@poem 杜甫 （推荐杜甫的诗词）</li>
            <li>@poem 春天 （推荐与春天相关的诗词）</li>
            <li>@poem 李白的诗 （推荐李白的诗词）</li>
          </ul>
          <p>每首诗词都会包含诗名、作者、诗句和详细解析。</p>
        </Card>
      </Modal>
    </Layout>
  );
};

export default ChatRoomPage;
