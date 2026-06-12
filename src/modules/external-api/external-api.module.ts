import { Module } from '@nestjs/common';

import { ChatGPTService } from './chatgpt/chatgpt.service';
import { ClaudeService } from './claude/claude.service';

@Module({
  providers: [ClaudeService, ChatGPTService],
  exports: [ClaudeService, ChatGPTService],
})
export class ExternalApiModule {}
