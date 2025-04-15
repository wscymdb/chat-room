import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, IconButton } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import SendIcon from "@mui/icons-material/Send";

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
}

const ChatRoom: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // 获取历史消息
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/messages`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("获取消息失败:", error);
      }
    };

    fetchMessages();
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/messages`,
        {
          content: newMessage,
          senderId: user.id,
        }
      );

      setMessages((prev) => [...prev, response.data]);
      setNewMessage("");
    } catch (error) {
      console.error("发送消息失败:", error);
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
              maxWidth: "80%",
              alignSelf:
                message.senderId === user?.id ? "flex-end" : "flex-start",
            }}
          >
            <Box
              sx={{
                bgcolor:
                  message.senderId === user?.id ? "primary.main" : "grey.200",
                color: message.senderId === user?.id ? "white" : "text.primary",
                p: 1.5,
                borderRadius: 2,
                wordBreak: "break-word",
                position: "relative",
                listStyle: "none",
                "&::marker": {
                  display: "none",
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: "-8px",
                  top: "12px",
                  width: 0,
                  height: 0,
                  borderTop: "8px solid transparent",
                  borderBottom: "8px solid transparent",
                  borderRight:
                    message.senderId === user?.id
                      ? "8px solid primary.main"
                      : "8px solid grey.200",
                  transform:
                    message.senderId === user?.id ? "rotate(180deg)" : "none",
                },
              }}
              component="div"
            >
              <Typography
                variant="body1"
                sx={{
                  listStyle: "none",
                  "&::marker": {
                    display: "none",
                  },
                }}
              >
                {message.content}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 0.5,
                  color:
                    message.senderId === user?.id ? "white" : "text.secondary",
                  opacity: 0.8,
                }}
              >
                {new Date(message.timestamp).toLocaleTimeString()}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="输入消息..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatRoom;
