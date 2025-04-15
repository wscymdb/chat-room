#!/bin/bash

# 切换到项目目录
cd "$(dirname "$0")"

# 加载 nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 检查 Node.js 版本
CURRENT_NODE_VERSION=$(node -v)
REQUIRED_NODE_VERSION="v18.19.0"

echo "当前 Node.js 版本: $CURRENT_NODE_VERSION"
echo "所需 Node.js 版本: $REQUIRED_NODE_VERSION"

# 如果版本不符合要求，尝试切换
if [ "$CURRENT_NODE_VERSION" != "$REQUIRED_NODE_VERSION" ]; then
    echo "Node.js 版本不符合要求，尝试切换到 $REQUIRED_NODE_VERSION..."
    
    # 检查 nvm 是否已安装
    if [ ! -s "$NVM_DIR/nvm.sh" ]; then
        echo "错误: nvm 未安装，请先安装 nvm"
        exit 1
    fi
    
    # 检查所需版本是否已安装
    if ! nvm ls $REQUIRED_NODE_VERSION &> /dev/null; then
        echo "所需版本未安装，正在安装 $REQUIRED_NODE_VERSION..."
        nvm install $REQUIRED_NODE_VERSION
    fi
    
    # 切换到所需版本
    nvm use $REQUIRED_NODE_VERSION
    
    # 验证切换是否成功
    NEW_NODE_VERSION=$(node -v)
    if [ "$NEW_NODE_VERSION" != "$REQUIRED_NODE_VERSION" ]; then
        echo "错误: 无法切换到 $REQUIRED_NODE_VERSION"
        exit 1
    fi
    
    echo "成功切换到 Node.js $REQUIRED_NODE_VERSION"
fi

# 确保没有正在运行的进程
echo "检查并关闭可能正在运行的进程..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# 启动服务器
echo "启动服务器..."
cd server
npm run build
npm start &
SERVER_PID=$!

# 启动客户端
echo "启动客户端..."
cd ../client
npm run dev &
CLIENT_PID=$!

# 捕获 Ctrl+C 信号
trap "kill $SERVER_PID $CLIENT_PID; exit" INT

# 保持脚本运行
wait 