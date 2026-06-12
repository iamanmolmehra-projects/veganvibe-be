import { registerAs } from '@nestjs/config';

export interface OpenAIConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
}

export default registerAs<OpenAIConfig>('openai', () => ({
  apiKey: process.env.OPENAI_API_KEY || '',
  apiUrl: process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions',
  model: process.env.OPENAI_MODEL || 'gpt-4o',
}));
