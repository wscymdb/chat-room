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
  Modal,
  Form,
  Select,
} from "antd";
import {
  MessageOutlined,
  UserOutlined,
  SettingOutlined,
  SearchOutlined,
  UserAddOutlined,
  TeamOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { User, UserRole, ROLE_NAMES } from "../../types/auth";
import "./index.less";

const { Header, Sider, Content } = Layout;
const { Search } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

interface Message {
  id: string;
  content: string;
  userId: string;
  username: string;
  timestamp: string;
}

const AdminPage: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const { user: currentUser, hasPermission } = useAuth();

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/messages`
      );
      setMessages(response.data);
    } catch (error) {
      message.error("获取消息列表失败");
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users`
      );
      setUsers(response.data);
    } catch (error) {
      message.error("获取用户列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "1") {
      fetchMessages();
    } else if (activeTab === "2") {
      fetchUsers();
    }
  }, [activeTab]);

  const handleDeleteMessage = async (id: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/messages/${id}`);
      message.success("删除成功");
      fetchMessages();
    } catch (error) {
      message.error("删除失败");
    }
  };

  const handleEditUser = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${id}`);
      message.success("删除成功");
      fetchUsers();
    } catch (error) {
      message.error("删除失败");
    }
  };

  const handleSubmitUser = async (values: any) => {
    try {
      if (editingUser) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/users/${editingUser.id}`,
          values
        );
        message.success("更新成功");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/users`, values);
        message.success("添加成功");
      }
      setModalVisible(false);
      form.resetFields();
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      message.error(editingUser ? "更新失败" : "添加失败");
    }
  };

  const messageColumns = [
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
          onConfirm={() => handleDeleteMessage(record.id)}
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

  const userColumns = [
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      render: (role: UserRole) => ROLE_NAMES[role] || "普通用户",
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: User) => {
        if (record.role === UserRole.SUPER_ADMIN) {
          return null;
        }

        if (
          currentUser?.role === UserRole.ADMIN &&
          record.role === UserRole.ADMIN
        ) {
          return null;
        }

        if (
          currentUser?.role === UserRole.SUPER_ADMIN ||
          currentUser?.role === UserRole.ADMIN
        ) {
          return (
            <Space>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEditUser(record)}
              />
              <Popconfirm
                title="确定要删除此用户吗？"
                onConfirm={() => handleDeleteUser(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          );
        }

        return null;
      },
    },
  ];

  const availableRoles = () => {
    if (currentUser?.role === UserRole.SUPER_ADMIN) {
      return [UserRole.ADMIN, UserRole.USER];
    }
    if (currentUser?.role === UserRole.ADMIN) {
      return [UserRole.USER];
    }
    return [];
  };

  const renderContent = () => {
    switch (activeTab) {
      case "1":
        return (
          <div className="content-container">
            <div className="left-panel">
              <Card>
                <div className="table-header">
                  <Title level={4}>消息列表</Title>
                  <Search
                    placeholder="搜索消息"
                    allowClear
                    style={{ width: 200 }}
                  />
                </div>
                <Table
                  columns={messageColumns}
                  dataSource={messages}
                  rowKey="id"
                  pagination={{
                    size: "small",
                    showTotal: (total) => `共 ${total} 条`,
                  }}
                />
              </Card>
            </div>
            <div className="right-panel">
              <Card title="消息统计" className="stat-card">
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%" }}
                >
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
        );
      case "2":
        return (
          <div className="content-container">
            <div className="left-panel">
              <Card>
                <div className="table-header">
                  <Title level={4}>用户列表</Title>
                  <Space>
                    <Search
                      placeholder="搜索用户"
                      allowClear
                      style={{ width: 200 }}
                    />
                    {hasPermission(UserRole.ADMIN) && (
                      <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={() => setModalVisible(true)}
                      >
                        添加用户
                      </Button>
                    )}
                  </Space>
                </div>
                <Table
                  columns={userColumns}
                  dataSource={users}
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
              <Card title="用户统计" className="stat-card">
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%" }}
                >
                  <div className="stat-item">
                    <TeamOutlined className="stat-icon" />
                    <div className="stat-info">
                      <Text type="secondary">总用户数</Text>
                      <Title level={3}>{users.length}</Title>
                    </div>
                  </div>
                </Space>
              </Card>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
          selectedKeys={[activeTab]}
          mode="inline"
          onClick={({ key }) => setActiveTab(key)}
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
          ]}
        />
      </Sider>
      <Layout>
        <Content
          style={{ margin: "24px 16px", padding: 24, background: "#fff" }}
        >
          {renderContent()}
        </Content>
      </Layout>
      <Modal
        title={editingUser ? "编辑用户" : "添加用户"}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingUser(null);
        }}
      >
        <Form form={form} onFinish={handleSubmitUser} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: "请输入密码" }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: "请选择角色" }]}
          >
            <Select>
              {availableRoles().map((role) => (
                <Option key={role} value={role}>
                  {ROLE_NAMES[role]}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminPage;
