import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ClaudeConfig } from '../../../common/config/claude.config';

import { ClaudeVisionRequestDto, ClaudeVisionResponseDto } from './dto/claude-vision.dto';

@Injectable()
export class ClaudeService {
  private readonly config: ClaudeConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      apiKey: this.configService.get<string>('claude.apiKey')!,
      apiUrl: this.configService.get<string>('claude.apiUrl')!,
      model: this.configService.get<string>('claude.model')!,
    };
  }

  async extractTextFromImage(dto: ClaudeVisionRequestDto): Promise<ClaudeVisionResponseDto> {
    const base64Image = dto.imageBuffer.toString('base64');

    // Detect actual media type from magic bytes
    const mediaType = this.detectMediaType(dto.imageBuffer) || dto.mimeType;

    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: 4096,
        system: 'You are a menu OCR assistant. Extract all visible text from this menu image exactly as it appears. Include restaurant name, dish names, descriptions, prices, and categories. Return plain text only.',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: 'Extract all text from this menu image.',
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Claude Vision API failed: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;

    if (!text) {
      throw new Error('Claude Vision returned empty response');
    }

    return { text };
  }

  private detectMediaType(buffer: Buffer): string | null {
    if (buffer.length < 4) return null;

    // JPEG: starts with FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'image/jpeg';
    }
    // PNG: starts with 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return 'image/png';
    }
    // WebP: starts with RIFF....WEBP
    if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
      return 'image/webp';
    }
    // GIF: starts with GIF8
    if (buffer.toString('ascii', 0, 4) === 'GIF8') {
      return 'image/gif';
    }

    return null;
  }
}
