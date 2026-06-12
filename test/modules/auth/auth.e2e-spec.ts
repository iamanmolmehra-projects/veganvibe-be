import request from 'supertest';

import { APP_URL } from '../../utils/constants';

describe('Auth Module (e2e)', () => {
  const app = APP_URL;

  const signupDto = {
    name: 'Test User E2E',
    dob: '15/08/1995',
    location: 'Mumbai',
    email: `test-auth-${Date.now()}@example.com`,
    phone: '9876543210',
    password: 'TestPass@123',
  };

  describe('POST /api/v1/auth/signup', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(signupDto)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('userId');
      expect(typeof response.body.userId).toBe('number');
    });

    it('should return 409 when email already exists', async () => {
      await request(app)
        .post('/api/v1/auth/signup')
        .send(signupDto)
        .expect(409);
    });

    it('should return 422 when name is missing', async () => {
      const { name, ...dto } = signupDto;
      await request(app)
        .post('/api/v1/auth/signup')
        .send({ ...dto, email: `no-name-${Date.now()}@example.com` })
        .expect(422);
    });

    it('should return 422 when email is invalid', async () => {
      await request(app)
        .post('/api/v1/auth/signup')
        .send({ ...signupDto, email: 'not-an-email' })
        .expect(422);
    });

    it('should return 422 when password is too short', async () => {
      await request(app)
        .post('/api/v1/auth/signup')
        .send({ ...signupDto, email: `short-${Date.now()}@example.com`, password: '12345' })
        .expect(422);
    });

    it('should return 422 when dob is missing', async () => {
      const { dob, ...dto } = signupDto;
      await request(app)
        .post('/api/v1/auth/signup')
        .send({ ...dto, email: `no-dob-${Date.now()}@example.com` })
        .expect(422);
    });

    it('should return 422 when phone is missing', async () => {
      const { phone, ...dto } = signupDto;
      await request(app)
        .post('/api/v1/auth/signup')
        .send({ ...dto, email: `no-phone-${Date.now()}@example.com` })
        .expect(422);
    });

    it('should return 422 when location is missing', async () => {
      const { location, ...dto } = signupDto;
      await request(app)
        .post('/api/v1/auth/signup')
        .send({ ...dto, email: `no-loc-${Date.now()}@example.com` })
        .expect(422);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: signupDto.email, password: signupDto.password })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.split('.')).toHaveLength(3);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('userId');
      expect(response.body.user).toHaveProperty('name', signupDto.name);
      expect(response.body.user).toHaveProperty('email', signupDto.email);
      expect(response.body.user).toHaveProperty('roleId', 2);
    });

    it('should return 401 when email does not exist', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'SomePass123' })
        .expect(401);
    });

    it('should return 401 when password is incorrect', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: signupDto.email, password: 'WrongPassword123' })
        .expect(401);
    });

    it('should return 422 when email is missing', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ password: 'SomePass123' })
        .expect(422);
    });

    it('should return 422 when password is missing', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: signupDto.email })
        .expect(422);
    });

    it('should return 422 when email format is invalid', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'not-valid', password: 'SomePass123' })
        .expect(422);
    });
  });
});
