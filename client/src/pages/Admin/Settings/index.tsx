import React from "react";
import { Card, Typography } from "antd";
import "./index.less";

const { Title } = Typography;

const SettingsPage: React.FC = () => {
  return (
    <div className="settings-page">
      <Card>
        <Title level={3}>系统设置</Title>
        <p>系统设置功能开发中...</p>
      </Card>
    </div>
  );
};

export default SettingsPage;
