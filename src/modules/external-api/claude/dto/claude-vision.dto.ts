export interface ClaudeVisionRequestDto {
  imageBuffer: Buffer;
  mimeType: string;
}

export interface ClaudeVisionResponseDto {
  text: string;
}
