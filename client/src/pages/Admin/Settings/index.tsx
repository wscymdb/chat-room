import React, { useState, useEffect, KeyboardEvent } from "react";
import {
  Card,
  Form,
  InputNumber,
  Button,
  message,
  Typography,
  Divider,
  Space,
  Input,
  Row,
  Col,
} from "antd";
import axios from "axios";
import "./index.less";

const { Title, Text } = Typography;

interface BotConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt: string;
}

const defaultConfig: BotConfig = {
  temperature: 0.7,
  maxTokens: 1500,
  topP: 0.9,
  frequencyPenalty: 0.5,
  presencePenalty: 0.5,
  systemPrompt:
    "你是一个专业的AI助手，请用简洁明了的语言回答用户的问题。回答要准确、专业，同时保持友好和易于理解。如果遇到不确定的问题，请诚实地告诉用户。",
};

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/bot-config`
      );
      form.setFieldsValue(response.data || defaultConfig);
    } catch (error) {
      message.error("获取配置失败");
      form.setFieldsValue(defaultConfig);
    }
  };

  const handleSubmit = async (values: BotConfig) => {
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bot-config`,
        values
      );
      message.success("配置保存成功");
    } catch (error) {
      message.error("保存配置失败");
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = () => {
    form.setFieldsValue(defaultConfig);
    message.success("已恢复默认设置，请点击保存使其生效");
  };

  const generatePrompt = async () => {
    try {
      const currentPrompt = form.getFieldValue("systemPrompt") || "";
      setPromptLoading(true);

      console.log("当前提示词:", currentPrompt);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/generate-prompt`,
        { currentPrompt }
      );

      console.log("API响应:", response.data);

      if (response.data && response.data.prompt) {
        form.setFieldsValue({ systemPrompt: response.data.prompt });
        console.log("设置新提示词:", response.data.prompt);
        message.success("已生成系统提示词建议");
      } else {
        message.error("生成系统提示词失败");
      }
    } catch (error) {
      message.error("生成系统提示词失败");
      console.error("生成提示词错误:", error);
    } finally {
      setPromptLoading(false);
    }
  };

  // 处理Tab键事件
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab" && !e.shiftKey && !promptLoading) {
      e.preventDefault(); // 阻止默认Tab行为
      generatePrompt();
    }
  };

  return (
    <div className="settings-page">
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3}>AI 助手配置</Title>
          </Col>
          <Col>
            <Button onClick={resetToDefault}>恢复默认值</Button>
          </Col>
        </Row>
        <Text type="secondary" className="description">
          在这里您可以调整 AI 助手的回答风格和性能参数。修改后点击保存即可生效。
        </Text>

        <Divider />

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div className="config-section">
              <Title level={4}>回答风格</Title>
              <Form.Item
                label="回答随机性"
                name="temperature"
                tooltip="控制回答的随机程度。值越高，回答越多样化；值越低，回答越稳定。"
                rules={[{ required: true, message: "请输入随机性值" }]}
              >
                <InputNumber
                  min={0}
                  max={2}
                  step={0.1}
                  style={{ width: "100%" }}
                  addonAfter="0-2"
                />
              </Form.Item>

              <Form.Item
                label="回答长度"
                name="maxTokens"
                tooltip="控制回答的最大长度。值越大，回答可以越长；值越小，回答越简短。"
                rules={[{ required: true, message: "请输入最大 Token 数" }]}
              >
                <InputNumber
                  min={100}
                  max={4000}
                  step={100}
                  style={{ width: "100%" }}
                  addonAfter="100-4000"
                />
              </Form.Item>
            </div>

            <div className="config-section">
              <Title level={4}>高级设置</Title>
              <Form.Item
                label="回答多样性"
                name="topP"
                tooltip="控制回答的多样性。值越高，回答越多样化；值越低，回答越保守。"
                rules={[{ required: true, message: "请输入多样性值" }]}
              >
                <InputNumber
                  min={0}
                  max={1}
                  step={0.1}
                  style={{ width: "100%" }}
                  addonAfter="0-1"
                />
              </Form.Item>

              <Form.Item
                label="重复惩罚"
                name="frequencyPenalty"
                tooltip="控制回答中避免重复的程度。值越高，越避免重复；值越低，允许更多重复。"
                rules={[{ required: true, message: "请输入重复惩罚值" }]}
              >
                <InputNumber
                  min={-2}
                  max={2}
                  step={0.1}
                  style={{ width: "100%" }}
                  addonAfter="-2-2"
                />
              </Form.Item>

              <Form.Item
                label="话题惩罚"
                name="presencePenalty"
                tooltip="控制回答中避免重复话题的程度。值越高，越避免重复话题；值越低，允许更多重复话题。"
                rules={[{ required: true, message: "请输入话题惩罚值" }]}
              >
                <InputNumber
                  min={-2}
                  max={2}
                  step={0.1}
                  style={{ width: "100%" }}
                  addonAfter="-2-2"
                />
              </Form.Item>
            </div>

            <div className="config-section">
              <Title level={4}>系统提示词</Title>
              <Form.Item
                label="系统提示"
                name="systemPrompt"
                tooltip="设置 AI 助手的基本角色和回答风格。按Tab键可自动补全提示词。"
                rules={[{ required: true, message: "请输入系统提示词" }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="例如：你是一个专业的AI助手，请用简洁明了的语言回答用户的问题。按Tab键补全..."
                  onKeyDown={handleKeyDown}
                />
              </Form.Item>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <span
                  className="text-muted"
                  style={{ fontSize: "12px", color: "#888" }}
                >
                  提示: 按Tab键可快速补全提示词
                </span>
                <Button
                  type="default"
                  onClick={generatePrompt}
                  loading={promptLoading}
                >
                  AI补全提示词
                </Button>
              </div>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                保存配置
              </Button>
            </Form.Item>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage;
