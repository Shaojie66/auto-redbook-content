#!/bin/bash

# OpenClaw AI Service Launcher
# 启动代理服务器和请求监控器

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Starting OpenClaw AI Service..."
echo ""

# 启动监控器（后台）
echo "Starting request monitor..."
node "$PROJECT_DIR/openclaw-ai-monitor.js" > /tmp/openclaw-ai-monitor.log 2>&1 &
MONITOR_PID=$!
echo "Monitor PID: $MONITOR_PID"

# 等待一下确保监控器启动
sleep 1

# 启动代理服务器（前台）
echo "Starting proxy server..."
node "$PROJECT_DIR/openclaw-ai-proxy-v2.js"

# 清理函数
cleanup() {
  echo ""
  echo "Shutting down..."
  kill $MONITOR_PID 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM
