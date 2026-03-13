import { config } from './config';
import { XhsScraper } from './scrapers/xhs';
import { ContentRewriter } from './rewriter';
import { FeishuWriter } from './feishu';

async function main() {
  console.log('=== Auto Redbook Content - 阶段 3: 完整流程测试 ===\n');

  // 初始化
  const scraper = new XhsScraper();
  const rewriter = new ContentRewriter({
    provider: config.ai.provider as 'openai' | 'anthropic',
    apiKey: config.ai.apiKey,
    model: config.ai.model,
    baseURL: config.ai.baseUrl,
  });
  const feishuWriter = new FeishuWriter({
    appToken: config.feishu.appToken,
    tableId: config.feishu.tableId,
  });

  console.log('配置信息:');
  console.log(`- 关键词: ${config.xhs.keywords.join(', ')}`);
  console.log(`- 最大结果数: ${config.xhs.maxResults}`);
  console.log(`- 飞书表格: ${feishuWriter.getTableUrl()}\n`);

  try {
    // 1. 抓取
    console.log('[1/3] 抓取小红书笔记...');
    const notes = await scraper.searchNotes({
      keywords: config.xhs.keywords,
      maxResults: config.xhs.maxResults,
      sortBy: config.xhs.sortBy,
    });
    console.log(`✓ 成功抓取 ${notes.length} 条笔记\n`);

    // 2. 洗稿 + 3. 写入飞书
    console.log('[2/3] AI 洗稿...');
    console.log('[3/3] 写入飞书表格...\n');

    const results = [];

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      console.log(`[${i + 1}/${notes.length}] ${note.title}`);

      try {
        // AI 洗稿
        const rewritten = await rewriter.rewrite({
          title: note.title,
          content: note.content,
        });
        console.log(`  ✓ 洗稿完成: ${rewritten.title}`);

        // 构建记录
        const fields = feishuWriter.buildRecord(note, rewritten);
        
        results.push({
          note,
          rewritten,
          fields,
        });

        console.log(`  ✓ 记录已准备\n`);
      } catch (error) {
        console.error(`  ✗ 处理失败:`, error);
        console.log('');
      }
    }

    // 输出结果供外部工具写入
    console.log('\n=== 处理完成 ===');
    console.log(`成功处理: ${results.length}/${notes.length} 条`);
    console.log(`\n飞书表格配置:`);
    console.log(`- APP_TOKEN: ${config.feishu.appToken}`);
    console.log(`- TABLE_ID: ${config.feishu.tableId}`);
    console.log(`- URL: ${feishuWriter.getTableUrl()}`);
    
    // 输出待写入的记录
    console.log(`\n待写入记录 (JSON):`);
    console.log(JSON.stringify(results.map(r => r.fields), null, 2));

  } catch (error) {
    console.error('执行失败:', error);
    process.exit(1);
  }
}

main();
