#!/bin/bash

# OpenClaw AI Call Helper
# 这个脚本接收 prompt 文件路径，调用 AI，并输出响应

PROMPT_FILE="$1"

if [ ! -f "$PROMPT_FILE" ]; then
  echo '{"error": "Prompt file not found"}' >&2
  exit 1
fi

# 读取 prompt
PROMPT=$(cat "$PROMPT_FILE")

# 这里需要真正调用 OpenClaw 的 AI 能力
# 目前返回模拟响应
cat << 'EOF'
{
  "title": "AI 改写的标题 ✨",
  "content": "这是 AI 改写后的内容。\n\n保留了原文的核心信息，但使用了全新的表达方式。\n\n适合小红书平台的风格。",
  "tags": ["AI改写", "内容创作", "小红书"]
}
EOF
