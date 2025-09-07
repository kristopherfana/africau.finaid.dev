#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

/**
 * Test Database Setup Script
 * 
 * This script sets up the test database for running tests
 */

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function colorize(text: string, color: keyof typeof COLORS): string {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function log(message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') {
  const levelColors = {
    info: 'blue',
    success: 'green',
    warning: 'yellow',
    error: 'red',
  };
  
  const prefix = {
    info: 'ℹ️ ',
    success: '✅',
    warning: '⚠️ ',
    error: '❌',
  };
  
  console.log(colorize(`${prefix[level]} ${message}`, levelColors[level] as keyof typeof COLORS));
}

class TestDatabaseSetup {
  private testEnvPath: string;
  private testDbPath: string;
  private backupDbPath: string;
  
  constructor() {
    this.testEnvPath = path.join(process.cwd(), '.env.test');
    this.testDbPath = path.join(process.cwd(), 'prisma', 'test.db');
    this.backupDbPath = path.join(process.cwd(), 'prisma', 'test.db.backup');
  }
  
  async setup() {
    log('Setting up test database...', 'info');
    
    try {
      // Step 1: Load test environment
      this.loadTestEnvironment();
      
      // Step 2: Backup existing test database if it exists
      this.backupExistingDatabase();
      
      // Step 3: Create fresh test database
      this.createTestDatabase();
      
      // Step 4: Run migrations
      this.runMigrations();
      
      // Step 5: Seed test data (optional)
      await this.seedTestData();
      
      log('Test database setup completed successfully!', 'success');
      
    } catch (error) {
      log(`Failed to setup test database: ${error.message}`, 'error');
      process.exit(1);
    }
  }
  
  private loadTestEnvironment() {
    log('Loading test environment variables...', 'info');
    
    if (!fs.existsSync(this.testEnvPath)) {
      log('.env.test file not found, creating from example...', 'warning');
      
      const exampleEnvPath = path.join(process.cwd(), '.env.example');
      if (fs.existsSync(exampleEnvPath)) {
        const content = fs.readFileSync(exampleEnvPath, 'utf8');
        const testContent = content
          .replace(/DATABASE_URL=".*"/, 'DATABASE_URL="file:./prisma/test.db"')
          .replace(/NODE_ENV=".*"/, 'NODE_ENV="test"')
          .replace(/PORT=\d+/, 'PORT=3001');
        fs.writeFileSync(this.testEnvPath, testContent);
      } else {
        // Create minimal .env.test
        fs.writeFileSync(this.testEnvPath, `
DATABASE_URL="file:./prisma/test.db"
JWT_SECRET="test-jwt-secret"
NODE_ENV="test"
PORT=3001
        `.trim());
      }
    }
    
    // Load environment variables
    dotenv.config({ path: this.testEnvPath });
    process.env.DATABASE_URL = 'file:./prisma/test.db';
    
    log('Test environment loaded', 'success');
  }
  
  private backupExistingDatabase() {
    if (fs.existsSync(this.testDbPath)) {
      log('Backing up existing test database...', 'info');
      
      try {
        fs.copyFileSync(this.testDbPath, this.backupDbPath);
        log('Existing database backed up', 'success');
      } catch (error) {
        log('Failed to backup database, continuing...', 'warning');
      }
      
      // Remove existing database
      fs.unlinkSync(this.testDbPath);
      
      // Also remove journal file if it exists
      const journalPath = `${this.testDbPath}-journal`;
      if (fs.existsSync(journalPath)) {
        fs.unlinkSync(journalPath);
      }
    }
  }
  
  private createTestDatabase() {
    log('Creating fresh test database...', 'info');
    
    try {
      // Use Prisma to create the database schema
      execSync('npx prisma db push --force-reset --skip-generate', {
        stdio: 'pipe',
        env: {
          ...process.env,
          DATABASE_URL: 'file:./prisma/test.db',
        },
      });
      
      log('Test database created', 'success');
    } catch (error) {
      throw new Error(`Failed to create database: ${error.message}`);
    }
  }
  
  private runMigrations() {
    log('Running database migrations...', 'info');
    
    try {
      // Generate Prisma Client
      execSync('npx prisma generate', {
        stdio: 'pipe',
        env: {
          ...process.env,
          DATABASE_URL: 'file:./prisma/test.db',
        },
      });
      
      log('Migrations completed', 'success');
    } catch (error) {
      throw new Error(`Failed to run migrations: ${error.message}`);
    }
  }
  
  private async seedTestData() {
    log('Seeding test data...', 'info');
    
    try {
      // Import PrismaClient dynamically
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: 'file:./prisma/test.db',
          },
        },
      });
      
      // Create default admin user
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@test.com',
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
        },
      });
      
      // Create admin profile
      const adminProfile = await prisma.profile.create({
        data: {
          userId: adminUser.id,
          firstName: 'Test',
          lastName: 'Admin',
          phone: '+1234567890',
          address: '123 Admin Street',
        },
      });

      // Create admin-specific profile
      await prisma.adminProfile.create({
        data: {
          profileId: adminProfile.id,
          permissions: JSON.stringify(['USER_MANAGEMENT', 'SCHOLARSHIP_MANAGEMENT']),
          managedDepartments: JSON.stringify(['Engineering', 'Computer Science']),
          accessLevel: 'STANDARD',
          lastLogin: new Date(),
        },
      });
      
      // Create test sponsor
      const sponsor = await prisma.sponsor.create({
        data: {
          name: 'Test Foundation',
          type: 'ORGANIZATION',
          contactPerson: 'Test Sponsor',
          email: 'sponsor@test.com',
          phone: '+1234567890',
          website: 'https://test.com',
          address: 'Test Address',
        },
      });
      
      // Create sponsor user
      const sponsorUser = await prisma.user.create({
        data: {
          email: 'sponsor@test.com',
          password: await bcrypt.hash('sponsor123', 10),
          role: 'SPONSOR',
          isActive: true,
        },
      });
      
      const sponsorProfile = await prisma.profile.create({
        data: {
          userId: sponsorUser.id,
          firstName: 'Test',
          lastName: 'Sponsor',
          phone: '+1234567890',
          address: '123 Sponsor Street',
        },
      });

      // Create sponsor-specific profile
      await prisma.sponsorProfile.create({
        data: {
          profileId: sponsorProfile.id,
          organizationName: 'Test Foundation',
          position: 'Director',
          sponsorType: 'ORGANIZATION',
          totalContributed: 50000,
          preferredCauses: JSON.stringify(['STEM', 'Education']),
          isVerified: true,
        },
      });
      
      // Create test student user with profile
      const studentUser = await prisma.user.create({
        data: {
          email: 'student@test.com',
          password: await bcrypt.hash('student123', 10),
          role: 'STUDENT',
          isActive: true,
        },
      });
      
      const studentProfile = await prisma.profile.create({
        data: {
          userId: studentUser.id,
          firstName: 'Test',
          lastName: 'Student',
          phone: '+1234567890',
          address: '123 Test Street',
          dateOfBirth: new Date('2000-01-01'),
          gender: 'MALE',
          nationality: 'Test Country',
        },
      });

      // Create student-specific profile
      await prisma.studentProfile.create({
        data: {
          profileId: studentProfile.id,
          studentId: 'STU001',
          program: 'Computer Science',
          level: 'UNDERGRADUATE',
          yearOfStudy: 3,
          gpa: 3.5,
          institution: 'Test University',
          expectedGraduation: new Date('2025-06-01'),
        },
      });
      
      // Create a test scholarship
      if (sponsor) {
        await prisma.scholarship.create({
          data: {
            sponsorId: sponsor.id,
            name: 'Test Scholarship',
            description: 'A test scholarship for testing purposes',
            amount: 10000,
            currency: 'USD',
            totalSlots: 10,
            availableSlots: 10,
            applicationStartDate: new Date(),
            applicationEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            academicYear: '2025-2026',
            durationMonths: 12,
            disbursementSchedule: 'SEMESTER',
            status: 'ACTIVE',
            createdBy: adminUser.id,
          },
        });
      }
      
      await prisma.$disconnect();
      
      log('Test data seeded successfully', 'success');
      
    } catch (error) {
      log(`Warning: Could not seed test data: ${error.message}`, 'warning');
      // Don't fail setup if seeding fails
    }
  }
  
  async cleanup() {
    log('Cleaning up test database...', 'info');
    
    try {
      // Remove test database
      if (fs.existsSync(this.testDbPath)) {
        fs.unlinkSync(this.testDbPath);
      }
      
      // Remove journal file
      const journalPath = `${this.testDbPath}-journal`;
      if (fs.existsSync(journalPath)) {
        fs.unlinkSync(journalPath);
      }
      
      log('Test database cleaned up', 'success');
      
    } catch (error) {
      log(`Failed to cleanup: ${error.message}`, 'error');
    }
  }
  
  async restore() {
    log('Restoring test database from backup...', 'info');
    
    if (fs.existsSync(this.backupDbPath)) {
      try {
        fs.copyFileSync(this.backupDbPath, this.testDbPath);
        log('Database restored from backup', 'success');
      } catch (error) {
        log(`Failed to restore: ${error.message}`, 'error');
      }
    } else {
      log('No backup found to restore', 'warning');
    }
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'setup';
  
  const setup = new TestDatabaseSetup();
  
  console.log(colorize('\n🎓 AU Scholarship Test Database Setup\n', 'bright'));
  
  switch (command) {
    case 'setup':
      await setup.setup();
      break;
      
    case 'cleanup':
      await setup.cleanup();
      break;
      
    case 'restore':
      await setup.restore();
      break;
      
    case 'reset':
      await setup.cleanup();
      await setup.setup();
      break;
      
    default:
      console.log('Usage: ts-node setup-test-db.ts [setup|cleanup|restore|reset]');
      console.log('');
      console.log('Commands:');
      console.log('  setup    - Create and initialize test database');
      console.log('  cleanup  - Remove test database');
      console.log('  restore  - Restore from backup');
      console.log('  reset    - Clean and recreate database');
      process.exit(0);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error(colorize(`Fatal error: ${error.message}`, 'red'));
    process.exit(1);
  });
}

export { TestDatabaseSetup };