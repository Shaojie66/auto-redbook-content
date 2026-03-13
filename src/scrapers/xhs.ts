import { exec } from 'child_process';
import { promisify } from 'util';
import { XhsNote, ScraperConfig } from '../types';

const execAsync = promisify(exec);

export class XhsScraper {
  /**
   * 使用 mcporter 调用 xiaohongshu MCP 搜索笔记
   */
  async searchNotes(config: ScraperConfig): Promise<XhsNote[]> {
    const notes: XhsNote[] = [];

    for (const keyword of config.keywords) {
      try {
        console.log(`正在搜索关键词: ${keyword}`);
        
        // 调用 mcporter 执行 xiaohongshu MCP 的搜索工具
        const command = `mcporter call xiaohongshu search_notes --keyword "${keyword}" --sort_type "${config.sortBy || 'hot'}" --page_size ${config.maxResults}`;
        
        const { stdout, stderr } = await execAsync(command);
        
        if (stderr) {
          console.error(`搜索 ${keyword} 时出现警告:`, stderr);
        }

        // 解析 mcporter 返回的 JSON 结果
        const result = JSON.parse(stdout);
        
        if (result.notes && Array.isArray(result.notes)) {
          const parsedNotes = result.notes.map((note: any) => ({
            id: note.note_id || note.id,
            title: note.title || '',
            content: note.desc || note.content || '',
            author: note.user?.nickname || note.author || 'Unknown',
            likes: note.liked_count || note.likes || 0,
            comments: note.comment_count || note.comments || 0,
            shares: note.share_count || note.shares || 0,
            url: note.note_url || `https://www.xiaohongshu.com/explore/${note.note_id || note.id}`,
            images: note.image_list || note.images || [],
            tags: note.tag_list?.map((t: any) => t.name) || note.tags || [],
            publishTime: note.time || note.publishTime,
          }));

          notes.push(...parsedNotes);
          console.log(`关键词 ${keyword} 找到 ${parsedNotes.length} 条笔记`);
        }
      } catch (error) {
        console.error(`搜索关键词 ${keyword} 失败:`, error);
      }
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
