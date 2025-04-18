#!/bin/bash

echo "开始构建..."

# 1. 清空所有dist目录
echo "清空所有dist目录..."
rm -rf server/dist
rm -rf client/dist
rm -rf dist

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

# 5. 在根目录创建dist目录
echo "在根目录创建dist目录..."
cd ..
mkdir -p dist
mkdir -p dist/public
mkdir -p dist/data

# 6. 复制客户端构建到根目录的dist/public目录
echo "复制客户端构建文件到根目录dist/public..."
cp -r client/dist/* dist/public/

# 7. 复制服务器构建到根目录的dist目录
echo "复制服务器构建文件到根目录dist..."
cp -r server/dist/* dist/

# 8. 复制必要文件到根目录的dist目录
echo "复制必要文件到根目录dist目录..."
cp server/package.json dist/
cp -r server/data/* dist/data/

# 9. 复制环境变量文件
echo "复制环境变量文件到根目录dist目录..."
cp .env dist/

# 10. 清理临时构建目录
echo "清理临时构建目录..."
rm -rf server/dist
rm -rf client/dist

echo "构建完成！所有文件已打包到根目录的dist目录中。" 