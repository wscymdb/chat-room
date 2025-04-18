#!/bin/bash

echo "开始构建..."

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

# 7. 复制环境变量文件
echo "复制环境变量文件到 dist 目录..."
cp .env server/dist/

echo "构建完成！" 