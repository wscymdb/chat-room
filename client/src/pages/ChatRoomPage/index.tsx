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
} from "antd";
import {
  SendOutlined,
  LogoutOutlined,
  UserOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";
import "./index.less";

const { Header, Content, Sider } = Layout;
const { TextArea } = Input;
const { Text } = Typography;

const ChatRoomPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { messages, onlineUsers, sendMessage } = useSocket();
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessage(newMessage);
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

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

  const formatMessageTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
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
          <Button type="text" icon={<LogoutOutlined />} onClick={logout} danger>
            退出
          </Button>
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
                  <div
                    className={`message-item ${
                      isCurrentUser ? "message-item-right" : "message-item-left"
                    }`}
                  >
                    {!isCurrentUser && (
                      <Avatar
                        icon={<UserOutlined />}
                        className="message-avatar"
                      />
                    )}
                    <div
                      className={`message-content ${
                        isCurrentUser
                          ? "message-content-right"
                          : "message-content-left"
                      }`}
                    >
                      {!isCurrentUser && (
                        <div className="message-username">
                          {message.username}
                        </div>
                      )}
                      <div className="message-bubble">
                        {message.content}
                        <div className="message-time">
                          {formatMessageTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <Flex className="input-container">
            <form onSubmit={handleSendMessage}>
              <TextArea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息..."
                autoSize={{ minRows: 2, maxRows: 4 }}
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
