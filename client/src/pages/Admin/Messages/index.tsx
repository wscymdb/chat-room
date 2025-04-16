import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  message,
  Typography,
  Card,
  Space,
  Input,
  Select,
  Form,
} from "antd";
import {
  MessageOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "./index.less";

const { Title, Text } = Typography;
const { Option } = Select;

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
}

interface UsernameOption {
  value: string;
  label: string;
}

const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [usernames, setUsernames] = useState<UsernameOption[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsernames();
    fetchMessages();
  }, []);

  const fetchUsernames = async () => {
    try {
      const response = await axios.get("/api/users");
      const usernameOptions = response.data.map((user: any) => ({
        value: user.username,
        label: user.username,
      }));
      setUsernames(usernameOptions);
    } catch (error) {
      console.error("获取用户名列表失败:", error);
    }
  };

  const fetchMessages = async (searchParams?: {
    content?: string;
    username?: string;
  }) => {
    setLoading(true);
    try {
      const response = await axios.get("/api/messages", {
        params: searchParams,
      });
      setMessages(response.data);
    } catch (error) {
      console.error("获取消息列表失败:", error);
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

  const handleSearch = async (values: any) => {
    const searchParams = {
      content: values.content,
      username: values.username,
    };
    await fetchMessages(searchParams);
  };

  const handleReset = () => {
    form.resetFields();
    fetchMessages();
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "发送者",
      dataIndex: "sender",
      key: "sender",
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
      <Title level={2}>消息管理</Title>
      <div className="content-container">
        <div className="left-panel">
          <Card>
            <div className="table-header">
              <Title level={4}>消息列表</Title>
              <Form
                form={form}
                layout="inline"
                onFinish={handleSearch}
                className="search-form"
              >
                <Form.Item name="content">
                  <Input
                    placeholder="搜索消息内容"
                    prefix={<SearchOutlined />}
                    allowClear
                  />
                </Form.Item>
                <Form.Item name="username">
                  <Select
                    placeholder="选择用户"
                    allowClear
                    style={{ width: 200 }}
                  >
                    {usernames.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit">
                      搜索
                    </Button>
                    <Button onClick={handleReset} icon={<ReloadOutlined />}>
                      重置
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </div>
            <Table
              columns={columns}
              dataSource={messages}
              rowKey="id"
              loading={loading}
              pagination={{
                size: "small",
                showTotal: (total) => `共 ${total} 条`,
                hideOnSinglePage: true,
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
