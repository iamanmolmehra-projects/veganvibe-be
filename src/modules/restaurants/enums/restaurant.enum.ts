export enum RestaurantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CLOSED = 'closed',
  OPEN = 'open',
}

export enum RestaurantSource {
  SCAN = 'scan',
  GOOGLE = 'google',
  MANUAL = 'manual',
}

export enum RestaurantDefaults {
  UNKNOWN_NAME = 'Unknown',
  UNKNOWN_CUISINE = 'Unknown',
}

export enum MenuCategory {
  STARTER = 'Starter',
  MAIN = 'Main',
  DESSERT = 'Dessert',
  COCKTAIL = 'Cocktail',
  MOCKTAIL = 'Mocktail',
}

export enum CuisineType {
  INDIAN = 'Indian',
  CHINESE = 'Chinese',
  ITALIAN = 'Italian',
  MEXICAN = 'Mexican',
  CONTINENTAL = 'Continental',
  UNKNOWN = 'Unknown',
}
