// 测试飞书集成 - 使用模拟数据
const mockNotes = [
  {
    id: '1',
    title: 'AI绘画工具推荐！5款超好用的AI绘画软件',
    content: '今天给大家推荐几款超好用的AI绘画工具，包括Midjourney、Stable Diffusion等...',
    author: '科技小达人',
    likes: 1520,
    comments: 89,
    shares: 234,
    url: 'https://www.xiaohongshu.com/explore/1',
    tags: ['AI', '绘画', '工具']
  },
  {
    id: '2',
    title: 'ChatGPT使用技巧分享，让你的工作效率翻倍',
    content: 'ChatGPT已经成为很多人的工作助手，今天分享一些实用技巧...',
    author: '效率达人',
    likes: 2340,
    comments: 156,
    shares: 445,
    url: 'https://www.xiaohongshu.com/explore/2',
    tags: ['ChatGPT', 'AI', '效率']
  },
  {
    id: '3',
    title: 'AI写作助手测评：这3款工具最值得推荐',
    content: '测试了市面上主流的AI写作工具，这3款最好用...',
    author: '写作爱好者',
    likes: 890,
    comments: 67,
    shares: 123,
    url: 'https://www.xiaohongshu.com/explore/3',
    tags: ['AI', '写作', '工具推荐']
  }
];

const mockRewritten = [
  {
    title: '【AI绘画神器】5款必备工具，让你秒变艺术家',
    content: '想要轻松创作精美画作？这5款AI绘画工具不容错过！从入门级的Midjourney到专业级的Stable Diffusion，总有一款适合你。无需绘画基础，只需输入文字描述，AI就能帮你生成惊艳的作品。',
    tags: ['AI绘画', '创作工具', '数字艺术', '效率提升']
  },
  {
    title: '【ChatGPT进阶】10个技巧让你的工作效率提升300%',
    content: 'ChatGPT不只是聊天工具！掌握这些高级技巧，它能成为你的超级助手。从文案撰写到数据分析，从代码调试到创意策划，让AI真正为你所用，工作效率翻倍不是梦。',
    tags: ['ChatGPT技巧', '工作效率', 'AI助手', '职场提升']
  },
  {
    title: '【AI写作工具横评】3款最强工具深度对比',
    content: '市面上AI写作工具那么多，到底哪款最好用？经过深度测试，这3款工具脱颖而出。从功能丰富度到输出质量，从价格到易用性，全方位对比分析，帮你找到最适合的写作助手。',
    tags: ['AI写作', '工具测评', '内容创作', '效率工具']
  }
];

console.log('=== 飞书集成测试（模拟数据）===\n');
console.log('配置信息:');
console.log('- APP_TOKEN: PoWNb3JlVaWI0Ms8joZcIHV3ngf');
console.log('- TABLE_ID: tblJGO1CucSwAMPc');
console.log('- 表格链接: https://s0w6i986vwt.feishu.cn/base/PoWNb3JlVaWI0Ms8joZcIHV3ngf?table=tblJGO1CucSwAMPc\n');

console.log('准备写入的记录:\n');

const records = mockNotes.map((note, i) => ({
  原标题: note.title,
  原文链接: { text: note.title, link: note.url },
  作者: note.author,
  点赞数: note.likes,
  评论数: note.comments,
  收藏数: note.shares,
  洗稿后标题: mockRewritten[i].title,
  洗稿后正文: mockRewritten[i].content,
  提取标签: mockRewritten[i].tags.join(', '),
  抓取时间: Date.now(),
  状态: '待审核'
}));

records.forEach((record, i) => {
  console.log(`[${i + 1}] ${record.原标题}`);
  console.log(`    → ${record.洗稿后标题}`);
  console.log(`    标签: ${record.提取标签}`);
  console.log(`    互动: 👍${record.点赞数} 💬${record.评论数} ⭐${record.收藏数}\n`);
});

console.log('记录数据 (JSON):');
console.log(JSON.stringify(records, null, 2));
