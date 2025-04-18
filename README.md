# 实时聊天室应用

一个基于 React + Node.js 的现代化实时聊天应用，支持多用户聊天、权限管理、主题切换和智能机器人助手（AI 助手和诗词机器人）。

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
  - "思考中"状态显示
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

### 诗词机器人 (v5.0.0)

- 诗词推荐机器人
  - 通过 @poem 指令调用
  - 随机推荐中国古诗词
  - 支持按作者查询（如 @poem 李白）
  - 支持按主题查询（如 @poem 思乡）
  - 自动提取诗名、作者、诗句和解析
  - 美观的诗词展示样式
  - 深色/浅色主题自适应
  - "思考中"状态显示
  - Token 消耗统计

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

在项目根目录下创建 `.env` 文件：

```bash
# 服务器配置
PORT=3000
JWT_SECRET=your_jwt_secret
DATA_FILE_PATH=./data/data.json

# API配置
DEEPSEEK_API_KEY=your_deepseek_api_key

# 环境配置
# 开发环境（开发时使用）
NODE_ENV=development
CLIENT_URL=http://localhost
VITE_API_URL=http://localhost:3000

# 生产环境（部署时使用，需要将上面的开发环境配置注释，并取消下面的注释）
# NODE_ENV=production
# CLIENT_URL=http://your-server-ip
# VITE_API_URL=http://your-server-ip:3000
```

⚠️ **重要提示**：环境变量替换发生在构建过程中，而不是运行时。在执行构建命令之前必须先修改环境变量文件。

4. 启动应用

```bash
# 启动前端开发服务器
cd client
npm run dev

# 启动后端服务器
cd ../server
npm run dev

# 可以选择这里一键启动
npm run dev
```

## 部署指南

### 前端部署

1. 配置生产环境变量

**⚠️ 在打包前**，修改项目根目录下的 `.env` 文件，注释掉开发环境配置，取消对生产环境配置的注释：

```bash
# 环境配置
# 开发环境（开发时使用）
# NODE_ENV=development
# CLIENT_URL=http://localhost
# VITE_API_URL=http://localhost:3000

# 生产环境（部署时使用）
NODE_ENV=production
CLIENT_URL=http://your-server-ip
VITE_API_URL=http://your-server-ip:3000
```

2. 构建前端项目

```bash
cd client
npm run build
```

3. 将生成的 `dist` 目录复制到服务器对应位置

### 后端部署

1. 确保服务器已安装 Node.js (建议 v16+)
2. 复制项目到服务器
3. 安装依赖：

```bash
cd server
npm install --production
```

4. 启动服务器：

```bash
cd server
npm start
```

建议使用 PM2 等进程管理工具以确保服务持续运行：

```bash
npm install -g pm2
pm2 start src/index.js --name chat-server
```

## 常见问题解决

### 前端 API 连接错误

如果部署后遇到类似 `POST http://localhost:3000/api/auth/login net::ERR_CONNECTION_REFUSED` 的错误，表示前端代码仍在尝试连接 localhost 而非生产环境服务器。

解决方法：

1. 确保在**打包前**已经修改了`.env`文件中的环境变量
2. 执行新的构建：`npm run build -- --mode production`
3. 重新部署生成的 dist 目录

### Socket 连接问题

如果聊天功能不工作，可能是 Socket 连接问题。检查浏览器控制台是否有 Socket 连接错误，确保:

1. 服务器防火墙允许 3000 端口访问
2. Socket 连接 URL 配置正确

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

### v5.0.0 - 诗词机器人

- 添加诗词推荐机器人功能
- 支持随机推荐、按作者查询和按主题查询
- 诗词内容美观展示，包含解析
- 支持 Markdown 格式（如加粗文本）
- 自适应主题的诗词样式
- 用户友好的使用指南

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

### 使用诗词机器人

- 在消息框中输入 `@poem` 获取随机推荐的诗词
- 输入 `@poem 李白` 获取李白的诗词
- 输入 `@poem 思乡` 获取与思乡相关的诗词
- 输入 `@poem 李白的诗` 也可以获取李白的诗词
- 诗词展示格式：
  - 诗名
  - 作者
  - 诗句
  - 详细解析
- 点击界面右上角的帮助按钮可以查看详细使用指南
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
