# 实时聊天室应用

一个基于 React + Node.js 的现代化实时聊天应用，支持多用户聊天、权限管理和主题切换。

## 功能特点

### 基础功能 (v1.0.0)

- 实时消息发送和接收
- 在线用户列表
- 用户上线/下线提醒
- 消息时间戳
- 消息历史记录
- 用户输入状态提示
- 消息搜索功能

### 权限系统 (v2.0.0)

- 用户角色管理（超级管理员、管理员、普通用户）
- 用户管理界面
  - 创建/编辑/删除用户
  - 角色分配
- 消息管理
  - 消息审核
  - 消息删除
- 权限控制
  - 基于角色的访问控制
  - 操作权限管理

### 主题系统 (v3.0.0)

- 明暗主题切换
- 自定义主题色（紫色主题）
- 响应式设计
- 现代化 UI 界面
- 消息气泡样式优化
- 组件主题适配

### AI 聊天机器人与高级消息功能 (v4.0.0)

- AI 聊天机器人 (DeepSeek)
  - 通过 @bot 指令调用
  - 支持多轮对话和上下文理解
  - 「思考中」状态显示
  - Token 消耗统计
- 增强的消息展示
  - Markdown 格式支持
  - 代码高亮显示
  - 代码块复制功能
  - 适配暗色/亮色主题
- 管理功能增强
  - 超级管理员可一键清空所有消息
  - 更完善的权限控制
- 连接稳定性增强
  - 自动重连机制
  - 连接状态提示
  - 错误处理优化

## 技术栈

### 前端

- React 18
- TypeScript
- Ant Design
- Socket.IO Client
- Less
- React Router
- Context API
- React Markdown
- React Syntax Highlighter

### 后端

- Node.js
- Express
- Socket.IO
- 文件存储系统
- JWT 认证
- DeepSeek API 集成

## 开发环境设置

1. 克隆仓库

```bash
git clone [repository-url]
cd chat-room
```

2. 安装依赖

```bash
# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install
```

3. 环境变量配置

```bash
# 在 client 目录下创建 .env 文件
VITE_API_URL=http://localhost:3000

# 在 server 目录下创建 .env 文件
PORT=3000
JWT_SECRET=your_jwt_secret
DEEPSEEK_API_KEY=your_deepseek_api_key
```

4. 启动应用

```bash
# 启动前端开发服务器
cd client
npm run dev

# 启动后端服务器
cd ../server
npm run dev
```

## 版本历史

### v1.0.0 - 基础功能开发

- 实现基本的聊天功能
- 用户认证系统
- 实时消息传递
- 在线用户管理
- 基础 UI 界面

### v2.0.0 - 权限系统开发

- 引入用户角色系统
- 添加管理员控制面板
- 用户管理功能
- 消息管理功能
- 权限控制系统

### v3.0.0 - 主题系统

- 添加暗色主题支持
- 引入主题色系统
- UI 组件主题适配
- 消息气泡样式优化
- 响应式设计优化

### v4.0.0 - AI 助手与高级消息

- 集成 DeepSeek AI 聊天机器人
- 添加 Markdown 和代码高亮支持
- 实现复制功能和 Token 统计
- 超级管理员一键清空消息功能
- 优化连接稳定性和错误处理
- 完善主题适配，确保所有元素在明暗主题下可见

## 使用说明

### 用户角色

- 超级管理员：拥有所有权限，可以管理其他管理员和一键清空所有消息
- 管理员：可以管理普通用户和消息
- 普通用户：基本的聊天功能和使用 AI 助手

### 主题切换

- 点击右上角的主题切换按钮可以在明暗主题间切换
- 系统会自动记住用户的主题偏好
- 所有元素（包括消息时间、代码块等）都会根据主题自动调整颜色

### 消息管理

- 管理员可以在管理面板中查看和删除消息
- 支持消息搜索和按用户筛选
- 超级管理员可以一键清空所有消息

### 使用 AI 助手

- 在消息框中输入 `@bot` 加上你的问题
- AI 助手会显示"思考中"状态，然后回复你的问题
- AI 回复支持 Markdown 格式和代码高亮
- 可以复制整个回复或单独复制代码块
- 系统会显示每次对话消耗的 Token 数量

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT License - 详见 LICENSE 文件

---

> 💡 这个项目是使用 [Cursor](https://cursor.sh/) AI 辅助开发的。Cursor 是一个强大的 AI 编程助手，帮助开发者更高效地编写代码。
