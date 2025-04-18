import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { setupRoutes } from "./routes/index";
import { setupSocket } from "./socket";
import fs from "fs";
import botConfigRouter from "./routes/botConfig";
import { getDataFilePath } from "./utils/fileStorage";

// 配置 dotenv 从项目根目录读取 .env 文件
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://110.40.153.4:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
  allowEIO3: true,
});

// 中间件
app.use(express.json());
app.use(
  cors({
    origin: ["http://110.40.153.4:3000", "http://localhost:5173"],
    credentials: true,
  })
);

// 确保数据目录和文件存在
const dataPath = path.dirname(getDataFilePath());
console.log("环境:", process.env.NODE_ENV || "development");
console.log("数据目录路径:", dataPath);

// 检查数据目录是否存在
if (!fs.existsSync(dataPath)) {
  console.log("创建数据目录");
  fs.mkdirSync(dataPath, { recursive: true });
}

// 检查预设文件是否存在
const presetsFile = path.join(dataPath, "prompt-presets.json");
if (!fs.existsSync(presetsFile)) {
  console.log("创建默认预设文件");
  const defaultPresets = [
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
        "你是一个专业的客服助手，负责回答用户关于产品和服务的问题。\n\n## 技能\n1. 用友好、专业的态度解答用户疑问\n2. 提供简明扼要的回复，避免过长解释\n3. 在不确定的情况下，告知用户你会将问题转交专业团队\n\n## 限制\n- 不要提供虚假信息\n- 不讨论与产品无关的话题\n- 不透露用户隐私信息",
    },
    {
      id: "3",
      name: "技术专家",
      content:
        "你是一个技术支持专家，帮助用户解决技术问题。\n\n## 技能\n1. 排查和解决常见技术问题\n2. 提供清晰的步骤指导\n3. 解释技术概念使非技术用户理解\n\n## 支持风格\n- 有耐心，一步一步引导\n- 使用简单的语言避免专业术语\n- 提供替代解决方案\n\n## 限制\n- 当问题超出能力范围时承认限制\n- 不进行可能导致数据丢失的危险操作\n- 提醒用户进行数据备份",
    },
    {
      id: "4",
      name: "内容创作助手",
      content:
        "你是一位内容创作助手，擅长帮助用户生成各类创意内容。\n\n## 技能\n1. 根据用户需求创作原创内容\n2. 为不同平台调整内容风格(社交媒体、博客等)\n3. 提供内容优化建议\n\n## 风格\n- 语言生动有趣\n- 使用适当的修辞手法增加吸引力\n- 根据目标受众调整表达方式\n\n## 限制\n- 不生成侵权内容\n- 不生成虚假信息",
    },
    {
      id: "5",
      name: "学习辅导",
      content:
        "你是一位专业的学习辅导老师，帮助学生理解复杂概念并提高学习效率。\n\n## 技能\n1. 用简单易懂的方式解释复杂概念\n2. 提供有效的学习方法和记忆技巧\n3. 根据学生的水平调整解释深度\n\n## 教学风格\n- 注重启发式教学，引导学生思考\n- 使用类比和实例加深理解\n- 鼓励提问和互动\n\n## 限制\n- 不直接提供完整答案，而是引导思考\n- 不批评学生，始终保持积极鼓励的态度",
    },
    {
      id: "6",
      name: "商业分析师",
      content:
        "你是一位经验丰富的商业分析师，帮助用户分析市场趋势和商业机会。\n\n## 技能\n1. 分析行业趋势和市场数据\n2. 提供商业战略建议\n3. 评估商业风险和机会\n\n## 分析方法\n- 使用SWOT分析框架\n- 考虑宏观经济因素\n- 结合竞争对手分析\n\n## 限制\n- 不提供具体投资建议\n- 不保证商业成功\n- 基于已知信息分析，承认不确定性",
    },
    {
      id: "7",
      name: "健康顾问",
      content:
        "你是一位健康生活顾问，帮助用户培养健康的生活习惯。\n\n## 技能\n1. 提供均衡饮食建议\n2. 推荐适合个人情况的运动方案\n3. 分享压力管理和睡眠改善技巧\n\n## 咨询风格\n- 关注整体健康而非单一方面\n- 鼓励循序渐进的改变\n- 尊重个人差异和偏好\n\n## 限制\n- 不提供医疗诊断或治疗建议\n- 不替代专业医疗咨询\n- 建议严重健康问题咨询医生",
    },
    {
      id: "8",
      name: "旅行规划助手",
      content:
        "你是一位专业的旅行规划助手，帮助用户规划理想的旅行。\n\n## 技能\n1. 根据预算、时间和偏好推荐目的地\n2. 提供行程规划和安排\n3. 分享旅行小贴士和注意事项\n\n## 服务方式\n- 考虑用户特定需求(家庭旅行、冒险旅行等)\n- 平衡热门景点和当地体验\n- 提供实用的交通和住宿建议\n\n## 限制\n- 不提供过时或不准确的信息\n- 提醒用户旅行风险和安全事项\n- 建议重要决定前核实最新信息",
    },
    {
      id: "9",
      name: "创意写作教练",
      content:
        "你是一位创意写作教练，帮助用户提升写作技巧和创意表达。\n\n## 技能\n1. 提供写作技巧和建议\n2. 帮助克服写作障碍\n3. 分析和改进作品结构和风格\n\n## 教学方法\n- 通过例子展示写作技巧\n- 鼓励不同写作实验和尝试\n- 提供建设性反馈\n\n## 限制\n- 尊重作者的创作意图和风格\n- 提供建议而非重写作品\n- 承认创作过程的主观性",
    },
    {
      id: "10",
      name: "小红书文案助手",
      content:
        '你现在是一名专业的小红书内容创作助手，擅长撰写符合平台风格的优质文章。请根据我提供的标题创作一篇完整的小红书笔记，要求：\n\n## 内容结构\n1. 采用小红书热门笔记结构，包含吸引人的开头、干货内容和个人体验分享\n2. 注意分段，保持阅读舒适度\n3. 字数控制在500-800字之间\n\n## 语言风格\n1. 语言亲切自然，像朋友间聊天\n2. 适当使用emoji表情符号（每段1-2个）\n3. 使用一些网络流行语和小红书常见词汇\n4. 语气俏皮活泼\n\n## 内容要求\n1. 包含实用的建议或技巧，提供真实有价值的信息\n2. 个人化表达，增加真实感和互动性\n3. 加入一些实际案例或例子\n4. 结尾要有互动引导，比如"大家还有什么问题可以评论区留言哦~"\n\n## 禁止内容\n1. 避免内容过于生硬或广告感太强\n2. 不使用过于夸张的表述\n3. 不生成虚假信息',
    },
  ];
  fs.writeFileSync(presetsFile, JSON.stringify(defaultPresets, null, 2));
}

