import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Row,
  Col,
  Tooltip,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./index.less";

const { Title, Text, Link } = Typography;
const { TextArea } = Input;

// 预设提示词接口
interface PromptPreset {
  id: string;
  name: string;
  content: string;
}

const PromptPresetsPage: React.FC = () => {
  const [presets, setPresets] = useState<PromptPreset[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPreset, setEditingPreset] = useState<PromptPreset | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  const showAddModal = () => {
    setEditingPreset(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (preset: PromptPreset) => {
    setEditingPreset(preset);
    form.setFieldsValue(preset);
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingPreset) {
        // 编辑现有预设
        setLoading(true);
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/prompt-presets/${
            editingPreset.id
          }`,
          values
        );
        setPresets((prev) =>
          prev.map((p) => (p.id === editingPreset.id ? response.data : p))
        );
        message.success("预设更新成功");
      } else {
        // 添加新预设
        setLoading(true);
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/prompt-presets`,
          values
        );
        setPresets((prev) => [...prev, response.data]);
        message.success("预设添加成功");
      }

      setModalVisible(false);
    } catch (error) {
      console.error("表单验证或提交错误:", error);
      message.error("操作失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/prompt-presets/${id}`
      );
      setPresets((prev) => prev.filter((p) => p.id !== id));
      message.success("预设删除成功");
    } catch (error) {
      console.error("删除预设失败:", error);
      message.error("删除预设失败");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "内容预览",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      render: (text: string) => (
        <Tooltip
          title={
            <div
              style={{
                maxWidth: "500px",
                maxHeight: "300px",
                overflow: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {text}
            </div>
          }
          placement="topLeft"
          overlayStyle={{ maxWidth: "500px" }}
        >
          <span style={{ cursor: "pointer" }}>
            {text.length > 50 ? `${text.slice(0, 50)}...` : text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: PromptPreset) => (
        <Space split={<Divider type="vertical" />} size="small">
          <Link onClick={() => showEditModal(record)}>
            <Space>
              <EditOutlined />
              编辑
            </Space>
          </Link>
          <Popconfirm
            title="确定要删除这个预设吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Link type="danger">
              <Space>
                <DeleteOutlined />
                删除
              </Space>
            </Link>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="presets-page">
      <Card>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 20 }}
        >
          <Col>
            <Space split={<Divider type="vertical" />}>
              <Link onClick={() => navigate("/admin/settings")}>
                <Space>
                  <ArrowLeftOutlined />
                  返回
                </Space>
              </Link>
              <Title level={3} style={{ margin: 0 }}>
                提示词预设管理
              </Title>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showAddModal}
            >
              新增预设
            </Button>
          </Col>
        </Row>

        <Text type="secondary" style={{ marginBottom: 20, display: "block" }}>
          管理系统提示词预设，可以快速切换不同场景下的AI助手角色设定。
        </Text>

        <Table
          columns={columns}
          dataSource={presets}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingPreset ? "编辑预设" : "添加预设"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="预设名称"
            rules={[{ required: true, message: "请输入预设名称" }]}
          >
            <Input placeholder="例如：通用助手、客服助手" />
          </Form.Item>
          <Form.Item
            name="content"
            label="提示词内容"
            rules={[{ required: true, message: "请输入提示词内容" }]}
          >
            <TextArea
              rows={6}
              placeholder="例如：你是一个专业的AI助手，请用简洁明了的语言回答用户的问题..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PromptPresetsPage;
