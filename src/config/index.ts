import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // 小红书抓取配置
  xhs: {
    keywords: process.env.XHS_KEYWORDS?.split(',') || ['AI', '人工智能'],
    maxResults: parseInt(process.env.XHS_MAX_RESULTS || '10'),
    sortBy: (process.env.XHS_SORT_BY as 'hot' | 'latest') || 'hot',
  },

  // AI 配置
  ai: {
    provider: process.env.AI_PROVIDER || 'openai', // openai | anthropic
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'gpt-4',
    baseUrl: process.env.AI_BASE_URL,
  },

  // 飞书配置
  feishu: {
    appId: process.env.FEISHU_APP_ID || '',
    appSecret: process.env.FEISHU_APP_SECRET || '',
    tableId: process.env.FEISHU_TABLE_ID || '',
    appToken: process.env.FEISHU_APP_TOKEN || '',
  },

  // 调度配置
  schedule: {
    enabled: process.env.SCHEDULE_ENABLED === 'true',
    cron: process.env.SCHEDULE_CRON || '0 */6 * * *', // 每6小时
  },
};
