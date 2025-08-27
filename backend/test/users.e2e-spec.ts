import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TestUtils } from './test-utils';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let studentToken: string;
  let adminToken: string;
  let sponsorToken: string;
  let studentUserId: string;
  let adminUserId: string;
  let sponsorUserId: string;

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
  });

  afterAll(async () => {
    await TestUtils.cleanDatabase(prisma);
    await app.close();
  });

  describe('/users/profile (GET)', () => {
    it('should get user profile for authenticated student', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: studentUserId,
        email: 'student@test.com',
        role: 'STUDENT',
      });
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).toHaveProperty('profile');
    });

    it('should get user profile for authenticated sponsor', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${sponsorToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: sponsorUserId,
        role: 'SPONSOR',
      });
      expect(response.body).toHaveProperty('sponsor');
    });

    it('should not get profile without authentication', async () => {
      await request(app.getHttpServer())
        .get('/users/profile')
        .expect(401);
    });
  });

  describe('/users (GET)', () => {
    it('should get all users for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(3); // student, admin, sponsor
      expect(response.body).toHaveProperty('pagination');
    });

    it('should filter users by role', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?role=STUDENT')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].role).toBe('STUDENT');
    });

    it('should paginate users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 2,
      });
    });

    it('should not allow student to access all users', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('should not allow sponsor to access all users', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${sponsorToken}`)
        .expect(403);
    });
  });

  describe('/users/:id (GET)', () => {
    it('should get user by id for admin', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${studentUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: studentUserId,
        email: 'student@test.com',
        role: 'STUDENT',
      });
    });

    it('should not allow student to get other users', async () => {
      await request(app.getHttpServer())
        .get(`/users/${adminUserId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .get('/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('/users/:id (PUT)', () => {
    it('should update user profile', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${studentUserId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        firstName: 'Updated',
        lastName: 'Name',
      });

      // Verify in database - check profile instead
      const profile = await prisma.profile.findFirst({
        where: { userId: studentUserId },
      });
      expect(profile.firstName).toBe('Updated');
      expect(profile.lastName).toBe('Name');
    });

    it('should not allow updating other users profile', async () => {
      const updateData = {
        firstName: 'Hacker',
        lastName: 'Attempt',
      };

      await request(app.getHttpServer())
        .put(`/users/${adminUserId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should not allow updating email', async () => {
      const updateData = {
        email: 'newemail@test.com',
      };

      await request(app.getHttpServer())
        .put(`/users/${studentUserId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData)
        .expect(400);
    });

    it('should not allow updating role', async () => {
      const updateData = {
        role: 'ADMIN',
      };

      await request(app.getHttpServer())
        .put(`/users/${studentUserId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData)
        .expect(400);
    });
  });

  describe('/users/:id/activate (PATCH)', () => {
    beforeEach(async () => {
      // Deactivate user first
      await prisma.user.update({
        where: { id: studentUserId },
        data: { isActive: false },
      });
    });

    it('should activate user as admin', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${studentUserId}/activate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.isActive).toBe(true);

      // Verify in database
      const user = await prisma.user.findUnique({
        where: { id: studentUserId },
      });
      expect(user.isActive).toBe(true);
    });

    it('should not allow student to activate users', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${studentUserId}/activate`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('/users/:id/deactivate (PATCH)', () => {
    it('should deactivate user as admin', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${studentUserId}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.isActive).toBe(false);

      // Verify in database
      const user = await prisma.user.findUnique({
        where: { id: studentUserId },
      });
      expect(user.isActive).toBe(false);
    });

    it('should not allow student to deactivate users', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${studentUserId}/deactivate`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('/users/:id/change-password (PATCH)', () => {
    it('should change password with correct current password', async () => {
      const changePasswordData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123',
      };

      await request(app.getHttpServer())
        .patch(`/users/${studentUserId}/change-password`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(changePasswordData)
        .expect(200);

      // Try logging in with new password
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'student@test.com',
          password: 'newpassword123',
        })
        .expect(200);

      // Try logging in with old password (should fail)
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'student@test.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should not change password with incorrect current password', async () => {
      const changePasswordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      };

      await request(app.getHttpServer())
        .patch(`/users/${studentUserId}/change-password`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(changePasswordData)
        .expect(400);
    });

    it('should not allow changing other users password', async () => {
      const changePasswordData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123',
      };

      await request(app.getHttpServer())
        .patch(`/users/${adminUserId}/change-password`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(changePasswordData)
        .expect(403);
    });

    it('should validate new password strength', async () => {
      const changePasswordData = {
        currentPassword: 'password123',
        newPassword: '123', // too weak
      };

      await request(app.getHttpServer())
        .patch(`/users/${studentUserId}/change-password`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(changePasswordData)
        .expect(400);
    });
  });
});