import { exec } from 'child_process';
import { promisify } from 'util';
import { XhsNote, ScraperConfig } from '../types';

const execAsync = promisify(exec);

export class XhsScraper {
  /**
   * 直接调用 list_feeds 获取首页笔记（不依赖搜索功能）
   */
  async searchNotes(config: ScraperConfig): Promise<XhsNote[]> {
    const notes: XhsNote[] = [];

    try {
      console.log(`正在获取小红书首页笔记...`);
      
      // 直接调用 list_feeds 获取首页内容
      const command = `mcporter call xiaohongshu list_feeds`;
      
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr && !stderr.includes('[mcporter]')) {
        console.error(`获取笔记时出现警告:`, stderr);
      }

      // 解析 mcporter 返回的 JSON 结果
      const result = JSON.parse(stdout);
      
      if (result.feeds && Array.isArray(result.feeds)) {
        const parsedNotes = result.feeds
          .filter((feed: any) => feed.noteCard)
          .slice(0, config.maxResults)
          .map((feed: any) => {
            const note = feed.noteCard;
            return {
              id: feed.id,
              title: note.displayTitle || '',
              content: note.desc || '',
              author: note.user?.nickname || 'Unknown',
              likes: parseInt(note.interactInfo?.likedCount?.replace(/[^\d]/g, '') || '0'),
              comments: parseInt(note.interactInfo?.commentCount?.replace(/[^\d]/g, '') || '0'),
              shares: parseInt(note.interactInfo?.sharedCount?.replace(/[^\d]/g, '') || '0'),
              url: `https://www.xiaohongshu.com/explore/${feed.id}`,
              images: note.cover?.infoList?.map((img: any) => img.url) || [],
              tags: note.tagList?.map((t: any) => t.name) || [],
              publishTime: '',
            };
          });

        notes.push(...parsedNotes);
        console.log(`获取到 ${parsedNotes.length} 条笔记`);
      }
    } catch (error) {
      console.error(`获取笔记失败:`, error);
    }

    return notes.slice(0, config.maxResults);
  }

  /**
   * 获取单条笔记详情
   */
  async getNoteDetail(noteId: string): Promise<XhsNote | null> {
    try {
      const command = `mcporter call xiaohongshu get_note_detail --note_id "${noteId}"`;
      const { stdout } = await execAsync(command);
      const result = JSON.parse(stdout);

      if (result.note) {
        const note = result.note;
        return {
          id: note.note_id || noteId,
          title: note.title || '',
          content: note.desc || note.content || '',
          author: note.user?.nickname || 'Unknown',
          likes: note.liked_count || 0,
          comments: note.comment_count || 0,
          shares: note.share_count || 0,
          url: note.note_url || `https://www.xiaohongshu.com/explore/${noteId}`,
          images: note.image_list || [],
          tags: note.tag_list?.map((t: any) => t.name) || [],
          publishTime: note.time,
        };
      }

      return null;
    } catch (error) {
      console.error(`获取笔记 ${noteId} 详情失败:`, error);
      return null;
    }
  }
}
