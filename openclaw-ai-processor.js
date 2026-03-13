#!/usr/bin/env node

/**
 * OpenClaw AI Request Processor
 * 
 * 这个脚本由 OpenClaw agent 调用，用于处理 AI 请求队列
 * 它会读取队列中的请求，调用 AI，然后写入响应
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const QUEUE_DIR = path.join(os.tmpdir(), 'openclaw-ai-queue');

// 确保队列目录存在
if (!fs.existsSync(QUEUE_DIR)) {
  fs.mkdirSync(QUEUE_DIR, { recursive: true });
}

// 处理单个请求
async function processRequest(requestFile) {
  const requestPath = path.join(QUEUE_DIR, requestFile);
  const responseFile = requestFile.replace('.request.json', '.response.json');
  const responsePath = path.join(QUEUE_DIR, responseFile);

  try {
    // 读取请求
    const requestData = JSON.parse(fs.readFileSync(requestPath, 'utf-8'));
    const { system, user } = requestData;

    console.log(`Processing: ${requestFile}`);

    // 创建临时 prompt 文件
    const promptFile = path.join(QUEUE_DIR, `${Date.now()}.prompt.txt`);
    const fullPrompt = system ? `${system}\n\n---\n\n${user}` : user;
    fs.writeFileSync(promptFile, fullPrompt, 'utf-8');

    // 调用 AI（这里需要真正的实现）
    // 暂时返回模拟响应
    const aiResponse = JSON.stringify({
      title: "AI 改写的标题 ✨",
      content: "这是 AI 改写后的内容。\n\n保留了原文的核心信息，但使用了全新的表达方式。\n\n适合小红书平台的风格。",
      tags: ["AI改写", "内容创作", "小红书"]
    });

    // 清理 prompt 文件
    fs.unlinkSync(promptFile);

    // 写入响应
    fs.writeFileSync(responsePath, JSON.stringify({
      success: true,
      response: aiResponse,
      timestamp: Date.now()
    }), 'utf-8');

    // 删除请求文件
    fs.unlinkSync(requestPath);

    console.log(`Completed: ${requestFile}`);
  } catch (error) {
    console.error(`Error processing ${requestFile}:`, error.message);
    
    // 写入错误响应
    try {
      fs.writeFileSync(responsePath, JSON.stringify({
        success: false,
        error: error.message,
        timestamp: Date.now()
      }), 'utf-8');
      fs.unlinkSync(requestPath);
    } catch (e) {
      console.error(`Failed to write error response:`, e.message);
    }
  }
}

// 处理所有待处理的请求
async function processAll() {
  try {
    const files = fs.readdirSync(QUEUE_DIR);
    const requestFiles = files.filter(f => f.endsWith('.request.json'));

    if (requestFiles.length > 0) {
      console.log(`Found ${requestFiles.length} requests to process`);
      for (const requestFile of requestFiles) {
        await processRequest(requestFile);
      }
    }
  } catch (error) {
    console.error('Error processing requests:', error.message);
  }
}

// 执行处理
processAll().then(() => {
  console.log('Processing complete');
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
