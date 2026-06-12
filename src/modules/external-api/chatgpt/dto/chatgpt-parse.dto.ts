export interface ChatGPTParseRequestDto {
  ocrText: string;
}

export interface ParsedDishDto {
  name: string;
  description?: string | null;
  price: number;
  menu_category?: string | null;
  cuisine_type?: string | null;
  food_type?: string | null;
  tags?: string | null;
  is_vegan?: boolean;
  is_available?: boolean;
}

export interface ChatGPTParseResponseDto {
  restaurant_name: string;
  dishes: ParsedDishDto[];
}
