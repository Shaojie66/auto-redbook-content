import { XhsNote } from '../types';

export interface FeishuRecordFields {
  原标题: string;
  原文链接: { text: string; link: string };
  作者: string;
  点赞数: number;
  评论数: number;
  收藏数: number;
  洗稿后标题?: string;
  洗稿后正文?: string;
  提取标签?: string;
  抓取时间: number;
  状态: string;
}

export class RecordBuilder {
  static buildFromNote(
    note: XhsNote,
    rewritten?: { title: string; content: string; tags: string[] }
  ): FeishuRecordFields {
    const fields: FeishuRecordFields = {
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
}
