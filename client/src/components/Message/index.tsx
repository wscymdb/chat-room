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
}

const Message: React.FC<MessageProps> = ({
  content,
  timestamp,
  username,
  isSelf = false,
}) => {
  const formatMessageTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const isBotMessage = content.startsWith("@bot");
  const displayUsername = isBotMessage ? "AI助手" : username;

  return (
    <div
      className={classNames("message-item", { "message-item-right": isSelf })}
    >
      {!isSelf && (
        <Avatar
          icon={isBotMessage ? <RobotOutlined /> : <UserOutlined />}
          className="message-avatar"
        />
      )}
      <div
        className={classNames("message-content", {
          "message-content-right": isSelf,
          "message-content-left": !isSelf,
        })}
      >
        {!isSelf && displayUsername && (
          <div className="message-username">{displayUsername}</div>
        )}
        <div className="message-bubble">
          {isBotMessage ? content.replace("@bot ", "") : content}
          <div className="message-time">{formatMessageTime(timestamp)}</div>
        </div>
      </div>
    </div>
  );
};

export default Message;
