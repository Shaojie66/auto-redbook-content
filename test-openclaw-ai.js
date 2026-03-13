#!/usr/bin/env node

/**
 * 测试 OpenClaw AI 代理服务
 */

const http = require('http');

const testRequest = {
  model: 'claude-opus-4-6',
  max_tokens: 2048,
  temperature: 0.8,
  system: '你是一位专业的小红书内容创作者，擅长将原始笔记改写成吸引人的小红书风格内容。请以 JSON 格式输出：{"title": "标题", "content": "内容", "tags": ["标签1", "标签2"]}',
  messages: [
    {
      role: 'user',
      content: '请将以下小红书笔记改写：\n\n原标题：AI 技术分享\n\n原正文：今天学习了人工智能的基础知识，感觉很有收获。'
    }
  ]
};

const postData = JSON.stringify(testRequest);

const options = {
  hostname: '127.0.0.1',
  port: 18790,
  path: '/v1/messages',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'x-api-key': 'dummy',
    'anthropic-version': '2023-06-01'
  }
};

console.log('发送测试请求到 OpenClaw AI 代理...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('状态码:', res.statusCode);
    console.log('响应:\n', JSON.stringify(JSON.parse(data), null, 2));
  });
});

req.on('error', (error) => {
  console.error('请求失败:', error.message);
});

req.write(postData);
req.end();
