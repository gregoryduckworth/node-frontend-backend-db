export interface AdminRole {
  id: string;
  name: string;
  description?: string;
  system: boolean;
}

export interface AdminUserWithRoles {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt?: string;
  roles: AdminRole[];
}
