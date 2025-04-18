import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Typography,
  Divider,
} from "antd";
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";
import { User, UserRole, ROLE_NAMES } from "../../../types/auth";
import "./index.less";

const { Title, Link } = Typography;
const { Option } = Select;

const UsersPage: React.FC = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("API URL:", import.meta.env.VITE_API_URL);
      console.log("Token:", token);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(response.data);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      console.error("Error response:", error.response);
      message.error(error.response?.data?.message || "获取用户列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue({
      username: record.username,
      role: record.role,
    });
    setModalVisible(true);
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success("删除成功");
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || "删除失败");
    }
  };

  const handleSubmitUser = async (values: any) => {
    try {
      if (editingUser) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/users/${editingUser.id}`,
          values,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        message.success("更新成功");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/users`, values, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        message.success("添加成功");
      }
      setModalVisible(false);
      form.resetFields();
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      message.error(
        error.response?.data?.message || (editingUser ? "更新失败" : "添加失败")
      );
    }
  };

  const columns = [
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
        if (user?.role === UserRole.USER) {
          return null;
        }

        if (
          user?.role === UserRole.ADMIN &&
          record.role === UserRole.SUPER_ADMIN
        ) {
          return null;
        }

        return (
          <Space split={<Divider type="vertical" />} size="small">
            <Link onClick={() => handleEditUser(record)}>
              <Space>
                <EditOutlined />
                编辑
              </Space>
            </Link>
            {(user?.role === UserRole.SUPER_ADMIN ||
              (user?.role === UserRole.ADMIN && record.id === user.id)) && (
              <Link
                type="danger"
                onClick={() => {
                  Modal.confirm({
                    title: "确认删除",
                    content: `确定要删除用户 ${record.username} 吗？`,
                    okText: "确定",
                    cancelText: "取消",
                    onOk: () => handleDeleteUser(record.id),
                  });
                }}
              >
                <Space>
                  <DeleteOutlined />
                  删除
                </Space>
              </Link>
            )}
          </Space>
        );
      },
    },
  ];

  const availableRoles = () => {
    if (user?.role === UserRole.SUPER_ADMIN) {
      return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER];
    }
    if (user?.role === UserRole.ADMIN) {
      return [UserRole.ADMIN, UserRole.USER];
    }
    return [];
  };

  if (!token) {
    return null;
  }

  return (
    <div className="users-page">
      <div className="content-header">
        <Title level={3}>用户管理</Title>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setModalVisible(true)}
        >
          添加用户
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          size: "small",
          showTotal: (total) => `共 ${total} 条`,
          hideOnSinglePage: true,
        }}
      />

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
    </div>
  );
};

export default UsersPage;
