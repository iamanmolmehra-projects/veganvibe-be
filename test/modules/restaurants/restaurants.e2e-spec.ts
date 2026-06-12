import request from 'supertest';

import { APP_URL } from '../../utils/constants';

describe('Restaurants Module (e2e)', () => {
  const app = APP_URL;
  let firstRestaurantId: number;
  let createdRestaurantId: number;

  describe('POST /api/v1/restaurants', () => {
    it('should create a new restaurant', async () => {
      const response = await request(app)
        .post('/api/v1/restaurants')
        .send({ name: 'E2E Test Restaurant', city: 'Chennai', source: 'manual' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'E2E Test Restaurant');
      createdRestaurantId = response.body.id;
    });

    it('should create restaurant with only name', async () => {
      const response = await request(app)
        .post('/api/v1/restaurants')
        .send({ name: 'Minimal Restaurant' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should return 422 when name is missing', async () => {
      await request(app)
        .post('/api/v1/restaurants')
        .send({ city: 'Chennai' })
        .expect(422);
    });
  });

  describe('GET /api/v1/restaurants', () => {
    it('should return paginated list', async () => {
      const response = await request(app).get('/api/v1/restaurants').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('hasNextPage');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      firstRestaurantId = response.body.data[0].id;
    });

    it('should respect pagination', async () => {
      const response = await request(app)
        .get('/api/v1/restaurants')
        .query({ page: 1, limit: 5 })
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should filter by city', async () => {
      const response = await request(app)
        .get('/api/v1/restaurants')
        .query({ city: 'Chennai' })
        .expect(200);

      response.body.data.forEach((r: any) => {
        expect(r.city.toLowerCase()).toContain('chennai');
      });
    });

    it('should filter by cuisine type', async () => {
      const response = await request(app)
        .get('/api/v1/restaurants')
        .query({ cuisineType: 'Vegan' })
        .expect(200);

      response.body.data.forEach((r: any) => {
        expect(r.cuisineType).toContain('Vegan');
      });
    });

    it('should filter by isVerified', async () => {
      const response = await request(app)
        .get('/api/v1/restaurants')
        .query({ isVerified: true })
        .expect(200);

      response.body.data.forEach((r: any) => {
        expect(r.isVerified).toBe(true);
      });
    });

    it('should filter by minimum rating', async () => {
      const response = await request(app)
        .get('/api/v1/restaurants')
        .query({ minRating: 4.5 })
        .expect(200);

      response.body.data.forEach((r: any) => {
        expect(parseFloat(r.rating)).toBeGreaterThanOrEqual(4.5);
      });
    });

    it('should filter by search name', async () => {
      const response = await request(app)
        .get('/api/v1/restaurants')
        .query({ search: 'Carrots' })
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty for non-matching city', async () => {
      const response = await request(app)
        .get('/api/v1/restaurants')
        .query({ city: 'NonExistentCity123' })
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should sort by rating descending', async () => {
      const response = await request(app)
        .get('/api/v1/restaurants')
        .query({ limit: 10 })
        .expect(200);

      const ratings = response.body.data.map((r: any) => parseFloat(r.rating));
      for (let i = 0; i < ratings.length - 1; i++) {
        expect(ratings[i]).toBeGreaterThanOrEqual(ratings[i + 1]);
      }
    });
  });

  describe('GET /api/v1/restaurants/:id', () => {
    it('should return restaurant with dishes array', async () => {
      const response = await request(app)
        .get(`/api/v1/restaurants/${firstRestaurantId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', firstRestaurantId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('dishes');
      expect(Array.isArray(response.body.dishes)).toBe(true);
    });

    it('should return empty dishes for restaurant with no dishes', async () => {
      const response = await request(app)
        .get(`/api/v1/restaurants/${createdRestaurantId}`)
        .expect(200);

      expect(response.body.dishes).toEqual([]);
    });

    it('should return 404 for non-existent restaurant', async () => {
      await request(app).get('/api/v1/restaurants/99999').expect(404);
    });
  });
});
