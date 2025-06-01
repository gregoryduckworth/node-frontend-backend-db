export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  critical: boolean;
  permissions: Permission[];
  admins: AdminUser[];
}

export interface ListAllRolesResponse {
  roles: Role[];
}

export interface UpdateRolePermissionsResponse {
  role: Role;
}
