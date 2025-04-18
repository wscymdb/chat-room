import React, { useRef, useEffect } from "react";
import { Message as MessageType } from "@/types/message";
import Message from "../Message";
import "./index.less";

interface MessageListProps {
  messages: MessageType[];
  currentUserId?: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
                isSelf={message.userId === currentUserId}
                type={message.type}
                tokens={message.tokens}
                userId={message.userId}
              />
            </div>
          );
        })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
