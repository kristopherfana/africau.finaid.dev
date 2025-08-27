import { execSync } from 'child_process';
import * as path from 'path';

/**
 * Test Runner Script for AU Scholarship Backend
 * 
 * This script helps run different types of tests with proper setup
 */

const TEST_COMMANDS = {
  // Unit tests
  unit: 'jest --testPathPattern="src/.*\\.spec\\.ts$"',
  
  // Integration/E2E tests
  e2e: 'jest --config ./test/jest-e2e.json',
  
  // Specific test suites
  auth: 'jest --config ./test/jest-e2e.json --testNamePattern="AuthController"',
  users: 'jest --config ./test/jest-e2e.json --testNamePattern="UsersController"',
  scholarships: 'jest --config ./test/jest-e2e.json --testNamePattern="ScholarshipsController"',
  applications: 'jest --config ./test/jest-e2e.json --testNamePattern="ApplicationsController"',
  
  // Coverage
  coverage: 'jest --config ./test/jest-e2e.json --coverage',
  
  // Watch mode
  watch: 'jest --config ./test/jest-e2e.json --watch',
};

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

function printHeader(title: string): void {
  console.log('\n' + colorize('='.repeat(60), 'cyan'));
  console.log(colorize(`🎓 AU Scholarship Backend - ${title}`, 'bright'));
  console.log(colorize('='.repeat(60), 'cyan') + '\n');
}

function printHelp(): void {
  printHeader('Test Runner Help');
  
  console.log(colorize('Available Commands:', 'bright'));
  console.log('');
  
  Object.entries(TEST_COMMANDS).forEach(([name, command]) => {
    console.log(`  ${colorize(name.padEnd(12), 'green')} - ${command}`);
  });
  
  console.log('');
  console.log(colorize('Usage Examples:', 'bright'));
  console.log('  npm run test:runner auth          # Run only auth tests');
  console.log('  npm run test:runner e2e           # Run all e2e tests');
  console.log('  npm run test:runner coverage      # Run with coverage');
  console.log('  npm run test:runner watch         # Run in watch mode');
  console.log('');
}

function runTests(testType: string): void {
  if (!TEST_COMMANDS[testType]) {
    console.error(colorize(`❌ Unknown test type: ${testType}`, 'red'));
    printHelp();
    process.exit(1);
  }
  
  printHeader(`Running ${testType.toUpperCase()} Tests`);
  
  try {
    console.log(colorize(`Executing: ${TEST_COMMANDS[testType]}`, 'yellow'));
    console.log('');
    
    execSync(TEST_COMMANDS[testType], {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: 'test',
        // Ensure test database is used
        DATABASE_URL: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
      },
    });
    
    console.log('');
    console.log(colorize('✅ Tests completed successfully!', 'green'));
    
  } catch (error) {
    console.log('');
    console.error(colorize('❌ Tests failed!', 'red'));
    process.exit(1);
  }
}

function setupTestEnvironment(): void {
  printHeader('Test Environment Setup');
  
  console.log(colorize('Setting up test environment...', 'yellow'));
  
  try {
    // Generate Prisma client if needed
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Run database migrations for test environment
    console.log('🗃️  Running database migrations...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    console.log(colorize('✅ Test environment setup complete!', 'green'));
    
  } catch (error) {
    console.error(colorize('❌ Failed to setup test environment!', 'red'));
    console.error(error.message);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === 'help' || command === '--help') {
  printHelp();
  process.exit(0);
}

if (command === 'setup') {
  setupTestEnvironment();
  process.exit(0);
}

// Check if we need to setup first
if (command !== 'help' && !process.env.SKIP_SETUP) {
  setupTestEnvironment();
}

runTests(command);