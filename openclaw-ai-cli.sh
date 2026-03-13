#!/bin/bash

# OpenClaw AI CLI
# 接收 prompt 并返回 AI 响应
# 
# 使用方式：
#   ./openclaw-ai-cli.sh "system prompt" "user prompt"

SYSTEM_PROMPT="$1"
USER_PROMPT="$2"

if [ -z "$SYSTEM_PROMPT" ] || [ -z "$USER_PROMPT" ]; then
  echo '{"error": "Missing system or user prompt"}' >&2
  exit 1
fi

# 创建临时文件
TEMP_DIR="/tmp/openclaw-ai-cli"
mkdir -p "$TEMP_DIR"

REQUEST_ID="$(date +%s)-$$"
REQUEST_FILE="$TEMP_DIR/$REQUEST_ID.request.txt"
RESPONSE_FILE="$TEMP_DIR/$REQUEST_ID.response.txt"

# 写入请求
cat > "$REQUEST_FILE" << EOF
$SYSTEM_PROMPT

---

$USER_PROMPT
EOF

# 等待响应（这里需要某种机制触发 OpenClaw 处理）
# 暂时直接返回模拟响应
cat << 'EOF'
{
  "title": "AI 改写的标题 ✨",
  "content": "这是 AI 改写后的内容。\n\n保留了原文的核心信息，但使用了全新的表达方式。\n\n适合小红书平台的风格。",
  "tags": ["AI改写", "内容创作", "小红书"]
}
EOF

# 清理
rm -f "$REQUEST_FILE" "$RESPONSE_FILE"
