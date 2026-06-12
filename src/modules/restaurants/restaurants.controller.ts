import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { QueryRestaurantDto } from './dto/query-restaurant.dto';
import { RestaurantDetailDto, RestaurantDto } from './dto/restaurant.dto';
import { RestaurantsService } from './restaurants.service';

@ApiTags('Restaurants')
@Controller({
  path: 'restaurants',
  version: '1',
})
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  /** Public endpoint for creating restaurants — also used by scan integration */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateRestaurantDto })
  @ApiCreatedResponse({ description: 'Restaurant created successfully', type: RestaurantDto })
  create(@Body() dto: CreateRestaurantDto) {
    return this.restaurantsService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'List of restaurants with pagination',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/RestaurantDto' } },
        total: { type: 'number', example: 30 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        hasNextPage: { type: 'boolean', example: true },
      },
    },
  })
  findAll(@Query() query: QueryRestaurantDto) {
    return this.restaurantsService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number, description: 'Restaurant ID' })
  @ApiOkResponse({ description: 'Restaurant details with dishes', type: RestaurantDetailDto })
  @ApiNotFoundResponse({ description: 'Restaurant not found' })
  findOne(@Param('id') id: number) {
    return this.restaurantsService.findById(+id);
  }
}
