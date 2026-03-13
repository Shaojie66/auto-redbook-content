#!/usr/bin/env node

/**
 * OpenClaw AI Proxy Server
 * 
 * 提供简单的 HTTP API，让外部项目可以调用 OpenClaw 的 AI 能力
 * 
 * 使用方式：
 * 1. 启动服务：node openclaw-ai-server.js
 * 2. 发送请求：
 *    POST http://localhost:18790/chat
 *    Body: { "system": "...", "user": "...", "temperature": 0.8 }
 */

const http = require('http');
const { spawn } = require('child_process');

const PORT = process.env.OPENCLAW_AI_PORT || 18790;
const HOST = '127.0.0.1';

// 通过 stdin 与当前 OpenClaw agent 交互
function callOpenClawAI(systemPrompt, userPrompt, temperature = 0.8) {
  return new Promise((resolve, reject) => {
    const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;
    
    // 这里需要一个能直接调用 AI 的方式
    // 暂时返回模拟响应，后续需要实现真正的调用
    setTimeout(() => {
      resolve(JSON.stringify({
        title: "测试标题",
        content: "测试内容",
        tags: ["测试1", "测试2"]
      }));
    }, 100);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/chat') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { system, user, temperature } = JSON.parse(body);
        
        if (!system || !user) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing system or user prompt' }));
          return;
        }

        const response = await callOpenClawAI(system, user, temperature);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ response }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`OpenClaw AI Proxy listening on http://${HOST}:${PORT}`);
  console.log(`Health check: http://${HOST}:${PORT}/health`);
  console.log(`Chat endpoint: POST http://${HOST}:${PORT}/chat`);
});
