# auto-redbook-content

从小红书抓取热点笔记 → AI 洗稿 → 存入飞书多维表格

## 项目简介

自动化内容生产流程：
1. 从小红书抓取指定关键词的热门笔记
2. 使用 AI 对内容进行改写（洗稿）
3. 将结果存入飞书多维表格

## 技术栈

- Node.js + TypeScript
- xiaohongshu MCP（小红书数据抓取）
- OpenAI/Anthropic API（AI 洗稿）
- Feishu API（飞书表格写入）

## 安装

```bash
# 克隆仓库
git clone <repository-url>
cd auto-redbook-content

# 安装依赖
npm install

# 复制环境变量配置
cp .env.example .env

# 编辑 .env 填入你的配置
```

## 配置

编辑 `.env` 文件：

```env
# 小红书抓取配置
XHS_KEYWORDS=AI,人工智能,机器学习
XHS_MAX_RESULTS=10
XHS_SORT_BY=hot

# AI 配置
AI_PROVIDER=openai              # 支持 openai 或 anthropic
AI_API_KEY=your_api_key_here    # 必填：你的 API Key
AI_MODEL=gpt-4                  # OpenAI: gpt-4, gpt-3.5-turbo 等
                                # Anthropic: claude-3-opus-20240229, claude-3-sonnet-20240229 等
AI_BASE_URL=                    # 可选：自定义 API 端点（如使用代理或第三方服务）

# 飞书配置
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret
FEISHU_APP_TOKEN=your_app_token
FEISHU_TABLE_ID=your_table_id

# 调度配置
SCHEDULE_ENABLED=false
SCHEDULE_CRON=0 */6 * * *
```

### AI 配置说明

**OpenAI 配置示例：**
```env
AI_PROVIDER=openai
AI_API_KEY=sk-proj-xxxxxxxxxxxxx
AI_MODEL=gpt-4
```

**Anthropic 配置示例：**
```env
AI_PROVIDER=anthropic
AI_API_KEY=sk-ant-xxxxxxxxxxxxx
AI_MODEL=claude-3-opus-20240229
```

**使用第三方 API 代理：**
```env
AI_PROVIDER=openai
AI_API_KEY=your_key
AI_MODEL=gpt-4
AI_BASE_URL=https://your-proxy.com/v1
```

## 使用

```bash
# 开发模式运行
npm run dev

# 构建
npm run build

# 生产模式运行
npm start
```

## 开发进度

- [x] 阶段 1: 项目初始化 + 小红书抓取功能
- [x] 阶段 2: AI 洗稿功能
- [ ] 阶段 3: 飞书表格写入功能
- [ ] 阶段 4: 定时调度 + 完整测试

## 项目结构

```
auto-redbook-content/
├── src/
│   ├── config/          # 配置管理
│   ├── scrapers/        # 抓取模块
│   ├── rewriter/        # AI 洗稿模块
│   │   ├── index.ts     # ContentRewriter 类
│   │   └── prompts.ts   # 洗稿提示词
│   ├── types/           # TypeScript 类型定义
│   └── index.ts         # 入口文件
├── .env.example         # 环境变量示例
├── package.json
├── tsconfig.json
└── README.md
```

## License

ISC
