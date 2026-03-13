import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface OpenClawAIConfig {
  model?: string;
  temperature?: number;
  timeout?: number;
}

export class OpenClawAI {
  private config: OpenClawAIConfig;

  constructor(config: OpenClawAIConfig = {}) {
    this.config = {
      model: config.model || 'claude-opus-4-6',
      temperature: config.temperature || 0.8,
      timeout: config.timeout || 120000, // 2 minutes
    };
  }

  async chat(systemPrompt: string, userPrompt: string): Promise<string> {
    // 创建临时文件存储 prompt
    const tempDir = os.tmpdir();
    const promptFile = path.join(tempDir, `openclaw-prompt-${Date.now()}.txt`);
    const responseFile = path.join(tempDir, `openclaw-response-${Date.now()}.txt`);

    try {
      // 组合完整 prompt
      const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;
      fs.writeFileSync(promptFile, fullPrompt, 'utf-8');

      // 构建 oracle 命令
      const cmd = [
        'oracle',
        '--engine', 'api',
        '--model', this.config.model,
        '--wait',
        '--write-output', responseFile,
        '--file', promptFile,
        '--prompt', '"处理上述文件中的任务"'
      ].join(' ');

      // 执行命令
      execSync(cmd, {
        encoding: 'utf-8',
        timeout: this.config.timeout,
        stdio: 'pipe',
      });

      // 读取响应
      if (fs.existsSync(responseFile)) {
        const response = fs.readFileSync(responseFile, 'utf-8');
        return response.trim();
      }

      throw new Error('No response file generated');
    } catch (error: any) {
      throw new Error(`OpenClaw AI call failed: ${error.message}`);
    } finally {
      // 清理临时文件
      try {
        if (fs.existsSync(promptFile)) fs.unlinkSync(promptFile);
        if (fs.existsSync(responseFile)) fs.unlinkSync(responseFile);
      } catch (e) {
        // 忽略清理错误
      }
    }
  }
}
