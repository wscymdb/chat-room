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
  Select,
} from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./index.less";

const { Title, Text } = Typography;
const { Option } = Select;

interface BotConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt: string;
}

// 预设提示词接口
interface PromptPreset {
  id: string;
  name: string;
  content: string;
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
  const [presets, setPresets] = useState<PromptPreset[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConfig();
    fetchPresets();
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

  const fetchPresets = async () => {
    try {
      setLoadingPresets(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/prompt-presets`
      );
      setPresets(response.data || []);
    } catch (error) {
      console.error("获取预设失败:", error);
      message.error("获取预设失败");
      // 如果API失败，使用默认预设
      setPresets([
        {
          id: "1",
          name: "通用助手",
          content:
            "你是一个专业的AI助手，请用简洁明了的语言回答用户的问题。回答要准确、专业，同时保持友好和易于理解。如果遇到不确定的问题，请诚实地告诉用户。",
        },
        {
          id: "2",
          name: "客服助手",
          content:
            "你是一个专业的客服助手，你的任务是帮助用户解决产品使用中遇到的问题。保持友好、耐心的态度，尽可能提供详细的解决方案。对于无法解决的问题，请引导用户联系人工客服。",
        },
        {
          id: "3",
          name: "技术专家",
          content:
            "你是一个技术领域的专家，擅长解答编程、网络、硬件等技术问题。请提供专业、准确的技术解答，必要时可以提供代码示例或步骤指导。保持专业性的同时，确保回答通俗易懂。",
        },
      ]);
    } finally {
      setLoadingPresets(false);
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
      // 获取当前内容
      const currentPrompt = form.getFieldValue("systemPrompt") || "";

      setPromptLoading(true);

      console.log("当前提示词:", currentPrompt);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/generate-prompt`,
        { currentPrompt }
      );

      console.log("API响应:", response.data);

      if (response.data && response.data.prompt) {
        const newPrompt = response.data.prompt;

        // 更新编辑器内容
        form.setFieldsValue({ systemPrompt: newPrompt });

        console.log("设置新提示词:", newPrompt);
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

  // 处理预设选择
  const handlePresetChange = (presetId: string) => {
    if (presetId === "manage") {
      // 导航到预设管理页面
      navigate("/admin/prompt-presets");
      return;
    }

    const selectedPreset = presets.find((preset) => preset.id === presetId);
    if (selectedPreset) {
      form.setFieldsValue({ systemPrompt: selectedPreset.content });
      message.success(`已应用"${selectedPreset.name}"预设`);
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

              <Form.Item label="应用预设" tooltip="选择预设的系统提示词模板">
                <Select
                  placeholder="选择预设提示词"
                  style={{ width: "100%" }}
                  onChange={handlePresetChange}
                  loading={loadingPresets}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Button
                        type="text"
                        icon={<SettingOutlined />}
                        style={{ width: "100%", textAlign: "left" }}
                        onClick={() => navigate("/admin/prompt-presets")}
                      >
                        管理预设提示词
                      </Button>
                    </>
                  )}
                >
                  {presets.map((preset) => (
                    <Option key={preset.id} value={preset.id}>
                      {preset.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <>
                    <span>系统提示词</span>
                    <span className="description">
                      设置系统提示词，用来定义AI助手的行为
                    </span>
                  </>
                }
                name="systemPrompt"
              >
                <Input.TextArea rows={10} onKeyDown={handleKeyDown} />
              </Form.Item>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: "16px",
                }}
              >
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
