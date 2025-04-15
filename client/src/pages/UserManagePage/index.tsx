import React, { useState, useEffect } from "react";
import {
  Table,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { User, UserRole, ROLE_NAMES } from "../../types/auth";

const { Option } = Select;

const UserManagePage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const { user: currentUser, hasPermission } = useAuth();

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
    fetchUsers();
  }, []);

  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${id}`);
      message.success("删除成功");
      fetchUsers();
    } catch (error) {
      message.error("删除失败");
    }
  };

  const handleSubmit = async (values: any) => {
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
      render: (role: UserRole) => ROLE_NAMES[role],
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: User) => (
        <Space>
          {hasPermission(UserRole.ADMIN) &&
            record.role !== UserRole.SUPER_ADMIN && (
              <>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
                <Popconfirm
                  title="确定要删除此用户吗？"
                  onConfirm={() => handleDelete(record.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </>
            )}
        </Space>
      ),
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

  return (
    <div className="user-manage">
      <div style={{ marginBottom: 16 }}>
        {hasPermission(UserRole.ADMIN) && (
          <Button type="primary" onClick={() => setModalVisible(true)}>
            添加用户
          </Button>
        )}
      </div>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          size: "small",
          showTotal: (total) => `共 ${total} 条`,
          showSizeChanger: false,
          showQuickJumper: false,
          simple: true,
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
        <Form form={form} onFinish={handleSubmit} layout="vertical">
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

export default UserManagePage;
