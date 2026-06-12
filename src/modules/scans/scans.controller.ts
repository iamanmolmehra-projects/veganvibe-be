import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateScanDto } from './dto/create-scan.dto';
import { QueryScanDto } from './dto/query-scan.dto';
import { ScanListResponseDto } from './dto/scan-list-response.dto';
import { ScanUploadResponseDto } from './dto/scan-response.dto';
import { ScansService } from './scans.service';

@ApiTags('Scans')
@Controller({
  path: 'scans',
  version: '1',
})
export class ScansController {
  constructor(private readonly scansService: ScansService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Paginated scan history for the logged-in user',
    type: ScanListResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized — invalid or missing JWT' })
  findAll(@Query() query: QueryScanDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.scansService.findAll(query, userId);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Menu images (jpg, jpeg, png, webp, avif — max 5MB each, up to 10 files)',
        },
        latitude: { type: 'number', example: 13.06015, description: 'Restaurant latitude' },
        longitude: { type: 'number', example: 80.24286, description: 'Restaurant longitude' },
        photos: {
          type: 'array',
          items: { type: 'string' },
          description: 'Photo URLs of the restaurant',
          example: ['https://example.com/photo1.jpg'],
        },
        name: { type: 'string', example: 'Green Leaf Cafe', description: 'Name of the restaurant' },
        address: { type: 'string', example: '123 Vegan Street, Chennai', description: 'Address of the restaurant' },
        rating: { type: 'number', example: 4.5, description: 'Rating of the restaurant' },
        totalReviews: { type: 'number', example: 120, description: 'Total number of reviews for the restaurant' },
        description: { type: 'string', example: 'A cozy vegan cafe with fresh ingredients', description: 'Description of the restaurant' },
      },
      required: ['images'],
    },
  })
  @ApiOkResponse({ description: 'Scan processed successfully', type: ScanUploadResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid file format, size exceeds limit, or missing images' })
  @ApiInternalServerErrorResponse({ description: 'OCR or AI parsing failed' })
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createScanDto: CreateScanDto,
    @Req() req: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image file is required');
    }
    const userId = req.user.userId;
    return this.scansService.processUpload(files, createScanDto, userId);
  }
}
