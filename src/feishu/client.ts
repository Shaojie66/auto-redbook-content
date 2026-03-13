export interface FeishuConfig {
  appToken: string;
  tableId: string;
}

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

export class FeishuClient {
  private config: FeishuConfig;

  constructor(config: FeishuConfig) {
    this.config = config;
  }

  getTableUrl(): string {
    return `https://s0w6i986vwt.feishu.cn/base/${this.config.appToken}?table=${this.config.tableId}`;
  }

  // Note: Actual API calls will be handled by external feishu tools
  // This class provides structure and URL generation
}
