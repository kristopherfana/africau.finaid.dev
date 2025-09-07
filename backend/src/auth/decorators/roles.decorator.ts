import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  SPONSOR = 'SPONSOR',
  DEVELOPMENT_OFFICE = 'DEVELOPMENT_OFFICE',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);