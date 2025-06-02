export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  admins?: AdminUser[];
  system: boolean;
}
