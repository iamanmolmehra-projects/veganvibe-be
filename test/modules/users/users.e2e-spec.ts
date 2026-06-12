import request from 'supertest';

import { APP_URL } from '../../utils/constants';

describe('Users Module (e2e)', () => {
  const app = APP_URL;
  let createdUserId: number;

  const createUserDto = {
    name: 'E2E Test User',
    phone: '+919999999999',
    dob: 946684800,
    location: 'Delhi, India',
    email: `e2e-user-${Date.now()}@example.com`,
    password: 'Secret@123',
    role: { id: 2 },
  };

  describe('POST /api/v1/users', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', createUserDto.name);
      expect(response.body).toHaveProperty('email', createUserDto.email);
      expect(response.body).not.toHaveProperty('password');
      createdUserId = response.body.id;
    });

    it('should return 409 for duplicate email', async () => {
      await request(app)
        .post('/api/v1/users')
        .send(createUserDto)
        .expect(409);
    });

    it('should return 422 when name is missing', async () => {
      const { name, ...dto } = createUserDto;
      await request(app)
        .post('/api/v1/users')
        .send({ ...dto, email: `no-name-${Date.now()}@example.com` })
        .expect(422);
    });

    it('should return 422 when email is invalid', async () => {
      await request(app)
        .post('/api/v1/users')
        .send({ ...createUserDto, email: 'invalid' })
        .expect(422);
    });

    it('should return 422 when password is too short', async () => {
      await request(app)
        .post('/api/v1/users')
        .send({ ...createUserDto, email: `short-${Date.now()}@example.com`, password: '12' })
        .expect(422);
    });

    it('should create user with minimal fields', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({ name: 'Min', email: `min-${Date.now()}@example.com`, password: 'Secret@123' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });
  });

  describe('GET /api/v1/users', () => {
    it('should return paginated users', async () => {
      const response = await request(app).get('/api/v1/users').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('hasNextPage');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should respect pagination', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .query({ page: 1, limit: 2 })
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should return user by id', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${createdUserId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdUserId);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      await request(app).get('/api/v1/users/99999').expect(404);
    });
  });

  describe('PATCH /api/v1/users/:id', () => {
    it('should update user name', async () => {
      const response = await request(app)
        .patch(`/api/v1/users/${createdUserId}`)
        .send({ name: 'Updated' })
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Updated');
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .patch('/api/v1/users/99999')
        .send({ name: 'Ghost' })
        .expect(404);
    });

    it('should return 422 for invalid email', async () => {
      await request(app)
        .patch(`/api/v1/users/${createdUserId}`)
        .send({ email: 'bad' })
        .expect(422);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete a user', async () => {
      await request(app).delete(`/api/v1/users/${createdUserId}`).expect(204);
    });

    it('should return 404 for deleted user', async () => {
      await request(app).delete(`/api/v1/users/${createdUserId}`).expect(404);
    });
  });
});
