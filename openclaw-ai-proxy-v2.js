#!/usr/bin/env node

/**
 * OpenClaw AI Proxy Server - 完整实现
 * 
 * 这个版本直接集成了 AI 调用逻辑
 * 通过调用 OpenClaw agent 来处理 AI 请求
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

// 真正的 AI 调用实现
// 这里通过创建一个请求文件，然后由外部的 OpenClaw agent 处理
async function callAI(messages, system) {
  const userMessage = messages.find(m => m.role === 'user');
  if (!userMessage) {
    throw new Error('No user message found');
  }

  const userContent = typeof userMessage.content === 'string' 
    ? userMessage.content 
    : userMessage.content[0].text;

  // 组合完整 prompt
  const fullPrompt = system ? `${system}\n\n---\n\n${userContent}` : userContent;

  // 创建请求文件供 OpenClaw agent 处理
  const requestDir = path.join(os.tmpdir(), 'openclaw-ai-requests');
  if (!fs.existsSync(requestDir)) {
    fs.mkdirSync(requestDir, { recursive: true });
  }

  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const requestFile = path.join(requestDir, `${requestId}.request.json`);
  const responseFile = path.join(requestDir, `${requestId}.response.json`);

  fs.writeFileSync(requestFile, JSON.stringify({
    prompt: fullPrompt,
    timestamp: Date.now()
  }), 'utf-8');

  // 等待响应（最多 60 秒）
  const timeout = 60000;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (fs.existsSync(responseFile)) {
      const response = fs.readFileSync(responseFile, 'utf-8');
      fs.unlinkSync(responseFile);
      // 请求文件已被监控器删除，不需要再删除
      return response;
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // 超时，清理请求文件（如果还存在）
  if (fs.existsSync(requestFile)) {
    fs.unlinkSync(requestFile);
  }
  throw new Error('AI request timeout - no response from OpenClaw agent');
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
    res.end(JSON.stringify({ 
      status: 'ok', 
      service: 'openclaw-ai-proxy',
      note: 'Requires OpenClaw agent to process requests'
    }));
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
        const { messages, system } = request;

        console.log(`[${new Date().toISOString()}] Received AI request`);

        // 调用 AI
        const aiResponse = await callAI(messages, system);

        // 返回 Anthropic 兼容格式
        const response = createAnthropicResponse(aiResponse);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));

        console.log(`[${new Date().toISOString()}] Response sent`);
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
  console.log(`🚀 OpenClaw AI Proxy Server`);
  console.log(`   Listening: http://${HOST}:${PORT}`);
  console.log(`   Health: http://${HOST}:${PORT}/health`);
  console.log(`   API: POST http://${HOST}:${PORT}/v1/messages`);
  console.log(``);
  console.log(`⚠️  This proxy requires an OpenClaw agent to process requests.`);
  console.log(`   Request files are written to: /tmp/openclaw-ai-requests/`);
  console.log(`   The agent should monitor this directory and process requests.`);
  console.log(``);
  console.log(`Configure your app:`);
  console.log(`   AI_PROVIDER=anthropic`);
  console.log(`   AI_BASE_URL=http://${HOST}:${PORT}`);
  console.log(`   AI_API_KEY=dummy`);
});
