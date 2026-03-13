import { config } from '../config';
import { XhsScraper } from '../scrapers/xhs';
import { ContentRewriter } from '../rewriter';
import { FeishuWriter } from '../feishu';
import { Logger } from '../utils/logger';

const logger = new Logger();

export async function runPipeline() {
  const startTime = Date.now();
  logger.info('开始执行内容处理流程');

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
    appId: config.feishu.appId,
    appSecret: config.feishu.appSecret,
  });

  logger.info(`关键词: ${config.xhs.keywords.join(', ')}`);
  logger.info(`抓取数量: ${config.xhs.maxResults}`);

  try {
    // 1. 抓取
    logger.step('抓取小红书笔记');
    const notes = await scraper.searchNotes({
      keywords: config.xhs.keywords,
      maxResults: config.xhs.maxResults,
      sortBy: config.xhs.sortBy,
    });
    logger.success(`抓取成功: ${notes.length} 条`);

    // 2. 洗稿 + 写入
    logger.step('AI 洗稿并写入飞书');
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      logger.info(`[${i + 1}/${notes.length}] ${note.title}`);

      let retries = 3;
      while (retries > 0) {
        try {
          const rewritten = await rewriter.rewrite({
            title: note.title,
            content: note.content,
          });
          
          const fields = feishuWriter.buildRecord(note, rewritten);
          await feishuWriter.writeRecord(fields);
          
          logger.success(`  ✓ 完成`);
          successCount++;
          break;
        } catch (error) {
          retries--;
          if (retries === 0) {
            logger.error(`  ✗ 失败: ${error}`);
            failCount++;
          } else {
            logger.warn(`  重试 (剩余 ${retries} 次)`);
            await new Promise(r => setTimeout(r, 2000));
          }
        }
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    logger.summary({
      total: notes.length,
      success: successCount,
      fail: failCount,
      duration: `${duration}s`,
    });

  } catch (error) {
    logger.error(`流程失败: ${error}`);
    throw error;
  }
}
