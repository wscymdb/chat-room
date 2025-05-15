import React from "react";
import { Button, Tooltip, Avatar, Space, Typography } from "antd";
import {
  LogoutOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useTheme } from "@/contexts/ThemeContext";
import BackgroundSelector from "@/components/BackgroundSelector";
import { UserRole } from "@/types/auth";
import "./index.less";

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
  const { theme, setTheme, background, setBackground } = useTheme();

  const isAdmin = [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(
    role as UserRole
  );

  return (
    <div className="chat-header">
      <Space size={18}>
        <span className="username">{username}</span>
        <Avatar icon={<UserOutlined />} className="user-avatar" />
        {isAdmin && (
          <Button
            type="primary"
            ghost
            onClick={() => window.open("/admin", "_blank")}
          >
            管理后台
          </Button>
        )}
      </Space>
      <div className="header-right">
        <BackgroundSelector
          currentBackground={background}
          onChange={setBackground}
        />
        <Tooltip title="切换主题">
          <Button
            type="text"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="theme-toggle"
          >
            {theme === "dark" ? "🌞" : "🌙"}
          </Button>
        </Tooltip>
        <Tooltip title="使用帮助">
          <Button
            type="text"
            icon={<QuestionCircleOutlined />}
            onClick={onShowHelp}
            className="help-button"
          />
        </Tooltip>
        <Tooltip title="退出登录">
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={onLogout}
            className="logout-button"
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default ChatHeader;
