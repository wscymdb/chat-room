# 使用更具体的Node版本，避免未来版本变化带来的问题
FROM node:18-alpine  # 使用alpine版本更轻量

# 设置工作目录
WORKDIR /app

# 首先只复制依赖相关文件，利用Docker缓存机制
COPY package*.json ./

# 设置npm镜像源，加快安装速度
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm install

# 复制其他源代码文件
COPY . .

# 暴露端口
EXPOSE 3000

# 使用npm start启动应用
CMD ["npm", "start"]