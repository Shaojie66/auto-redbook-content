import { config } from './config';
import { XhsScraper } from './scrapers/xhs';
import { ContentRewriter } from './rewriter';

async function main() {
  console.log('=== Auto Redbook Content - 阶段 2: 小红书抓取 + AI 洗稿 ===\n');

  // 初始化抓取器
  const scraper = new XhsScraper();

  // 初始化 AI 洗稿器
  const rewriter = new ContentRewriter({
    provider: config.ai.provider as 'openai' | 'anthropic',
    apiKey: config.ai.apiKey,
    model: config.ai.model,
    baseURL: config.ai.baseUrl,
  });

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

    console.log(`\n成功抓取 ${notes.length} 条笔记\n`);

    // AI 洗稿
    console.log('开始 AI 洗稿...\n');

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      console.log(`[${i + 1}/${notes.length}] 正在改写: ${note.title}`);

      try {
        const rewritten = await rewriter.rewrite({
          title: note.title,
          content: note.content,
        });

        console.log(`✓ 改写完成`);
        console.log(`  原标题: ${note.title}`);
        console.log(`  新标题: ${rewritten.title}`);
        console.log(`  新标签: ${rewritten.tags.join(', ')}`);
        console.log(`  新内容预览: ${rewritten.content.substring(0, 100)}...`);
        console.log('');

        // 将改写结果附加到原笔记对象
        (note as any).rewrittenTitle = rewritten.title;
        (note as any).rewrittenContent = rewritten.content;
        (note as any).rewrittenTags = rewritten.tags;
      } catch (error) {
        console.error(`✗ 改写失败:`, error);
        console.log('');
      }
    }

    console.log('所有笔记处理完成！');
  } catch (error) {
    console.error('执行失败:', error);
    process.exit(1);
  }
}

main();
