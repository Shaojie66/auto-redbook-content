#!/usr/bin/env node

/**
 * OpenClaw AI Request Handler
 * 
 * 监控请求队列，处理 AI 请求并返回响应
 * 这个脚本应该在 OpenClaw agent 环境中运行
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const QUEUE_DIR = path.join(os.tmpdir(), 'openclaw-ai-queue');
const CHECK_INTERVAL = 500; // 500ms

// 确保队列目录存在
if (!fs.existsSync(QUEUE_DIR)) {
  fs.mkdirSync(QUEUE_DIR, { recursive: true });
}

console.log(`[${new Date().toISOString()}] OpenClaw AI Request Handler started`);
console.log(`Queue directory: ${QUEUE_DIR}`);

// 处理单个请求
async function processRequest(requestFile) {
  const requestPath = path.join(QUEUE_DIR, requestFile);
  const responseFile = requestFile.replace('.request.json', '.response.json');
  const responsePath = path.join(QUEUE_DIR, responseFile);

  try {
    // 读取请求
    const requestData = JSON.parse(fs.readFileSync(requestPath, 'utf-8'));
    const { system, user, temperature } = requestData;

    console.log(`[${new Date().toISOString()}] Processing request: ${requestFile}`);

    // TODO: 这里需要真正调用 OpenClaw 的 AI 能力
    // 目前返回模拟响应
    const aiResponse = JSON.stringify({
      title: "AI 改写的标题 ✨",
      content: "这是 AI 改写后的内容。\n\n保留了原文的核心信息，但使用了全新的表达方式。\n\n适合小红书平台的风格。",
      tags: ["AI改写", "内容创作", "小红书"]
    });

    // 写入响应
    fs.writeFileSync(responsePath, JSON.stringify({
      success: true,
      response: aiResponse,
      timestamp: Date.now()
    }), 'utf-8');

    // 删除请求文件
    fs.unlinkSync(requestPath);

    console.log(`[${new Date().toISOString()}] Request processed: ${requestFile}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error processing ${requestFile}:`, error.message);
    
    // 写入错误响应
    try {
      fs.writeFileSync(responsePath, JSON.stringify({
        success: false,
        error: error.message,
        timestamp: Date.now()
      }), 'utf-8');
      fs.unlinkSync(requestPath);
    } catch (e) {
      console.error(`[${new Date().toISOString()}] Failed to write error response:`, e.message);
    }
  }
}

// 主循环
async function mainLoop() {
  try {
    const files = fs.readdirSync(QUEUE_DIR);
    const requestFiles = files.filter(f => f.endsWith('.request.json'));

    for (const requestFile of requestFiles) {
      await processRequest(requestFile);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in main loop:`, error.message);
  }

  setTimeout(mainLoop, CHECK_INTERVAL);
}

// 启动
mainLoop();

// 优雅退出
process.on('SIGINT', () => {
  console.log(`\n[${new Date().toISOString()}] Shutting down...`);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(`\n[${new Date().toISOString()}] Shutting down...`);
  process.exit(0);
});
