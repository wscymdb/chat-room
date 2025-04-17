# 构建阶段
FROM node:18-alpine as builder
WORKDIR /app
# 复制所有文件
COPY . .
# 安装所有依赖并构建
RUN npm run install:all
RUN chmod +x build.sh
RUN ./build.sh ci

# 运行阶段
FROM node:18-alpine
WORKDIR /app
# 复制dist目录的所有内容
COPY --from=builder /app/server/dist ./
# 在当前目录（dist的内容）下安装依赖
RUN npm install --production

# 暴露端口
EXPOSE 3000

# 直接运行编译后的index.js
CMD ["node", "index.js"]