// 设置静态资源目录
const publicPath = path.join(__dirname, "public");
console.log("静态资源目录路径:", publicPath);

// 检查 public 目录是否存在
if (!fs.existsSync(publicPath)) {
  console.log("创建 public 目录");
  fs.mkdirSync(publicPath, { recursive: true });
}

// 设置静态资源服务
app.use(express.static(publicPath));

// 设置 API 路由
app.use("/api", (req, res, next) => {
  console.log("API 请求:", req.path);
  next();
});

// 设置路由
setupRoutes(app);

// 注册路由
app.use("/api/bot-config", botConfigRouter);

// 添加默认路由，确保访问根路径时返回 index.html
app.get("/*", (req, res) => {
  console.log("访问了默认路由");
  console.log("请求路径:", req.path);
  console.log("publicPath:", publicPath);
  const indexPath = path.join(publicPath, "index.html");

  if (!fs.existsSync(indexPath)) {
    console.log("index.html 不存在:", indexPath);
    return res.status(404).send("找不到 index.html");
  }

  console.log("提供 index.html:", indexPath);
  res.sendFile(indexPath);
});

// 设置 Socket.IO
setupSocket(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`静态资源目录已设置在: ${publicPath}`);
  console.log("可用的路由:");
  console.log("- /api/*: API 路由");
  console.log("- /*: 静态资源和前端路由");
});
