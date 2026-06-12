import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import sharp from 'sharp';
import { Repository } from 'typeorm';

import { DishStatus, FoodType } from '../dishes/enums/dish.enum';
import { DishEntity } from '../dishes/infrastructure/persistence/relational/entities/dish.entity';
import { ChatGPTService } from '../external-api/chatgpt/chatgpt.service';
import { ClaudeService } from '../external-api/claude/claude.service';
import { RestaurantDefaults, RestaurantSource } from '../restaurants/enums/restaurant.enum';
import { RestaurantEntity } from '../restaurants/infrastructure/persistence/relational/entities/restaurant.entity';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';

import { CreateScanDto } from './dto/create-scan.dto';
import { QueryScanDto } from './dto/query-scan.dto';
import { ScanDefaults, ScanStatus } from './enums/scan.enum';
import { ScanEntity } from './infrastructure/persistence/relational/entities/scan.entity';

@Injectable()
export class ScansService {
  constructor(
    @InjectRepository(ScanEntity)
    private readonly scanRepository: Repository<ScanEntity>,
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>,
    @InjectRepository(DishEntity)
    private readonly dishRepository: Repository<DishEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly claudeService: ClaudeService,
    private readonly chatGPTService: ChatGPTService,
  ) {}

  async findAll(query: QueryScanDto, userId: number) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 10, 50);

    const [data, total] = await this.scanRepository.findAndCount({
      where: { userId },
      relations: ['restaurant', 'dishes'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      hasNextPage: page * limit < total,
    };
  }

  async processUpload(files: Express.Multer.File[], dto: CreateScanDto, userId: number) {
    // Validate user exists
    const userExists = await this.userRepository.findOne({ where: { id: userId } });
    if (!userExists) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Step 1 — Validate and convert all images
    const convertedImages: { buffer: Buffer; mimeType: string }[] = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException(`File "${file.originalname}" exceeds 5MB limit`);
      }

      try {
        const buffer = await sharp(file.buffer).jpeg({ quality: 90 }).toBuffer();
        convertedImages.push({ buffer, mimeType: 'image/jpeg' });
      } catch {
        throw new BadRequestException('File content is not a valid image. Please upload a real image file.');
      }

      // Final validation
      const lastConverted = convertedImages[convertedImages.length - 1];
      if (!this.isValidImage(lastConverted.buffer)) {
        throw new BadRequestException('File content is not a valid image. Please upload a real image file.');
      }
    }

    // Step 2 — Save initial scan record
    let scan = this.scanRepository.create({
      userId: userId,
      imageUrl: files.map((f) => `uploads/${Date.now()}_${f.originalname}`),
      status: ScanStatus.PENDING,
    });
    scan = await this.scanRepository.save(scan);

    try {
      // Step 3 — Claude Vision (OCR) on all images, combine results
      scan.status = ScanStatus.PROCESSING;
      await this.scanRepository.save(scan);

      const ocrTexts: string[] = [];
      for (const img of convertedImages) {
        const ocrResult = await this.claudeService.extractTextFromImage({
          imageBuffer: img.buffer,
          mimeType: img.mimeType,
        });
        ocrTexts.push(ocrResult.text);
      }

      const combinedOcrText = ocrTexts.join('\n\n--- Next Page ---\n\n');
      scan.ocrRawText = combinedOcrText;
      await this.scanRepository.save(scan);

      // Step 4 — ChatGPT (JSON conversion)
      const parsedJson = await this.chatGPTService.parseMenuText({
        ocrText: combinedOcrText,
      });
      scan.parsedJson = parsedJson;
      await this.scanRepository.save(scan);

      // Validate that dishes were found in the menu
      const dishes = parsedJson.dishes || [];
      if (dishes.length === 0) {
        scan.status = ScanStatus.FAILED;
        scan.rejectionReason = 'No valid menu items found in the uploaded images';
        await this.scanRepository.save(scan);
        throw new BadRequestException('No dishes found. Please upload a valid menu image.');
      }

      // Step 5 — Create restaurant record
      const restaurantEntity = this.restaurantRepository.create({
        name: dto.name || parsedJson.restaurant_name || RestaurantDefaults.UNKNOWN_NAME,
        latitude: dto.latitude,
        longitude: dto.longitude,
        photos: dto.photos,
        address: dto.address,
        rating: dto.rating,
        totalReviews: dto.totalReviews,
        description: dto.description,
        source: RestaurantSource.SCAN,
        isVerified: false,
        isActive: true,
      });
      const savedRestaurant = await this.restaurantRepository.save(restaurantEntity);
      scan.restaurantId = savedRestaurant.id;
      await this.scanRepository.save(scan);

      // Step 6 — Create dish records
      const createdDishes: DishEntity[] = [];

      for (const dish of dishes) {
        const foodType = dish.food_type
          ? (dish.food_type.toUpperCase() as FoodType)
          : undefined;

        const dishEntity = this.dishRepository.create({
          restaurantId: savedRestaurant.id,
          scanId: scan.id,
          name: dish.name,
          description: dish.description || undefined,
          price: dish.price || 0,
          menuCategory: dish.menu_category || undefined,
          cuisineType: dish.cuisine_type || RestaurantDefaults.UNKNOWN_CUISINE,
          foodType: foodType,
          tags: dish.tags || undefined,
          imageUrl: undefined,
          isVegan: dish.is_vegan ?? (foodType === FoodType.VEGAN),
          ratings: undefined,
          status: DishStatus.ACTIVE,
        });
        const savedDish = await this.dishRepository.save(dishEntity);
        createdDishes.push(savedDish);
      }

      // Step 7 — Finalize scan
      scan.status = ScanStatus.COMPLETED;
      await this.scanRepository.save(scan);

      return {
        scan_id: scan.id,
        restaurant_id: savedRestaurant.id,
        restaurant_name: savedRestaurant.name,
        dishes_created: createdDishes.length,
        status: ScanStatus.COMPLETED,
        dishes: createdDishes,
      };
    } catch (error) {
      scan.status = ScanStatus.FAILED;
      scan.rejectionReason = error instanceof Error ? error.message : ScanDefaults.UNKNOWN_ERROR;
      await this.scanRepository.save(scan);

      throw new InternalServerErrorException({
        error: scan.rejectionReason,
      });
    }
  }

  private isValidImage(buffer: Buffer): boolean {
    if (buffer.length < 4) return false;

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
    // PNG: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;
    // WebP: RIFF....WEBP
    if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return true;
    // GIF: GIF8
    if (buffer.toString('ascii', 0, 4) === 'GIF8') return true;

    return false;
  }
}
