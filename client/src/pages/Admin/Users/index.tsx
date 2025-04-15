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

const { Title } = Typography;
const { Option } = Select;

const UsersPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

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
        if (record.role === UserRole.SUPER_ADMIN) {
          return null;
        }

        if (user?.role === UserRole.ADMIN && record.role === UserRole.ADMIN) {
          return null;
        }

        if (
          user?.role === UserRole.SUPER_ADMIN ||
          user?.role === UserRole.ADMIN
        ) {
          return (
            <Space>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEditUser(record)}
              />
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteUser(record.id)}
              />
            </Space>
          );
        }

        return null;
      },
    },
  ];

  const availableRoles = () => {
    if (user?.role === UserRole.SUPER_ADMIN) {
      return [UserRole.ADMIN, UserRole.USER];
    }
    if (user?.role === UserRole.ADMIN) {
      return [UserRole.USER];
    }
    return [];
  };

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
        pagination={{ pageSize: 10 }}
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
