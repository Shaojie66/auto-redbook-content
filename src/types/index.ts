export interface XhsNote {
  id: string;
  title: string;
  content: string;
  author: string;
  likes: number;
  comments: number;
  shares: number;
  url: string;
  images?: string[];
  tags?: string[];
  publishTime?: string;
}

export interface ScraperConfig {
  keywords: string[];
  maxResults: number;
  sortBy?: 'hot' | 'latest';
}

export interface FeishuRecord {
  title: string;
  originalContent: string;
  rewrittenContent?: string;
  author: string;
  likes: number;
  url: string;
  tags?: string;
  scrapedAt: string;
}
