// 测试 AI 洗稿功能
// 使用方式: node test-rewriter.js

const { ContentRewriter } = require('./dist/rewriter');

// 模拟一条小红书笔记
const testNote = {
  title: '超实用！AI工具让我的工作效率提升3倍',
  content: `最近发现了几个超好用的AI工具，真的太香了！🔥

第一个是ChatGPT，写文案、写代码、翻译都能搞定，简直是万能助手。每天用它处理各种文字工作，节省了大量时间。

第二个是Midjourney，做设计图、配图超方便，不用再花钱找设计师了。输入描述就能生成高质量图片，太神奇了！

第三个是Notion AI，整理笔记、总结会议记录特别快。以前要花1小时整理的内容，现在10分钟就搞定。

强烈推荐大家试试这些工具，真的能让工作效率翻倍！💪

#AI工具 #效率提升 #职场技巧`
};

async function test() {
  console.log('=== AI 洗稿功能测试 ===\n');
  
  // 从环境变量读取配置
  require('dotenv').config();
  
  const provider = process.env.AI_PROVIDER || 'openai';
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'gpt-4';
  const baseURL = process.env.AI_BASE_URL;

  if (!apiKey || apiKey === 'your_api_key_here') {
    console.error('错误: 请先在 .env 文件中配置 AI_API_KEY');
    console.error('复制 .env.example 为 .env 并填入你的 API Key');
    process.exit(1);
  }

  console.log(`AI 配置: ${provider} / ${model}\n`);
  console.log('原始笔记:');
  console.log(`标题: ${testNote.title}`);
  console.log(`内容:\n${testNote.content}\n`);
  console.log('---\n');

  try {
    const rewriter = new ContentRewriter({
      provider,
      apiKey,
      model,
      baseURL,
    });

    console.log('正在调用 AI 进行洗稿...\n');
    const result = await rewriter.rewrite(testNote);

    console.log('洗稿结果:');
    console.log(`新标题: ${result.title}`);
    console.log(`新标签: ${result.tags.join(', ')}`);
    console.log(`新内容:\n${result.content}\n`);
    console.log('---\n');
    console.log('✓ 测试成功！');
  } catch (error) {
    console.error('✗ 测试失败:', error.message);
    if (error.response) {
      console.error('API 响应:', error.response.data);
    }
    process.exit(1);
  }
}

test();
