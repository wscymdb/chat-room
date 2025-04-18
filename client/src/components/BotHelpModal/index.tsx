import React from "react";
import { Modal, Button, Divider, Card } from "antd";
import "./index.less";

interface BotHelpModalProps {
  visible: boolean;
  onClose: () => void;
}

const BotHelpModal: React.FC<BotHelpModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      title="聊天机器人使用指南"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          知道了
        </Button>,
      ]}
      width={600}
    >
      <Divider orientation="left">AI助手</Divider>
      <p>
        <strong>使用方法：</strong>在消息框中输入 @bot 加上您的问题
      </p>
      <p>
        <strong>示例：</strong>@bot 今天天气怎么样？
      </p>

      <Divider orientation="left">诗词机器人</Divider>
      <Card title="诗词机器人使用指南" className="bot-guide-card">
        <p>
          <strong>基本用法：</strong>
        </p>
        <ul>
          <li>
            <strong>随机推荐诗词：</strong>输入 @poem 并发送
          </li>
          <li>
            <strong>推荐特定作者的诗词：</strong>输入 @poem 李白
          </li>
          <li>
            <strong>根据主题查找诗词：</strong>输入 @poem 思乡
          </li>
        </ul>
        <p>
          <strong>示例：</strong>
        </p>
        <ul>
          <li>@poem （随机推荐一首诗词）</li>
          <li>@poem 杜甫 （推荐杜甫的诗词）</li>
          <li>@poem 春天 （推荐与春天相关的诗词）</li>
          <li>@poem 李白的诗 （推荐李白的诗词）</li>
        </ul>
        <p>每首诗词都会包含诗名、作者、诗句和详细解析。</p>
      </Card>
    </Modal>
  );
};

export default BotHelpModal;
