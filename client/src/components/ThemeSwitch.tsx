import React from "react";
import { Button, Dropdown, Space } from "antd";
import { BulbOutlined, BulbFilled } from "@ant-design/icons";
import { useTheme, ThemeMode } from "../contexts/ThemeContext";

const ThemeSwitch: React.FC = () => {
  const { theme, setTheme, isDarkMode } = useTheme();

  const items = [
    {
      key: "light",
      label: "浅色模式",
      icon: <BulbOutlined />,
    },
    {
      key: "dark",
      label: "深色模式",
      icon: <BulbFilled />,
    },
    {
      key: "system",
      label: "跟随系统",
      icon: <BulbOutlined />,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    setTheme(key as ThemeMode);
  };

  return (
    <Dropdown
      menu={{
        items,
        onClick: handleMenuClick,
        selectedKeys: [theme],
      }}
      placement="bottomRight"
    >
      <Button type="text" icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}>
        主题
      </Button>
    </Dropdown>
  );
};

export default ThemeSwitch;
