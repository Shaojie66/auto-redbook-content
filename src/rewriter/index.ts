import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { REWRITE_SYSTEM_PROMPT, buildRewritePrompt } from './prompts';

export interface RewriteResult {
  title: string;
  content: string;
  tags: string[];
}

export interface RewriterConfig {
  provider: 'openai' | 'anthropic';
  apiKey: string;
  model: string;
  baseURL?: string;
}

export class ContentRewriter {
  private config: RewriterConfig;
  private openai?: OpenAI;
  private anthropic?: Anthropic;

  constructor(config: RewriterConfig) {
    this.config = config;
    
    if (config.provider === 'openai') {
      this.openai = new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
      });
    } else if (config.provider === 'anthropic') {
      this.anthropic = new Anthropic({
        apiKey: config.apiKey,
      });
    }
  }

  async rewrite(note: { title: string; content: string }): Promise<RewriteResult> {
    const prompt = buildRewritePrompt(note);

    if (this.config.provider === 'openai') {
      return this.rewriteWithOpenAI(prompt);
    } else if (this.config.provider === 'anthropic') {
      return this.rewriteWithAnthropic(prompt);
    }

    throw new Error(`Unsupported AI provider: ${this.config.provider}`);
  }

  private async rewriteWithOpenAI(prompt: string): Promise<RewriteResult> {
    if (!this.openai) throw new Error('OpenAI client not initialized');

    const response = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: 'system', content: REWRITE_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    return JSON.parse(content);
  }

  private async rewriteWithAnthropic(prompt: string): Promise<RewriteResult> {
    if (!this.anthropic) throw new Error('Anthropic client not initialized');

    const response = await this.anthropic.messages.create({
      model: this.config.model,
      max_tokens: 2048,
      temperature: 0.8,
      system: REWRITE_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: prompt },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type from Anthropic');

    // Anthropic 不支持 JSON mode，需要手动提取
    const text = content.text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to extract JSON from Anthropic response');

    return JSON.parse(jsonMatch[0]);
  }
}
