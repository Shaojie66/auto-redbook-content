#!/usr/bin/env node

/**
 * OpenClaw AI Proxy Server
 * 
 * 兼容 Anthropic API 格式的本地代理服务
 * 接收标准的 /v1/messages 请求，通过 OpenClaw 处理后返回兼容格式的响应
 * 
 * 启动：node openclaw-ai-proxy.js
 * 配置：在 .env 中设置 AI_BASE_URL=http://127.0.0.1:18790
 */

const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.OPENCLAW_AI_PORT || 18790;
const HOST = '127.0.0.1';

// 模拟 Anthropic API 响应格式
function createAnthropicResponse(content) {
  return {
    id: `msg_${Date.now()}`,
    type: 'message',
    role: 'assistant',
    content: [
      {
        type: 'text',
        text: content
      }
    ],
    model: 'claude-opus-4-6',
    stop_reason: 'end_turn',
    usage: {
      input_tokens: 100,
      output_tokens: 200
    }
  };
}

const QUEUE_DIR = path.join(os.tmpdir(), 'openclaw-ai-queue');
const REQUEST_TIMEOUT = 30000; // 30 seconds

// 确保队列目录存在
if (!fs.existsSync(QUEUE_DIR)) {
  fs.mkdirSync(QUEUE_DIR, { recursive: true });
}

// 通过文件队列调用 AI
async function callAI(messages, system) {
  // 提取最后一条用户消息
  const userMessage = messages.find(m => m.role === 'user');
  if (!userMessage) {
    throw new Error('No user message found');
  }

  const userContent = typeof userMessage.content === 'string' 
    ? userMessage.content 
    : userMessage.content[0].text;

  // 创建请求文件
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const requestFile = path.join(QUEUE_DIR, `${requestId}.request.json`);
  const responseFile = path.join(QUEUE_DIR, `${requestId}.response.json`);

  const requestData = {
    system: system || '',
    user: userContent,
    temperature: 0.8,
    timestamp: Date.now()
  };

  fs.writeFileSync(requestFile, JSON.stringify(requestData), 'utf-8');

  // 等待响应文件
  const startTime = Date.now();
  while (Date.now() - startTime < REQUEST_TIMEOUT) {
    if (fs.existsSync(responseFile)) {
      const responseData = JSON.parse(fs.readFileSync(responseFile, 'utf-8'));
      fs.unlinkSync(responseFile); // 清理响应文件

      if (responseData.success) {
        return responseData.response;
      } else {
        throw new Error(responseData.error || 'AI request failed');
      }
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // 超时，清理请求文件
  if (fs.existsSync(requestFile)) {
    fs.unlinkSync(requestFile);
  }
  throw new Error('AI request timeout');
}

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, anthropic-version');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 健康检查
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'openclaw-ai-proxy' }));
    return;
  }

  // Anthropic Messages API
  if (req.method === 'POST' && req.url === '/v1/messages') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const request = JSON.parse(body);
        const { messages, system, model, max_tokens, temperature } = request;

        console.log(`[${new Date().toISOString()}] Received request:`, {
          model,
          system: system?.substring(0, 50) + '...',
          userMessage: messages[0]?.content?.substring(0, 50) + '...'
        });

        // 调用 AI
        const aiResponse = await callAI(messages, system);

        // 返回 Anthropic 兼容格式
        const response = createAnthropicResponse(aiResponse);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));

        console.log(`[${new Date().toISOString()}] Response sent successfully`);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error:`, error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          type: 'error',
          error: { 
            type: 'internal_error',
            message: error.message 
          }
        }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 OpenClaw AI Proxy Server started`);
  console.log(`   Listening on: http://${HOST}:${PORT}`);
  console.log(`   Health check: http://${HOST}:${PORT}/health`);
  console.log(`   API endpoint: POST http://${HOST}:${PORT}/v1/messages`);
  console.log(`\nConfigure your app with:`);
  console.log(`   AI_PROVIDER=anthropic`);
  console.log(`   AI_BASE_URL=http://${HOST}:${PORT}`);
  console.log(`   AI_API_KEY=dummy-key-not-used`);
  console.log(`   AI_MODEL=claude-opus-4-6`);
});
