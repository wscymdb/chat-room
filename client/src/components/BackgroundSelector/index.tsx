import React from "react";
import { Tooltip, Button, Popover } from "antd";
import { BgColorsOutlined } from "@ant-design/icons";
import "./index.less";

// 预设的渐变背景
export const GRADIENT_PRESETS = {
  default: {
    name: "默认紫",
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    opacity: 0.05,
  },
  blue: {
    name: "湖水蓝",
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #2dd4bf 100%)",
    opacity: 0.07,
  },
  green: {
    name: "薄荷绿",
    gradient: "linear-gradient(135deg, #22c55e 0%, #84cc16 100%)",
    opacity: 0.06,
  },
  sunset: {
    name: "日落橙",
    gradient: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
    opacity: 0.05,
  },
  night: {
    name: "夜空蓝",
    gradient: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
    opacity: 0.1,
  },
  sakura: {
    name: "樱花粉",
    gradient: "linear-gradient(135deg, #fb7185 0%, #f472b6 100%)",
    opacity: 0.05,
  },
} as const;

export type GradientType = keyof typeof GRADIENT_PRESETS;

interface BackgroundSelectorProps {
  currentBackground: GradientType;
  onChange: (type: GradientType) => void;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  currentBackground,
  onChange,
}) => {
  const content = (
    <div className="background-options">
      {Object.entries(GRADIENT_PRESETS).map(([key, value]) => (
        <Tooltip key={key} title={value.name}>
          <div
            className={`gradient-option ${
              currentBackground === key ? "active" : ""
            }`}
            style={{ background: value.gradient }}
            onClick={() => {
              onChange(key as GradientType);
              document.documentElement.style.setProperty(
                "--primary-gradient",
                value.gradient
              );
              document.documentElement.style.setProperty(
                "--bg-opacity",
                value.opacity.toString()
              );
            }}
          />
        </Tooltip>
      ))}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottom"
      title="选择背景"
    >
      <Tooltip title="切换背景">
        <Button
          type="text"
          icon={<BgColorsOutlined />}
          className="bg-selector-button"
        />
      </Tooltip>
    </Popover>
  );
};

export default BackgroundSelector;
