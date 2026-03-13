#!/usr/bin/env node

/**
 * OpenClaw AI Request Monitor
 * 
 * 监控 /tmp/openclaw-ai-requests/ 目录
 * 处理 AI 请求并返回响应
 * 
 * 这个脚本应该在 OpenClaw agent 环境中运行
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const REQUEST_DIR = path.join(os.tmpdir(), 'openclaw-ai-requests');
const CHECK_INTERVAL = 500; // 500ms

// 确保目录存在
if (!fs.existsSync(REQUEST_DIR)) {
  fs.mkdirSync(REQUEST_DIR, { recursive: true });
}

console.log(`[${new Date().toISOString()}] OpenClaw AI Request Monitor started`);
console.log(`Monitoring: ${REQUEST_DIR}`);
console.log(`Interval: ${CHECK_INTERVAL}ms`);
console.log('');

// 主循环
async function mainLoop() {
  try {
    const files = fs.readdirSync(REQUEST_DIR);
    const requestFiles = files.filter(f => f.endsWith('.request.json'));

    if (requestFiles.length > 0) {
      // 调用处理脚本
      const { execSync } = require('child_process');
      const scriptPath = path.join(__dirname, 'openclaw-ai-process.js');
      execSync(`node "${scriptPath}"`, {
        encoding: 'utf-8',
        stdio: 'inherit'
      });
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
