import React, { useState, useEffect } from "react";
import { Modal, Form, InputNumber, Button, message } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import axios from "axios";

interface BotConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

interface BotConfig {
  temperature: number;
  maxTokens: number;
}

const BotConfigModal: React.FC<BotConfigModalProps> = ({
  visible,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchConfig();
    }
  }, [visible]);

  const fetchConfig = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/bot/config`
      );
      form.setFieldsValue(response.data);
    } catch (error) {
      message.error("获取配置失败");
    }
  };

  const handleSubmit = async (values: BotConfig) => {
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bot/config`,
        values
      );
      message.success("配置保存成功");
      onClose();
    } catch (error) {
      message.error("保存配置失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <span>
          <SettingOutlined /> AI 助手配置
        </span>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          temperature: 0.7,
          maxTokens: 1000,
        }}
      >
        <Form.Item
          label="随机性 (Temperature)"
          name="temperature"
          tooltip="值越高，输出越随机；值越低，输出越确定"
          rules={[{ required: true, message: "请输入随机性值" }]}
        >
          <InputNumber min={0} max={2} step={0.1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="最大 Token 数"
          name="maxTokens"
          tooltip="控制生成文本的最大长度"
          rules={[{ required: true, message: "请输入最大 Token 数" }]}
        >
          <InputNumber
            min={100}
            max={4000}
            step={100}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            保存配置
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BotConfigModal;
