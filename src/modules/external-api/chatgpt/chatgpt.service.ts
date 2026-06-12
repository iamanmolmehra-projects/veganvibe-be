import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { OpenAIConfig } from '../../../common/config/openai.config';

import { ChatGPTParseRequestDto, ChatGPTParseResponseDto } from './dto/chatgpt-parse.dto';

@Injectable()
export class ChatGPTService {
  private readonly config: OpenAIConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      apiKey: this.configService.get<string>('openai.apiKey')!,
      apiUrl: this.configService.get<string>('openai.apiUrl')!,
      model: this.configService.get<string>('openai.model')!,
    };
  }

  async parseMenuText(dto: ChatGPTParseRequestDto): Promise<ChatGPTParseResponseDto> {
    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: `You are a menu parser. Convert the raw menu text into a structured JSON object. For each dish, analyze the ingredients and description to determine if it is vegan (contains no animal products like dairy, eggs, honey, meat, fish). Set is_vegan to true only if the dish is fully plant-based. Return ONLY valid JSON, no markdown, no explanation.

            Expected JSON structure:
            {
              "restaurant_name": "string",
              "dishes": [
                {
                  "name": "string",
                  "description": "string or null",
                  "price": number,
                  "menu_category": "string or null",
                  "cuisine_type": "string or null",
                  "food_type": "veg | non_veg | vegan",
                  "tags": "string or null",
                  "is_vegan": true or false,
                  "is_available": true
                }
              ]
            }`,
          },
          {
            role: 'user',
            content: dto.ocrText,
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`ChatGPT API failed: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('AI parsing failed: empty response');
    }

    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanContent);
    } catch {
      throw new Error('AI parsing failed: invalid JSON response');
    }
  }
}
