import React from "react";
import { Avatar, Button, Space, Tooltip, Typography } from "antd";
import {
  LogoutOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { UserRole } from "@/types/auth";
import ThemeSwitch from "../ThemeSwitch";
import { useNavigate } from "react-router-dom";
import "./index.less";

const { Text } = Typography;

interface ChatHeaderProps {
  username?: string;
  role?: UserRole;
  onLogout: () => void;
  onShowHelp: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  username,
  role,
  onLogout,
  onShowHelp,
}) => {
  const navigate = useNavigate();

  return (
    <div className="chat-header">
      <Space className="user-info">
        <Avatar icon={<UserOutlined />} />
        <Text>{username}</Text>
      </Space>
      <Space size="middle" className="header-controls">
        <Tooltip title="查看机器人使用指南">
          <Button
            type="text"
            icon={<QuestionCircleOutlined className="header-icon" />}
            onClick={onShowHelp}
            className="header-button"
          />
        </Tooltip>
        <ThemeSwitch />
        {(role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) && (
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
            onClick={onLogout}
            className="header-button header-button-danger"
          />
        </Tooltip>
      </Space>
    </div>
  );
};

export default ChatHeader;
