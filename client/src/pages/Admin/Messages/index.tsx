import React, { useState, useEffect } from "react";
import { Table, Button, message, Typography, Card, Space } from "antd";
import { MessageOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import "./index.less";

const { Title, Text } = Typography;

interface Message {
  id: string;
  content: string;
  userId: string;
  username: string;
  timestamp: string;
}

const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/messages`
      );
      setMessages(response.data);
    } catch (error) {
      message.error("获取消息列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/messages/${id}`);
      message.success("删除成功");
      fetchMessages();
    } catch (error) {
      message.error("删除失败");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      width: 120,
    },
    {
      title: "消息内容",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
    },
    {
      title: "发送时间",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 180,
      render: (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
      },
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      render: (_: any, record: Message) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteMessage(record.id)}
        />
      ),
    },
  ];

  return (
    <div className="messages-page">
      <div className="content-container">
        <div className="left-panel">
          <Card>
            <div className="table-header">
              <Title level={4}>消息列表</Title>
            </div>
            <Table
              columns={columns}
              dataSource={messages}
              rowKey="id"
              loading={loading}
              pagination={{
                size: "small",
                showTotal: (total) => `共 ${total} 条`,
              }}
            />
          </Card>
        </div>
        <div className="right-panel">
          <Card title="消息统计" className="stat-card">
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div className="stat-item">
                <MessageOutlined className="stat-icon" />
                <div className="stat-info">
                  <Text type="secondary">总消息数</Text>
                  <Title level={3}>{messages.length}</Title>
                </div>
              </div>
            </Space>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
