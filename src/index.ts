import { config } from './config';
import { XhsScraper } from './scrapers/xhs';

async function main() {
  console.log('=== Auto Redbook Content - 阶段 1: 小红书抓取 ===\n');

  // 初始化抓取器
  const scraper = new XhsScraper();

  // 执行抓取
  console.log('开始抓取小红书笔记...');
  console.log(`关键词: ${config.xhs.keywords.join(', ')}`);
  console.log(`最大结果数: ${config.xhs.maxResults}`);
  console.log(`排序方式: ${config.xhs.sortBy}\n`);

  try {
    const notes = await scraper.searchNotes({
      keywords: config.xhs.keywords,
      maxResults: config.xhs.maxResults,
      sortBy: config.xhs.sortBy,
    });

    console.log(`\n成功抓取 ${notes.length} 条笔记:\n`);

    notes.forEach((note, index) => {
      console.log(`${index + 1}. ${note.title}`);
      console.log(`   作者: ${note.author}`);
      console.log(`   点赞: ${note.likes} | 评论: ${note.comments} | 分享: ${note.shares}`);
      console.log(`   链接: ${note.url}`);
      console.log(`   标签: ${note.tags?.join(', ') || '无'}`);
      console.log(`   内容预览: ${note.content.substring(0, 100)}...`);
      console.log('');
    });

    console.log('抓取完成！');
  } catch (error) {
    console.error('抓取失败:', error);
    process.exit(1);
  }
}

main();
