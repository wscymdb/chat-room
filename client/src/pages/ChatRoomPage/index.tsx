import React, { useState } from "react";
import { Layout, Button, Flex } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import "./index.less";

// 引入抽取的组件
import ChatHeader from "@/components/ChatHeader";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import OnlineUserList from "@/components/OnlineUserList";
import BotHelpModal from "@/components/BotHelpModal";

const { Header, Content, Sider } = Layout;

const ChatRoomPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { messages, onlineUsers, sendMessage } = useSocket();
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [siderCollapsed, setSiderCollapsed] = useState(true);

  const toggleSider = () => {
    setSiderCollapsed(!siderCollapsed);
  };

  const handleSendMessage = (newMessage: string) => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage);
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
        <Flex align="center" justify="space-between" className="header">
          <div className="header-left">
            <Button
              type="text"
              icon={
                siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
              }
              onClick={toggleSider}
              className="sider-toggle"
            />
          </div>
          <ChatHeader
            username={user?.username}
            role={user?.role}
            onLogout={logout}
            onShowHelp={() => setHelpModalVisible(true)}
          />
        </Flex>
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
