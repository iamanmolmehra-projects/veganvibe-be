import request from 'supertest';

import { APP_URL } from '../../utils/constants';

describe('Scans Module (e2e)', () => {
  const app = APP_URL;

  describe('GET /api/v1/scans', () => {
    it('should return paginated list of scans', async () => {
      const response = await request(app)
        .get('/api/v1/scans')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('hasNextPage');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should respect pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/scans')
        .query({ page: 1, limit: 5 })
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(5);
    });

    it('should cap limit at 50', async () => {
      const response = await request(app)
        .get('/api/v1/scans')
        .query({ limit: 100 })
        .expect(200);

      expect(response.body.limit).toBe(50);
    });

    it('should include restaurant data in each scan record', async () => {
      const response = await request(app)
        .get('/api/v1/scans')
        .query({ page: 1, limit: 1 })
        .expect(200);

      if (response.body.data.length > 0) {
        const scan = response.body.data[0];
        expect(scan).toHaveProperty('restaurant');
        if (scan.restaurant) {
          expect(scan.restaurant).toHaveProperty('id');
          expect(scan.restaurant).toHaveProperty('name');
        }
      }
    });

    it('should include dishes array in each scan record', async () => {
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

    it('should return imageUrl as an array', async () => {
      const response = await request(app)
        .get('/api/v1/scans')
        .query({ page: 1, limit: 1 })
        .expect(200);

      if (response.body.data.length > 0) {
        expect(Array.isArray(response.body.data[0].imageUrl)).toBe(true);
      }
    });

    it('should return scan with expected fields', async () => {
      const response = await request(app)
        .get('/api/v1/scans')
        .query({ page: 1, limit: 1 })
        .expect(200);

      if (response.body.data.length > 0) {
        const scan = response.body.data[0];
        expect(scan).toHaveProperty('id');
        expect(scan).toHaveProperty('userId');
        expect(scan).toHaveProperty('imageUrl');
        expect(scan).toHaveProperty('status');
        expect(scan).toHaveProperty('createdAt');
        expect(scan).toHaveProperty('updatedAt');
      }
    });

    it('should return hasNextPage correctly', async () => {
      const response = await request(app)
        .get('/api/v1/scans')
        .query({ page: 1, limit: 5 })
        .expect(200);

      if (response.body.total > 5) {
        expect(response.body.hasNextPage).toBe(true);
      } else {
        expect(response.body.hasNextPage).toBe(false);
      }
    });
  });

  describe('POST /api/v1/scans/upload', () => {
    it('should return 400 when no image files are provided', async () => {
      const response = await request(app)
        .post('/api/v1/scans/upload')
        .field('user_id', '1')
        .expect(400);

      expect(response.body.message).toBe('At least one image file is required');
    });

    it('should return 400 for invalid image content (single file)', async () => {
      const fakeImage = Buffer.alloc(100, 0xaa);

      const response = await request(app)
        .post('/api/v1/scans/upload')
        .field('user_id', '1')
        .attach('images', fakeImage, { filename: 'fake.jpg', contentType: 'image/jpeg' })
        .expect(400);

      expect(response.body.message).toContain('not a valid image');
    });

    it('should return 400 for invalid image content with multiple files', async () => {
      const fake1 = Buffer.alloc(100, 0xaa);
      const fake2 = Buffer.alloc(100, 0xbb);

      const response = await request(app)
        .post('/api/v1/scans/upload')
        .field('user_id', '1')
        .attach('images', fake1, { filename: 'fake1.jpg', contentType: 'image/jpeg' })
        .attach('images', fake2, { filename: 'fake2.png', contentType: 'image/png' })
        .expect(400);

      expect(response.body.message).toContain('not a valid image');
    });

    it('should return 400 for file exceeding 5MB', async () => {
      const largeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1, 0xff);

      const response = await request(app)
        .post('/api/v1/scans/upload')
        .field('user_id', '1')
        .attach('images', largeBuffer, { filename: 'large.jpg', contentType: 'image/jpeg' })
        .expect(400);

      expect(response.body.message).toContain('exceeds 5MB');
    });

    it('should accept latitude and longitude without error', async () => {
      const fakeImage = Buffer.alloc(100, 0xaa);

      const response = await request(app)
        .post('/api/v1/scans/upload')
        .field('user_id', '1')
        .field('latitude', '13.06015')
        .field('longitude', '80.24286')
        .attach('images', fakeImage, { filename: 'test.jpg', contentType: 'image/jpeg' });

      // Fails at image validation, not at lat/long parsing
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('not a valid image');
    });
  });
});
