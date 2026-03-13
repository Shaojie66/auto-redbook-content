import { XhsNote } from '../types';
import axios from 'axios';

export interface FeishuConfig {
  appToken: string;
  tableId: string;
  appId?: string;
  appSecret?: string;
}

export class FeishuWriter {
  private config: FeishuConfig;
  private accessToken?: string;
  private tokenExpiry?: number;

  constructor(config: FeishuConfig) {
    this.config = config;
  }

  private async getAccessToken(): Promise<string> {
    // 如果 token 还有效，直接返回
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // 检查必需的配置
    if (!this.config.appId || !this.config.appSecret) {
      throw new Error('Missing appId or appSecret in Feishu config');
    }

    // 获取新 token
    const response = await axios.post(
      'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
      {
        app_id: this.config.appId,
        app_secret: this.config.appSecret,
      }
    );

    this.accessToken = response.data.tenant_access_token as string;
    this.tokenExpiry = Date.now() + (response.data.expire - 60) * 1000; // 提前 60 秒过期

    return this.accessToken;
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

  async writeRecord(fields: Record<string, any>): Promise<void> {
    const token = await this.getAccessToken();

    const response = await axios.post(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config.appToken}/tables/${this.config.tableId}/records`,
      {
        fields,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.code !== 0) {
      throw new Error(`Feishu API error: ${response.data.msg}`);
    }
  }

  getTableUrl(): string {
    return `https://s0w6i986vwt.feishu.cn/base/${this.config.appToken}?table=${this.config.tableId}`;
  }

  getConfig() {
    return this.config;
  }
}
