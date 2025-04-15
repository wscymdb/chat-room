import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  theme,
  Table,
  Input,
  Space,
  Typography,
  Card,
  Button,
  Popconfirm,
  message,
} from "antd";
import {
  MessageOutlined,
  UserOutlined,
  SettingOutlined,
  SearchOutlined,
  UserAddOutlined,
  TeamOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./index.less";

const { Header, Sider, Content } = Layout;
const { Search } = Input;
const { Title, Text } = Typography;

interface Message {
  id: string;
  content: string;
  userId: string;
  username: string;
  timestamp: string;
}

const AdminPage: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/messages`
      );
      setMessages(response.data);
    } catch (error) {
      console.error("获取消息失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/messages/${id}`);
      message.success("删除成功");
      fetchMessages(); // 重新加载数据
    } catch (error) {
      console.error("删除失败:", error);
      message.error("删除失败");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = messages.filter((message) =>
    message.content.toLowerCase().includes(searchText.toLowerCase())
  );

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
        <Popconfirm
          title="确定要删除这条消息吗？"
          onConfirm={() => handleDelete(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            style={{ padding: 0 }}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Layout className="admin-page" style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="light"
      >
        <div className="logo" />
        <Menu
          theme="light"
          defaultSelectedKeys={["1"]}
          mode="inline"
          items={[
            {
              key: "1",
              icon: <MessageOutlined />,
              label: "消息管理",
            },
            {
              key: "2",
              icon: <UserOutlined />,
              label: "用户管理",
            },
            {
              key: "3",
              icon: <SettingOutlined />,
              label: "系统设置",
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: "0 24px", background: colorBgContainer }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title
              level={4}
              style={{ color: "#fff", margin: 0, lineHeight: "56px" }}
            >
              消息管理系统
            </Title>
            <Button
              type="primary"
              ghost
              onClick={() => navigate("/chat")}
              style={{ color: "#fff", borderColor: "#fff" }}
            >
              返回聊天室
            </Button>
          </div>
        </Header>
        <Content>
          <div className="content-container">
            <div className="left-panel">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Search
                  placeholder="搜索消息内容"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ marginBottom: 16 }}
                />
                <div className="table-container">
                  <Table
                    columns={columns}
                    dataSource={filteredMessages}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      size: "small",
                      showTotal: (total) => `共 ${total} 条`,
                      showSizeChanger: false,
                      showQuickJumper: false,
                      simple: true,
                    }}
                    title={() => null}
                    scroll={{ y: "calc(100vh - 300px)" }}
                  />
                </div>
              </Space>
            </div>
            <div className="right-panel">
              <Card title="用户统计" className="stat-card">
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%" }}
                >
                  <div className="stat-item">
                    <TeamOutlined className="stat-icon" />
                    <div className="stat-info">
                      <Text type="secondary">在线用户</Text>
                      <Title level={3}>0</Title>
                    </div>
                  </div>
                  <div className="stat-item">
                    <UserAddOutlined className="stat-icon" />
                    <div className="stat-info">
                      <Text type="secondary">总用户数</Text>
                      <Title level={3}>0</Title>
                    </div>
                  </div>
                </Space>
              </Card>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminPage;
