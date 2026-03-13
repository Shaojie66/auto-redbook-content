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

### 飞书配置说明

1. **创建飞书应用**
   - 访问 [飞书开放平台](https://open.feishu.cn/)
   - 创建企业自建应用
   - 获取 `App ID` 和 `App Secret`

2. **配置权限**
   - 在应用管理后台，添加以下权限：
     - `bitable:app` - 查看、编辑和管理多维表格
     - `bitable:app:readonly` - 查看多维表格

3. **创建多维表格**
   - 在飞书中创建一个新的多维表格
   - 添加以下字段：
     - `原标题` - 文本
     - `原文链接` - URL
     - `作者` - 文本
     - `点赞数` - 数字
     - `评论数` - 数字
     - `收藏数` - 数字
     - `洗稿后标题` - 文本
     - `洗稿后正文` - 多行文本
     - `提取标签` - 文本
     - `抓取时间` - 日期时间
     - `状态` - 单选（待审核/已发布/已归档）

4. **获取表格信息**
   - 打开多维表格，从 URL 中提取：
     - `FEISHU_APP_TOKEN`: URL 中 `/base/` 后面的部分
     - `FEISHU_TABLE_ID`: URL 参数 `?table=` 后面的部分
   - 示例 URL: `https://example.feishu.cn/base/ABC123?table=tblXYZ789`
     - `FEISHU_APP_TOKEN=ABC123`
     - `FEISHU_TABLE_ID=tblXYZ789`

## 开发进度

- [x] 阶段 1: 项目初始化 + 小红书抓取功能
- [x] 阶段 2: AI 洗稿功能
- [x] 阶段 3: 飞书表格写入功能
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
│   ├── feishu/          # 飞书集成模块
│   │   ├── client.ts    # 飞书 API 客户端
│   │   ├── record-builder.ts  # 记录构建器
│   │   └── index.ts     # 模块导出
│   ├── types/           # TypeScript 类型定义
│   └── index.ts         # 入口文件
├── .env.example         # 环境变量示例
├── package.json
├── tsconfig.json
└── README.md
```

## License

ISC
