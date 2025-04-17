#!/bin/bash

# 检查是否传入参数
if [ "$1" == "ci" ]; then
    echo "开始自动构建 (CI/CD)..."
    IS_CI=true
else
    echo "开始手动构建..."
    IS_CI=false
fi

# 1. 清空 server/dist 目录
echo "清空 server/dist 目录..."
rm -rf server/dist

# 2. 安装依赖
echo "安装根目录依赖..."
npm install

echo "安装客户端依赖..."
cd client
npm install

echo "安装服务器依赖..."
cd ../server
npm install

# 3. 构建客户端
echo "构建客户端..."
cd ../client
npm run build

# 4. 构建服务器
echo "构建服务器..."
cd ../server
npm run build

# 5. 复制客户端构建到服务器的 public 目录
echo "复制客户端构建文件到服务器..."
rm -rf dist/public
mkdir -p dist/public
cp -r ../client/dist/* dist/public/

# 6. 复制必要文件到 dist 目录
echo "复制必要文件到 dist 目录..."
cd ..
cp server/package.json server/dist/
mkdir -p server/dist/data
cp -r server/data/* server/dist/data/

# 7. 如果是 CI 环境，从指定位置复制 .env 文件
if [ "$IS_CI" = true ]; then
    echo "从指定位置复制环境变量文件到 dist 目录..."
    if [ -f "/root/.env" ]; then
        cp /root/.env server/dist/
        echo "已从 /root/.env 复制环境变量文件"
    else
        echo "警告：未找到 /root/.env 文件"
    fi
else
    echo "复制本地环境变量文件到 dist 目录..."
    cp .env server/dist/
fi

echo "构建完成！" 