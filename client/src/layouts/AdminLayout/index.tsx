import React, { useState } from "react";
import { Layout, Menu, Button } from "antd";
import {
  UserOutlined,
  MessageOutlined,
  SettingOutlined,
  LogoutOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./index.less";

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      key: "/admin/users",
      icon: <UserOutlined />,
      label: <Link to="/admin/users">用户管理</Link>,
    },
    {
      key: "/admin/messages",
      icon: <MessageOutlined />,
      label: <Link to="/admin/messages">消息管理</Link>,
    },
    {
      key: "/admin/settings",
      icon: <SettingOutlined />,
      label: <Link to="/admin/settings">系统设置</Link>,
    },
  ];

  return (
    <Layout className="admin-layout">
      <Header className="admin-header">
        <div className="header-left">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/chat")}
            className="back-button"
          >
            返回聊天室
          </Button>
          <div className="logo">聊天室管理系统</div>
        </div>
        <div className="user-info">
          <span>欢迎，{user?.username}</span>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            className="logout-button"
          >
            退出
          </Button>
        </div>
      </Header>
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          theme="light"
        >
          <Menu
            theme="light"
            selectedKeys={[location.pathname]}
            mode="inline"
            style={{ height: "100%", borderRight: 0 }}
            items={menuItems}
          />
        </Sider>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
