import request from 'supertest';

import { APP_URL } from '../../utils/constants';

describe('Dishes via Restaurants (e2e)', () => {
  const app = APP_URL;

  describe('GET /api/v1/restaurants/:id (dishes included)', () => {
    it('should return dish with all expected fields', async () => {
      const response = await request(app)
        .get('/api/v1/restaurants/1')
        .expect(200);

      expect(response.body.dishes.length).toBeGreaterThan(0);

      const dish = response.body.dishes[0];
      expect(dish).toHaveProperty('id');
      expect(dish).toHaveProperty('name');
      expect(dish).toHaveProperty('price');
      expect(dish).toHaveProperty('cuisineType');
      expect(dish).toHaveProperty('status');
      expect(dish).toHaveProperty('restaurantId', 1);
    });

    it('should have correct field types on dish', async () => {
      const response = await request(app)
        .get('/api/v1/restaurants/1')
        .expect(200);

      const dish = response.body.dishes[0];
      expect(typeof dish.id).toBe('number');
      expect(typeof dish.name).toBe('string');
      expect(typeof dish.price).toBe('number');
      expect(typeof dish.isVegan).toBe('boolean');
    });

    it('should have valid status enum', async () => {
      const response = await request(app)
        .get('/api/v1/restaurants/1')
        .expect(200);

      const dish = response.body.dishes[0];
      expect(['active', 'inactive', 'out_of_stock']).toContain(dish.status);
    });

    it('should have valid foodType if present', async () => {
      const response = await request(app)
        .get('/api/v1/restaurants/1')
        .expect(200);

      const dish = response.body.dishes[0];
      if (dish.foodType) {
        expect(['VEG', 'NON_VEG', 'VEGAN']).toContain(dish.foodType);
      }
    });

    it('should include scanId on seeded dishes', async () => {
      const response = await request(app)
        .get('/api/v1/restaurants/1')
        .expect(200);

      const dish = response.body.dishes[0];
      expect(dish).toHaveProperty('scanId');
      expect(typeof dish.scanId).toBe('number');
    });

    it('should return imageUrl as array or null', async () => {
      const response = await request(app)
        .get('/api/v1/restaurants/1')
        .expect(200);

      const dish = response.body.dishes[0];
      if (dish.imageUrl !== null) {
        expect(Array.isArray(dish.imageUrl)).toBe(true);
      }
    });
  });

  describe('GET /api/v1/scans (dishes in scan records)', () => {
    it('should include dishes array in scan records', async () => {
      const response = await request(app)
        .get('/api/v1/scans')
        .query({ page: 1, limit: 1 })
        .expect(200);

      if (response.body.data.length > 0) {
        const scan = response.body.data[0];
        expect(scan).toHaveProperty('dishes');
        expect(Array.isArray(scan.dishes)).toBe(true);
      }
    });

    it('should have dish records linked to scan via scanId', async () => {
      const response = await request(app)
        .get('/api/v1/scans')
        .query({ page: 1, limit: 1 })
        .expect(200);

      if (response.body.data.length > 0 && response.body.data[0].dishes.length > 0) {
        const scan = response.body.data[0];
        const dish = scan.dishes[0];
        expect(dish).toHaveProperty('scanId', scan.id);
      }
    });
  });
});
