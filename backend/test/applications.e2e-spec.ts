import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TestUtils } from './test-utils';

describe('ApplicationsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let studentToken: string;
  let adminToken: string;
  let sponsorToken: string;
  let student2Token: string;
  let studentUserId: string;
  let student2UserId: string;
  let adminUserId: string;
  let sponsorUserId: string;
  let testScholarshipId: string;
  let testApplicationId: string;

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

    const student2User = await TestUtils.createTestUser(prisma, {
      email: 'student2@test.com',
      password: 'password123',
      firstName: 'Student2',
      lastName: 'User',
      role: 'STUDENT',
    });
    student2UserId = student2User.id;

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

    const student2LoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'student2@test.com', password: 'password123' });
    student2Token = student2LoginResponse.body.access_token;

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
        availableSlots: 5,
      }
    );
    testScholarshipId = testScholarship.id;

    // Create a test application
    const testApplication = await TestUtils.createTestApplication(
      prisma,
      studentUserId,
      testScholarshipId,
      {
        status: 'DRAFT',
        personalStatement: 'Test personal statement',
        gpa: 3.8,
      }
    );
    testApplicationId = testApplication.id;
  });

  afterAll(async () => {
    await TestUtils.cleanDatabase(prisma);
    await app.close();
  });

  describe('/applications (GET)', () => {
    beforeEach(async () => {
      // Create additional applications for testing
      await TestUtils.createTestApplication(
        prisma,
        student2UserId,
        testScholarshipId,
        { status: 'SUBMITTED' }
      );
    });

    it('should get all applications for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/applications')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data[0]).toHaveProperty('scholarship');
      expect(response.body.data[0]).toHaveProperty('user');
    });

    it('should get applications for sponsor (only their scholarships)', async () => {
      const response = await request(app.getHttpServer())
        .get('/applications')
        .set('Authorization', `Bearer ${sponsorToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(2);
      // All applications should be for scholarships
      response.body.data.forEach(app => {
        expect(app.scholarship).toBeTruthy();
      });
    });

    it('should get only own applications for student', async () => {
      const response = await request(app.getHttpServer())
        .get('/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].userId).toBe(studentUserId);
    });

    it('should filter applications by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/applications?status=DRAFT')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].status).toBe('DRAFT');
    });

    it('should filter applications by scholarship', async () => {
      const response = await request(app.getHttpServer())
        .get(`/applications?scholarshipId=${testScholarshipId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(2);
      response.body.data.forEach(app => {
        expect(app.scholarshipId).toBe(testScholarshipId);
      });
    });
  });

  describe('/applications/:id (GET)', () => {
    it('should get application by id for student owner', async () => {
      const response = await request(app.getHttpServer())
        .get(`/applications/${testApplicationId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testApplicationId,
        userId: studentUserId,
        scholarshipId: testScholarshipId,
        status: 'DRAFT',
      });
      expect(response.body).toHaveProperty('scholarship');
      expect(response.body).toHaveProperty('user');
    });

    it('should get application by id for admin', async () => {
      const response = await request(app.getHttpServer())
        .get(`/applications/${testApplicationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(testApplicationId);
    });

    it('should get application by id for sponsor of scholarship', async () => {
      const response = await request(app.getHttpServer())
        .get(`/applications/${testApplicationId}`)
        .set('Authorization', `Bearer ${sponsorToken}`)
        .expect(200);

      expect(response.body.id).toBe(testApplicationId);
    });

    it('should not allow student to access other students applications', async () => {
      await request(app.getHttpServer())
        .get(`/applications/${testApplicationId}`)
        .set('Authorization', `Bearer ${student2Token}`)
        .expect(403);
    });

    it('should return 404 for non-existent application', async () => {
      await request(app.getHttpServer())
        .get('/applications/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('/applications (POST)', () => {
    const createApplicationDto = {
      scholarshipId: '', // Will be set in tests
      motivationLetter: 'This is my motivation letter for the scholarship application.',
      additionalInfo: JSON.stringify({
        extracurricularActivities: ['Student Council', 'Debate Club'],
        workExperience: ['Intern at Tech Company']
      }),
    };

    beforeEach(() => {
      createApplicationDto.scholarshipId = testScholarshipId;
    });

    it('should create application as student', async () => {
      // Create another scholarship to test with
      const anotherScholarship = await TestUtils.createTestScholarship(
        prisma,
        sponsorUserId,
        { name: 'Another Test Scholarship' }
      );

      createApplicationDto.scholarshipId = anotherScholarship.id;

      const response = await request(app.getHttpServer())
        .post('/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(createApplicationDto)
        .expect(201);

      expect(response.body).toMatchObject({
        scholarshipId: anotherScholarship.id,
        userId: studentUserId,
        status: 'DRAFT',
        motivationLetter: createApplicationDto.motivationLetter,
      });
      expect(response.body).toHaveProperty('applicationNumber');
    });

    it('should not allow duplicate applications', async () => {
      await request(app.getHttpServer())
        .post('/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(createApplicationDto)
        .expect(409); // Already has application for this scholarship
    });

    it('should not allow sponsor to create applications', async () => {
      await request(app.getHttpServer())
        .post('/applications')
        .set('Authorization', `Bearer ${sponsorToken}`)
        .send(createApplicationDto)
        .expect(403);
    });

    it('should validate required fields', async () => {
      const invalidDto = {
        scholarshipId: testScholarshipId,
        motivationLetter: '', // empty
      };

      await request(app.getHttpServer())
        .post('/applications')
        .set('Authorization', `Bearer ${student2Token}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should not allow application to non-existent scholarship', async () => {
      createApplicationDto.scholarshipId = 'non-existent-id';

      await request(app.getHttpServer())
        .post('/applications')
        .set('Authorization', `Bearer ${student2Token}`)
        .send(createApplicationDto)
        .expect(404);
    });
  });

  describe('/applications/:id (PUT)', () => {
    const updateApplicationDto = {
      motivationLetter: 'Updated motivation letter',
      additionalInfo: JSON.stringify({
        extracurricularActivities: ['Updated Activity'],
        workExperience: ['Updated Experience']
      }),
    };

    it('should update draft application as student owner', async () => {
      const response = await request(app.getHttpServer())
        .put(`/applications/${testApplicationId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateApplicationDto)
        .expect(200);

      expect(response.body.motivationLetter).toBe(updateApplicationDto.motivationLetter);
    });

    it('should not allow updating submitted application', async () => {
      // Submit the application first
      await prisma.application.update({
        where: { id: testApplicationId },
        data: { status: 'SUBMITTED', submittedAt: new Date() },
      });

      await request(app.getHttpServer())
        .put(`/applications/${testApplicationId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateApplicationDto)
        .expect(400);
    });

    it('should not allow student to update other students applications', async () => {
      await request(app.getHttpServer())
        .put(`/applications/${testApplicationId}`)
        .set('Authorization', `Bearer ${student2Token}`)
        .send(updateApplicationDto)
        .expect(403);
    });

    it('should not allow sponsor to update applications', async () => {
      await request(app.getHttpServer())
        .put(`/applications/${testApplicationId}`)
        .set('Authorization', `Bearer ${sponsorToken}`)
        .send(updateApplicationDto)
        .expect(403);
    });
  });

  describe('/applications/:id/submit (POST)', () => {
    it('should submit draft application as student owner', async () => {
      const response = await request(app.getHttpServer())
        .post(`/applications/${testApplicationId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.status).toBe('SUBMITTED');
      expect(response.body.submittedAt).toBeTruthy();

      // Verify in database
      const application = await prisma.application.findUnique({
        where: { id: testApplicationId },
      });
      expect(application.status).toBe('SUBMITTED');
    });

    it('should not submit already submitted application', async () => {
      // Submit first
      await request(app.getHttpServer())
        .post(`/applications/${testApplicationId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`);

      // Try to submit again
      await request(app.getHttpServer())
        .post(`/applications/${testApplicationId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(400);
    });

    it('should not allow others to submit application', async () => {
      await request(app.getHttpServer())
        .post(`/applications/${testApplicationId}/submit`)
        .set('Authorization', `Bearer ${student2Token}`)
        .expect(403);
    });
  });

  describe('/applications/:id/withdraw (POST)', () => {
    beforeEach(async () => {
      // Submit the application first
      await prisma.application.update({
        where: { id: testApplicationId },
        data: { status: 'SUBMITTED', submittedAt: new Date() },
      });
    });

    it('should withdraw submitted application as student owner', async () => {
      const response = await request(app.getHttpServer())
        .post(`/applications/${testApplicationId}/withdraw`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.status).toBe('WITHDRAWN');

      // Verify in database
      const application = await prisma.application.findUnique({
        where: { id: testApplicationId },
      });
      expect(application.status).toBe('WITHDRAWN');
    });

    it('should not withdraw draft application', async () => {
      // Set back to draft
      await prisma.application.update({
        where: { id: testApplicationId },
        data: { status: 'DRAFT', submittedAt: null },
      });

      await request(app.getHttpServer())
        .post(`/applications/${testApplicationId}/withdraw`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(400);
    });

    it('should not withdraw approved application', async () => {
      // Set to approved
      await prisma.application.update({
        where: { id: testApplicationId },
        data: { status: 'APPROVED' },
      });

      await request(app.getHttpServer())
        .post(`/applications/${testApplicationId}/withdraw`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(400);
    });
  });

  describe('/applications/:id/status (PATCH)', () => {
    beforeEach(async () => {
      // Submit the application first
      await prisma.application.update({
        where: { id: testApplicationId },
        data: { status: 'SUBMITTED', submittedAt: new Date() },
      });
    });

    it('should update application status as admin', async () => {
      const updateStatusDto = {
        status: 'APPROVED',
        reason: 'Excellent qualifications',
      };

      const response = await request(app.getHttpServer())
        .patch(`/applications/${testApplicationId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateStatusDto)
        .expect(200);

      expect(response.body.status).toBe('APPROVED');
      expect(response.body.decisionNotes).toBe(updateStatusDto.reason);
    });

    it('should update application status as sponsor of scholarship', async () => {
      const updateStatusDto = {
        status: 'REJECTED',
        reason: 'Does not meet minimum requirements',
      };

      const response = await request(app.getHttpServer())
        .patch(`/applications/${testApplicationId}/status`)
        .set('Authorization', `Bearer ${sponsorToken}`)
        .send(updateStatusDto)
        .expect(200);

      expect(response.body.status).toBe('REJECTED');
    });

    it('should not allow student to update application status', async () => {
      const updateStatusDto = {
        status: 'APPROVED',
      };

      await request(app.getHttpServer())
        .patch(`/applications/${testApplicationId}/status`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateStatusDto)
        .expect(403);
    });

    it('should validate status transitions', async () => {
      const updateStatusDto = {
        status: 'INVALID_STATUS',
      };

      await request(app.getHttpServer())
        .patch(`/applications/${testApplicationId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateStatusDto)
        .expect(400);
    });

    it('should not update status of withdrawn application', async () => {
      // Withdraw first
      await prisma.application.update({
        where: { id: testApplicationId },
        data: { status: 'WITHDRAWN' },
      });

      const updateStatusDto = {
        status: 'APPROVED',
      };

      await request(app.getHttpServer())
        .patch(`/applications/${testApplicationId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateStatusDto)
        .expect(400);
    });
  });

  describe('Application Scoring', () => {
    beforeEach(async () => {
      await prisma.application.update({
        where: { id: testApplicationId },
        data: { status: 'UNDER_REVIEW' },
      });
    });

    it('should allow admin to add score to application', async () => {
      const updateStatusDto = {
        status: 'APPROVED',
        score: 85,
        reason: 'Good overall application',
      };

      const response = await request(app.getHttpServer())
        .patch(`/applications/${testApplicationId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateStatusDto)
        .expect(200);

      expect(response.body.score).toBe(85);
    });

    it('should validate score range', async () => {
      const updateStatusDto = {
        status: 'APPROVED',
        score: 150, // Invalid score > 100
      };

      await request(app.getHttpServer())
        .patch(`/applications/${testApplicationId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateStatusDto)
        .expect(400);
    });
  });
});