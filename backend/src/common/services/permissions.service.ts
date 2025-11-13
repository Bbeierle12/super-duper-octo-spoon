import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../auth/entities/user.entity';

export enum Permission {
  // Tenant management
  EDIT_TENANT = 'edit_tenant',
  VIEW_BILLING = 'view_billing',
  MANAGE_BILLING = 'manage_billing',
  INVITE_USERS = 'invite_users',
  MANAGE_MEMBERS = 'manage_members',
  VIEW_MEMBERS = 'view_members',

  // Project management
  CREATE_PROJECT = 'create_project',
  EDIT_PROJECT = 'edit_project',
  DELETE_PROJECT = 'delete_project',
  ARCHIVE_PROJECT = 'archive_project',

  // Categories
  MANAGE_CATEGORIES = 'manage_categories',

  // Parts
  ADD_PARTS = 'add_parts',
  EDIT_PARTS = 'edit_parts',
  DELETE_PARTS = 'delete_parts',
  EDIT_COSTS = 'edit_costs',

  // Labor
  MANAGE_LABOR = 'manage_labor',
  MANAGE_VENDORS = 'manage_vendors',

  // Tasks
  MANAGE_TASKS = 'manage_tasks',
  ASSIGN_TASKS = 'assign_tasks',

  // Media
  UPLOAD_MEDIA = 'upload_media',
  DELETE_MEDIA = 'delete_media',

  // Reporting
  VIEW_REPORTS = 'view_reports',
  EXPORT_DATA = 'export_data',
}

@Injectable()
export class PermissionsService {
  private rolePermissions: Record<UserRole, Permission[]> = {
    [UserRole.OWNER]: [
      // Owners have all permissions
      ...Object.values(Permission),
    ],
    [UserRole.ADMIN]: [
      Permission.EDIT_TENANT,
      Permission.VIEW_BILLING,
      Permission.INVITE_USERS,
      Permission.MANAGE_MEMBERS,
      Permission.VIEW_MEMBERS,
      Permission.CREATE_PROJECT,
      Permission.EDIT_PROJECT,
      Permission.ARCHIVE_PROJECT,
      Permission.MANAGE_CATEGORIES,
      Permission.ADD_PARTS,
      Permission.EDIT_PARTS,
      Permission.DELETE_PARTS,
      Permission.EDIT_COSTS,
      Permission.MANAGE_LABOR,
      Permission.MANAGE_VENDORS,
      Permission.MANAGE_TASKS,
      Permission.ASSIGN_TASKS,
      Permission.UPLOAD_MEDIA,
      Permission.DELETE_MEDIA,
      Permission.VIEW_REPORTS,
      Permission.EXPORT_DATA,
    ],
    [UserRole.MEMBER]: [
      Permission.VIEW_MEMBERS,
      Permission.CREATE_PROJECT,
      Permission.EDIT_PROJECT,
      Permission.MANAGE_CATEGORIES,
      Permission.ADD_PARTS,
      Permission.EDIT_PARTS,
      Permission.EDIT_COSTS,
      Permission.MANAGE_LABOR,
      Permission.MANAGE_VENDORS,
      Permission.MANAGE_TASKS,
      Permission.UPLOAD_MEDIA,
      Permission.VIEW_REPORTS,
      Permission.EXPORT_DATA,
    ],
    [UserRole.VIEWER]: [
      Permission.VIEW_MEMBERS,
      Permission.VIEW_REPORTS,
      Permission.EXPORT_DATA,
    ],
  };

  hasPermission(userRole: UserRole, permission: Permission): boolean {
    return this.rolePermissions[userRole]?.includes(permission) || false;
  }

  requirePermission(userRole: UserRole, permission: Permission): void {
    if (!this.hasPermission(userRole, permission)) {
      throw new ForbiddenException(
        `User role '${userRole}' does not have permission '${permission}'`,
      );
    }
  }

  canEditTenant(role: UserRole): boolean {
    return this.hasPermission(role, Permission.EDIT_TENANT);
  }

  canManageBilling(role: UserRole): boolean {
    return this.hasPermission(role, Permission.MANAGE_BILLING);
  }

  canInviteUsers(role: UserRole): boolean {
    return this.hasPermission(role, Permission.INVITE_USERS);
  }

  canCreateProject(role: UserRole): boolean {
    return this.hasPermission(role, Permission.CREATE_PROJECT);
  }

  canEditProject(role: UserRole): boolean {
    return this.hasPermission(role, Permission.EDIT_PROJECT);
  }

  canDeleteProject(role: UserRole): boolean {
    return this.hasPermission(role, Permission.DELETE_PROJECT);
  }

  canEditCosts(role: UserRole): boolean {
    return this.hasPermission(role, Permission.EDIT_COSTS);
  }

  canManageTasks(role: UserRole): boolean {
    return this.hasPermission(role, Permission.MANAGE_TASKS);
  }

  canUploadMedia(role: UserRole): boolean {
    return this.hasPermission(role, Permission.UPLOAD_MEDIA);
  }

  canDeleteMedia(role: UserRole): boolean {
    return this.hasPermission(role, Permission.DELETE_MEDIA);
  }
}
