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
- **OpenClaw AI（本地 AI 能力，无需外部 API Key）**
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

# AI 配置 - 使用 OpenClaw 本地 AI
AI_PROVIDER=anthropic
AI_API_KEY=dummy-key-not-used
AI_MODEL=claude-opus-4-6
AI_BASE_URL=http://127.0.0.1:18790

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

**本项目已改造为使用 OpenClaw 的本地 AI 能力，无需外部 API Key。**

OpenClaw AI 通过本地代理服务提供 AI 能力：
- 代理服务监听 `http://127.0.0.1:18790`
- 兼容 Anthropic API 格式
- 请求通过文件队列传递给 OpenClaw agent 处理
- 无需配置真实的 API Key

**启动 OpenClaw AI 服务：**

```bash
# 在一个终端窗口中启动 AI 服务
npm run openclaw-ai
```

这会启动两个组件：
1. **代理服务器** - 监听 HTTP 请求（端口 18790）
2. **请求监控器** - 处理 AI 请求队列

**配置说明：**
- `AI_PROVIDER=anthropic` - 使用 Anthropic 兼容格式
- `AI_API_KEY=dummy-key-not-used` - 占位符，不会被使用
- `AI_MODEL=claude-opus-4-6` - 模型标识
- `AI_BASE_URL=http://127.0.0.1:18790` - 本地代理地址

## 使用

### 1. 启动 OpenClaw AI 服务

```bash
# 在第一个终端窗口
npm run openclaw-ai
```

保持这个窗口运行，它会处理所有 AI 请求。

### 2. 执行内容处理流程

在另一个终端窗口：

```bash
# 手动执行一次
npm run once

# 或启动定时任务
npm run start
```

### 手动执行一次

```bash
# 构建并执行一次完整流程
npm run once
```

### 启动定时任务

```bash
# 启动定时调度（需要先在 .env 中配置）
npm run start
```

**定时任务配置：**

在 `.env` 中设置：

```env
# 启用定时任务
SCHEDULE_ENABLED=true

# Cron 表达式（默认每 6 小时执行一次）
SCHEDULE_CRON=0 */6 * * *
```

**常用 Cron 表达式：**

- `0 9,12,18 * * *` - 每天 9:00、12:00、18:00 执行
- `0 */6 * * *` - 每 6 小时执行一次
- `0 0 * * *` - 每天凌晨 0:00 执行
- `*/30 * * * *` - 每 30 分钟执行一次

**查看日志：**

定时任务会输出详细日志，包括：
- 执行时间
- 抓取结果
- 洗稿进度
- 写入状态
- 成功/失败统计

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

## 架构说明

### OpenClaw AI 集成

本项目已从外部 AI API（OpenAI/Anthropic）迁移到 OpenClaw 本地 AI 能力：

**组件架构：**

```
auto-redbook-content (主程序)
    ↓ HTTP POST /v1/messages
openclaw-ai-proxy-v2.js (代理服务器)
    ↓ 写入请求文件
/tmp/openclaw-ai-requests/*.request.json
    ↓ 监控并处理
openclaw-ai-monitor.js (请求监控器)
    ↓ 调用 AI
OpenClaw Agent (当前 agent)
    ↓ 返回响应
/tmp/openclaw-ai-requests/*.response.json
    ↓ 读取响应
openclaw-ai-proxy-v2.js
    ↓ HTTP 200 + JSON
auto-redbook-content
```

**文件说明：**

- `openclaw-ai-proxy-v2.js` - HTTP 代理服务器，兼容 Anthropic API 格式
- `openclaw-ai-monitor.js` - 请求监控器，处理 AI 请求队列
- `start-openclaw-ai.sh` - 启动脚本，同时启动代理和监控器
- `src/rewriter/index.ts` - 保持原有接口，通过 baseURL 指向本地代理

**优势：**

- ✅ 无需外部 API Key
- ✅ 数据不离开本地环境
- ✅ 可以使用 OpenClaw 配置的任何模型
- ✅ 保持原有代码接口不变

## 开发进度

- [x] 阶段 1: 项目初始化 + 小红书抓取功能
- [x] 阶段 2: AI 洗稿功能
- [x] 阶段 3: 飞书表格写入功能
- [x] 阶段 4: 定时调度 + 完整自动化
- [x] 阶段 5: 迁移到 OpenClaw AI（移除外部 API 依赖）

## 功能特性

- ✅ 小红书热点内容抓取
- ✅ AI 智能洗稿（通过 OpenClaw 本地 AI）
- ✅ 飞书多维表格自动写入
- ✅ 定时调度执行
- ✅ 失败重试机制（最多 3 次）
- ✅ 详细日志记录
- ✅ 灵活配置（关键词、数量、调度时间）
- ✅ 无需外部 API Key

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
│   ├── scheduler/       # 定时调度模块
│   ├── pipeline/        # 执行流程模块
│   ├── utils/           # 工具函数
│   ├── types/           # TypeScript 类型定义
│   ├── start.ts         # 定时任务入口
│   ├── once.ts          # 单次执行入口
│   └── index.ts         # 旧版测试入口
├── openclaw-ai-proxy-v2.js    # OpenClaw AI 代理服务器
├── openclaw-ai-monitor.js     # OpenClaw AI 请求监控器
├── start-openclaw-ai.sh       # OpenClaw AI 启动脚本
├── .env.example         # 环境变量示例
├── package.json
├── tsconfig.json
└── README.md
```

## License

ISC
