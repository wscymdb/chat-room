import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./index.less";

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, user, token } = useAuth();
  const [loading, setLoading] = useState(false);

  // 检查是否已登录
  useEffect(() => {
    if (user && token) {
      navigate("/chat");
    }
  }, [user, token, navigate]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      await login(values.username, values.password);
      message.success("登录成功！");
      // 登录成功后，AuthContext 中的 useEffect 会自动触发导航
    } catch (error: any) {
      console.error("登录失败:", error);
      message.error(error.message || "登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Title level={2} className="title">
          登录聊天室
        </Title>
        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
              className="input"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
              className="input"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              className="submit-button"
            >
              登录
            </Button>
          </Form.Item>
          <div className="register-link">
            <Text className="text">还没有账号？</Text>
            <Link to="/register" className="link">
              立即注册
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
