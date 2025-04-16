import React from "react";
import { Avatar } from "antd";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import classNames from "classnames";
import "./index.less";

interface MessageProps {
  content: string;
  timestamp: number;
  username?: string;
  isSelf?: boolean;
  type: "user" | "bot";
}

const Message: React.FC<MessageProps> = ({
  content,
  timestamp,
  username,
  isSelf = false,
  type = "user",
}) => {
  const formatMessageTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // 根据消息类型确定显示的用户名
  const getDisplayUsername = () => {
    if (isSelf) return "我";
    if (type === "bot") return "AI助手";
    return username;
  };

  // 根据消息类型确定头像
  const getAvatarIcon = () => {
    if (isSelf) return <UserOutlined />;
    if (type === "bot") return <RobotOutlined />;
    return <UserOutlined />;
  };

  return (
    <div
      className={classNames("message-item", {
        "message-item-right": isSelf,
        "message-item-left": !isSelf,
      })}
    >
      <Avatar icon={getAvatarIcon()} className="message-avatar" />
      <div
        className={classNames("message-content", {
          "message-content-right": isSelf,
          "message-content-left": !isSelf,
          "message-content-bot": type === "bot" && !isSelf,
        })}
      >
        <div className="message-username">{getDisplayUsername()}</div>
        <div className="message-bubble">
          {content}
          <div className="message-time">{formatMessageTime(timestamp)}</div>
        </div>
      </div>
    </div>
  );
};

export default Message;
