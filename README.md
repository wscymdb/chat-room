# 实时聊天室应用

> 🚀 这是一个使用 Cursor AI 辅助开发的实时聊天室应用

## 项目简介

这是一个基于 React + TypeScript + Socket.IO 的实时聊天室应用，具有以下特点：

- 用户注册和登录
- 实时消息发送和接收
- 在线用户列表
- 消息历史记录
- 响应式设计

## 技术栈

- **前端**：

  - React 18
  - TypeScript
  - Material-UI
  - Socket.IO Client
  - Vite

- **后端**：
  - Node.js
  - Express
  - Socket.IO
  - TypeScript

## 开发环境设置

1. 克隆仓库：

```bash
git clone [your-repository-url]
cd chat-room
```

2. 安装依赖：

```bash
# 安装客户端依赖
cd client
npm install

# 安装服务器依赖
cd ../server
npm install
```

3. 配置环境变量：

- 复制 `.env.example` 文件并重命名为 `.env`
- 根据你的环境修改配置

4. 启动开发服务器：

```bash
# 启动客户端
cd client
npm run dev

# 启动服务器
cd ../server
npm run dev
```

## 生产环境部署

1. 构建前端：

```bash
cd client
npm run build
```

2. 部署服务器：

```bash
cd server
npm run build
npm start
```

## 项目结构

```
chat-room/
├── client/                 # 前端代码
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── contexts/       # React Context
│   │   └── ...
│   └── ...
└── server/                 # 后端代码
    ├── src/
    │   ├── controllers/    # 控制器
    │   ├── routes/         # 路由
    │   ├── socket/         # Socket.IO 处理
    │   └── ...
    └── ...
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT

---

> 💡 这个项目是使用 [Cursor](https://cursor.sh/) AI 辅助开发的。Cursor 是一个强大的 AI 编程助手，帮助开发者更高效地编写代码。
