import React from "react";
import { List, Avatar, Typography, Space, Badge, Divider } from "antd";
import { UserOutlined, TeamOutlined } from "@ant-design/icons";
import { OnlineUser } from "@/types/user";
import "./index.less";

const { Text, Title } = Typography;

interface OnlineUserListProps {
  onlineUsers: OnlineUser[];
}

const OnlineUserList: React.FC<OnlineUserListProps> = ({ onlineUsers }) => {
  return (
    <div className="online-users-wrapper">
      <div className="online-users-header">
        <TeamOutlined className="online-users-icon" />
        <Title level={5} className="online-users-title">
          在线用户 ({onlineUsers.length})
        </Title>
      </div>
      <Divider className="divider" />
      <List
        className="users-list"
        dataSource={onlineUsers}
        renderItem={(user) => (
          <List.Item className="user-item">
            <Space>
              <Badge status="success" className="status-badge" />
              <Avatar icon={<UserOutlined />} className="user-avatar" />
              <Text className="username">{user.username}</Text>
              {user.isTyping && (
                <Text type="secondary" className="typing-indicator">
                  正在输入...
                </Text>
              )}
            </Space>
          </List.Item>
        )}
      />
    </div>
  );
};

export default OnlineUserList;
