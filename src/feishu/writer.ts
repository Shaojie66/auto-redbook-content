import { XhsNote } from '../types';

export interface FeishuConfig {
  appToken: string;
  tableId: string;
}

export class FeishuWriter {
  private config: FeishuConfig;

  constructor(config: FeishuConfig) {
    this.config = config;
  }

  buildRecord(
    note: XhsNote,
    rewritten?: { title: string; content: string; tags: string[] }
  ): Record<string, any> {
    const fields: Record<string, any> = {
      原标题: note.title,
      原文链接: {
        text: note.title,
        link: note.url,
      },
      作者: note.author,
      点赞数: note.likes,
      评论数: note.comments,
      收藏数: note.shares,
      抓取时间: Date.now(),
      状态: '待审核',
    };

    if (rewritten) {
      fields.洗稿后标题 = rewritten.title;
      fields.洗稿后正文 = rewritten.content;
      fields.提取标签 = rewritten.tags.join(', ');
    }

    return fields;
  }

  getTableUrl(): string {
    return `https://s0w6i986vwt.feishu.cn/base/${this.config.appToken}?table=${this.config.tableId}`;
  }

  getConfig() {
    return this.config;
  }
}
