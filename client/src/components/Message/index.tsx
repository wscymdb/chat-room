import React from "react";
import { Avatar, message, Tooltip } from "antd";
import {
  UserOutlined,
  RobotOutlined,
  CopyOutlined,
  BookOutlined,
} from "@ant-design/icons";
import classNames from "classnames";
import ReactMarkdown from "react-markdown";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import "./index.less";

// 注册常用语言
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("java", java);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("json", json);

// 自定义代码高亮主题
const customStyle = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    margin: "0",
    borderRadius: "0 0 4px 4px",
    fontSize: "14px",
    background: "#282c34",
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    fontSize: "14px",
  },
};

interface MessageProps {
  content: string;
  timestamp: number;
  username?: string;
  isSelf?: boolean;
  type: "user" | "bot" | "poemBot";
  tokens?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  userId: string;
}

const Message: React.FC<MessageProps> = ({
  content,
  timestamp,
  username,
  isSelf = false,
  type = "user",
  tokens,
  userId,
}) => {
  const formatMessageTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // 根据消息类型确定显示的用户名
  const getDisplayUsername = () => {
    if (isSelf) return "我";
    if (type === "bot") return "AI助手";
    if (userId === "poemBot") return "诗词机器人";
    return username;
  };

  // 根据消息类型确定头像
  const getAvatarIcon = () => {
    if (isSelf) return <UserOutlined />;
    if (type === "bot") return <RobotOutlined />;
    if (userId === "poemBot") return <BookOutlined />;
    return <UserOutlined />;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success("已复制到剪贴板");
    });
  };

  // 自定义渲染代码块
  const renderCodeBlock = (code: string, language: string) => {
    return (
      <div className="code-block-wrapper">
        <div className="code-block-header">
          <span className="code-language">{language.toUpperCase()}</span>
          <Tooltip title="复制代码">
            <CopyOutlined
              className="copy-icon"
              onClick={() => handleCopy(code)}
            />
          </Tooltip>
        </div>
        <SyntaxHighlighter
          language={language}
          style={customStyle}
          showLineNumbers
          wrapLines
          lineNumberStyle={{
            minWidth: "2.5em",
            textAlign: "right",
            marginRight: "1em",
            color: "#636e7b",
            borderRight: "1px solid #4b5263",
            paddingRight: "8px",
          }}
          customStyle={{ padding: "16px 0", margin: 0 }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  };

  // 解析 Markdown 内容
  const renderBotContent = () => {
    // 如果是诗词机器人，使用特殊渲染
    if (userId === "poemBot") {
      return renderPoemContent();
    }

    // 使用正则表达式匹配代码块
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    const parts = [];
    let match;

    // 查找所有代码块
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // 添加代码块前的文本
      if (match.index > lastIndex) {
        parts.push(
          <ReactMarkdown key={`text-${lastIndex}`}>
            {content.substring(lastIndex, match.index)}
          </ReactMarkdown>
        );
      }

      // 添加代码块
      const language = match[1] || "text";
      const code = match[2];
      parts.push(renderCodeBlock(code, language));

      lastIndex = match.index + match[0].length;
    }

    // 添加最后一部分文本
    if (lastIndex < content.length) {
      parts.push(
        <ReactMarkdown key={`text-${lastIndex}`}>
          {content.substring(lastIndex)}
        </ReactMarkdown>
      );
    }

    return parts.length > 0 ? parts : <ReactMarkdown>{content}</ReactMarkdown>;
  };

  // 添加诗词特殊渲染函数
  const renderPoemContent = () => {
    // 尝试提取诗名、作者、诗句和解析
    const lines = content.split("\n");
    let poemTitle = "";
    let poemAuthor = "";
    let poemContent = [];
    let poemAnalysis = "";

    let currentSection = "header";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (i === 0) {
        // 第一行通常是诗名
        poemTitle = line;
      } else if (i === 1) {
        // 第二行通常是作者
        poemAuthor = line;
      } else if (line.startsWith("【解析】") || line.includes("【解析】")) {
        // 标记为解析部分开始
        currentSection = "analysis";
        poemAnalysis +=
          line.replace("【解析】：", "").replace("【解析】", "") + "\n";
      } else if (currentSection === "analysis") {
        // 如果当前是解析部分，就继续添加到解析中
        poemAnalysis += line + "\n";
      } else if (line.length > 0) {
        // 其他非空行是诗句
        poemContent.push(line);
      }
    }

    return (
      <div className="poem-content">
        <div className="poem-header">
          <div className="poem-title">{poemTitle}</div>
          <div className="poem-author">{poemAuthor}</div>
        </div>
        <div className="poem-verses">
          {poemContent.map((verse, index) => (
            <div key={index} className="poem-verse">
              <ReactMarkdown>{verse}</ReactMarkdown>
            </div>
          ))}
        </div>
        {poemAnalysis && (
          <div className="poem-analysis">
            <div className="analysis-title">【解析】</div>
            <div className="analysis-content">
              <ReactMarkdown>{poemAnalysis}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={classNames("message-item", {
        "message-item-right": isSelf,
        "message-item-left": !isSelf,
      })}
    >
      <Avatar icon={getAvatarIcon()} className="message-avatar" />
      <div
        className={classNames("message-content", {
          "message-content-right": isSelf,
          "message-content-left": !isSelf,
          "message-content-bot": type === "bot" && !isSelf,
        })}
      >
        <div className="message-username">{getDisplayUsername()}</div>
        <div className="message-bubble">
          {userId === "bot" ? (
            <div>
              {!content.includes("🤔 机器人思考中") && (
                <div className="message-bot-header">
                  <Tooltip title="复制全部">
                    <CopyOutlined
                      className="copy-message-icon"
                      onClick={() => handleCopy(content)}
                    />
                  </Tooltip>
                </div>
              )}
              {content.includes("🤔 机器人思考中") ? (
                <div className="thinking-message">{content}</div>
              ) : (
                renderBotContent()
              )}
              {!content.includes("🤔 机器人思考中") && tokens && (
                <div className="message-bot-footer">
                  <div className="message-tokens">
                    {tokens.total_tokens && (
                      <span>总tokens: {tokens.total_tokens}</span>
                    )}
                    {tokens.prompt_tokens && tokens.completion_tokens && (
                      <span className="token-detail">
                        (提问: {tokens.prompt_tokens} / 回复:{" "}
                        {tokens.completion_tokens})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : userId === "poemBot" ? (
            <div>
              {!content.includes("🤔 诗词机器人思考中") && (
                <div className="message-bot-header">
                  <Tooltip title="复制全部">
                    <CopyOutlined
                      className="copy-message-icon"
                      onClick={() => handleCopy(content)}
                    />
                  </Tooltip>
                </div>
              )}
              {content.includes("🤔 诗词机器人思考中") ? (
                <div className="thinking-message">{content}</div>
              ) : (
                renderBotContent()
              )}
              {!content.includes("🤔 诗词机器人思考中") && tokens && (
                <div className="message-bot-footer">
                  <div className="message-tokens">
                    {tokens.total_tokens && (
                      <span>总tokens: {tokens.total_tokens}</span>
                    )}
                    {tokens.prompt_tokens && tokens.completion_tokens && (
                      <span className="token-detail">
                        (提问: {tokens.prompt_tokens} / 回复:{" "}
                        {tokens.completion_tokens})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            content
          )}
          <div className="message-time">{formatMessageTime(timestamp)}</div>
        </div>
      </div>
    </div>
  );
};

export default Message;
