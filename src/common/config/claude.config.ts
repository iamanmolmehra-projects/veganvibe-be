import { registerAs } from '@nestjs/config';

export interface ClaudeConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
}

export default registerAs<ClaudeConfig>('claude', () => ({
  apiKey: process.env.CLAUDE_API_KEY || '',
  apiUrl: process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages',
  model: process.env.CLAUDE_MODEL || 'claude-opus-4-5',
}));
