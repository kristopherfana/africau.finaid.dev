import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TestUtils } from './test-utils';

describe('ScholarshipsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let studentToken: string;
  let adminToken: string;
  let sponsorToken: string;
  let studentUserId: string;
  let adminUserId: string;
  let sponsorUserId: string;
  let testScholarshipId: string;

  beforeAll(async () => {
    app = await TestUtils.createTestApp();
    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await TestUtils.cleanDatabase(prisma);

    // Create test users
    const studentUser = await TestUtils.createTestUser(prisma, {
      email: 'student@test.com',
      password: 'password123',
      firstName: 'Student',
      lastName: 'User',
      role: 'STUDENT',
    });
    studentUserId = studentUser.id;

    const adminUser = await TestUtils.createTestUser(prisma, {
      email: 'admin@test.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    });
    adminUserId = adminUser.id;

    const sponsorUser = await TestUtils.createTestUser(prisma, {
      email: 'sponsor@test.com',
      password: 'password123',
      firstName: 'Sponsor',
      lastName: 'User',
      role: 'SPONSOR',
    });
    sponsorUserId = sponsorUser.id;

    // Get auth tokens
    const studentLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'student@test.com', password: 'password123' });
    studentToken = studentLoginResponse.body.access_token;

    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    adminToken = adminLoginResponse.body.access_token;

    const sponsorLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'sponsor@test.com', password: 'password123' });
    sponsorToken = sponsorLoginResponse.body.access_token;

    // Create a test scholarship
    const testScholarship = await TestUtils.createTestScholarship(
      prisma,
      sponsorUserId,
      {
        name: 'Test Merit Scholarship',
        description: 'A test scholarship for merit students',
        amount: 15000,
        availableSlots: 10,
      }
    );
    testScholarshipId = testScholarship.id;
  });

  afterAll(async () => {
    await TestUtils.cleanDatabase(prisma);
    await app.close();
  });

  describe('/scholarships (GET)', () => {
    beforeEach(async () => {
      // Create additional scholarships for testing
      await TestUtils.createTestScholarship(prisma, sponsorUserId, {
        name: 'Research Grant',
        amount: 20000,
      });

      await TestUtils.createTestScholarship(prisma, sponsorUserId, {
        name: 'Sports Scholarship',
        amount: 12000,
      });
    });

    it('should get all scholarships for any authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/scholarships')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(3);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('amount');
      expect(response.body.data[0]).toHaveProperty('sponsor');
    });

    it('should filter scholarships by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/scholarships?category=MERIT')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0]).toHaveProperty('name');
    });

    it('should filter scholarships by level', async () => {
      const response = await request(app.getHttpServer())
        .get('/scholarships?level=MASTERS')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0]).toHaveProperty('name');
    });

    it('should search scholarships by title', async () => {
      const response = await request(app.getHttpServer())
        .get('/scholarships?search=Research')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toContain('Research');
    });

    it('should paginate scholarships', async () => {
      const response = await request(app.getHttpServer())
        .get('/scholarships?page=1&limit=2')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 2,
      });
    });

    it('should not allow unauthenticated access', async () => {
      await request(app.getHttpServer())
        .get('/scholarships')
        .expect(401);
    });
  });

  describe('/scholarships/:id (GET)', () => {
    it('should get scholarship by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/scholarships/${testScholarshipId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testScholarshipId,
        name: 'Test Merit Scholarship',
        amount: 15000,
      });
      expect(response.body).toHaveProperty('sponsor');
      expect(response.body).toHaveProperty('_count');
    });

    it('should return 404 for non-existent scholarship', async () => {
      await request(app.getHttpServer())
        .get('/scholarships/non-existent-id')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });
  });

  describe('/scholarships (POST)', () => {
    const createScholarshipDto = {
      name: 'New Test Scholarship',
      description: 'A new scholarship for testing',
      amount: 25000,
      totalSlots: 5,
      availableSlots: 5,
      applicationEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
    };

    it('should create scholarship as sponsor', async () => {
      const response = await request(app.getHttpServer())
        .post('/scholarships')
        .set('Authorization', `Bearer ${sponsorToken}`)
        .send(createScholarshipDto)
        .expect(201);

      expect(response.body).toMatchObject({
        name: createScholarshipDto.name,
        amount: createScholarshipDto.amount,
      });

      // Verify in database
      const scholarship = await prisma.scholarship.findUnique({
        where: { id: response.body.id },
      });
      expect(scholarship).toBeTruthy();
    });

    it('should create scholarship as admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/scholarships')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createScholarshipDto)
        .expect(201);

      expect(response.body.name).toBe(createScholarshipDto.name);
    });

    it('should not allow student to create scholarship', async () => {
      await request(app.getHttpServer())
        .post('/scholarships')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(createScholarshipDto)
        .expect(403);
    });

    it('should validate required fields', async () => {
      const invalidDto = {
        name: '',
        amount: -1000,
        totalSlots: 0,
      };

      await request(app.getHttpServer())
        .post('/scholarships')
        .set('Authorization', `Bearer ${sponsorToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should validate future application deadline', async () => {
      const invalidDto = {
        ...createScholarshipDto,
        applicationEndDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // yesterday
      };

      await request(app.getHttpServer())
        .post('/scholarships')
        .set('Authorization', `Bearer ${sponsorToken}`)
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/scholarships/:id (PUT)', () => {
    const updateScholarshipDto = {
      name: 'Updated Test Scholarship',
      description: 'Updated description',
      amount: 30000,
      availableSlots: 15,
    };

    it('should update scholarship as sponsor owner', async () => {
      const response = await request(app.getHttpServer())
        .put(`/scholarships/${testScholarshipId}`)
        .set('Authorization', `Bearer ${sponsorToken}`)
        .send(updateScholarshipDto)
        .expect(200);

      expect(response.body.name).toBe(updateScholarshipDto.name);
      expect(response.body.amount).toBe(updateScholarshipDto.amount);
    });

    it('should update scholarship as admin', async () => {
      const response = await request(app.getHttpServer())
        .put(`/scholarships/${testScholarshipId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateScholarshipDto)
        .expect(200);

      expect(response.body.name).toBe(updateScholarshipDto.name);
    });

    it('should not allow student to update scholarship', async () => {
      await request(app.getHttpServer())
        .put(`/scholarships/${testScholarshipId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateScholarshipDto)
        .expect(403);
    });

    it('should not allow sponsor to update other sponsors scholarship', async () => {
      // Create another sponsor
      const anotherSponsor = await TestUtils.createTestUser(prisma, {
        email: 'another@sponsor.com',
        password: 'password123',
        firstName: 'Another',
        lastName: 'Sponsor',
        role: 'SPONSOR',
      });

      const anotherSponsorLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'another@sponsor.com', password: 'password123' });
      const anotherSponsorToken = anotherSponsorLogin.body.access_token;

      await request(app.getHttpServer())
        .put(`/scholarships/${testScholarshipId}`)
        .set('Authorization', `Bearer ${anotherSponsorToken}`)
        .send(updateScholarshipDto)
        .expect(403);
    });
  });

  describe('/scholarships/:id (DELETE)', () => {
    it('should delete scholarship as sponsor owner', async () => {
      await request(app.getHttpServer())
        .delete(`/scholarships/${testScholarshipId}`)
        .set('Authorization', `Bearer ${sponsorToken}`)
        .expect(200);

      // Verify deletion in database
      const scholarship = await prisma.scholarship.findUnique({
        where: { id: testScholarshipId },
      });
      expect(scholarship).toBeNull();
    });

    it('should delete scholarship as admin', async () => {
      await request(app.getHttpServer())
        .delete(`/scholarships/${testScholarshipId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should not allow student to delete scholarship', async () => {
      await request(app.getHttpServer())
        .delete(`/scholarships/${testScholarshipId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('should not delete scholarship with active applications', async () => {
      // Create an application first
      await TestUtils.createTestApplication(
        prisma,
        studentUserId,
        testScholarshipId,
        { status: 'SUBMITTED' }
      );

      await request(app.getHttpServer())
        .delete(`/scholarships/${testScholarshipId}`)
        .set('Authorization', `Bearer ${sponsorToken}`)
        .expect(400);
    });
  });

  describe('Scholarship Application Counts', () => {
    beforeEach(async () => {
      // Create some applications
      await TestUtils.createTestApplication(
        prisma,
        studentUserId,
        testScholarshipId,
        { status: 'SUBMITTED' }
      );
    });

    it('should include application count in scholarship response', async () => {
      const response = await request(app.getHttpServer())
        .get(`/scholarships/${testScholarshipId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body._count).toHaveProperty('applications');
      expect(response.body._count.applications).toBe(1);
    });

    it('should show correct remaining slots', async () => {
      const response = await request(app.getHttpServer())
        .get(`/scholarships/${testScholarshipId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      const remainingSlots = response.body.availableSlots - response.body._count.applications;
      expect(remainingSlots).toBe(9); // 10 total - 1 application
    });
  });
});