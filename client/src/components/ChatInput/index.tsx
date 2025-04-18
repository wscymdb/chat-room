import React, { useState } from "react";
import { Button, Flex, Mentions, Space } from "antd";
import { SendOutlined, RobotOutlined, BookOutlined } from "@ant-design/icons";
import "./index.less";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [newMessage, setNewMessage] = useState("");
  const [showBotMention, setShowBotMention] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage("");
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

  return (
    <Flex className="chat-input-container">
      <form onSubmit={handleSendMessage} className="chat-input-form">
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
  );
};

export default ChatInput;
