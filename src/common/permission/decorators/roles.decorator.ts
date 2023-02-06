import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'app_roles';
export const Roles = (...roles: number[]) => SetMetadata(ROLES_KEY, roles);
