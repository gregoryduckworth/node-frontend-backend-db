import { hasRequiredRoleOrPermission } from './AdminAuthService';

describe('hasRequiredRoleOrPermission', () => {
  it('returns true if admin has required role', () => {
    const admin = { roles: [{ name: 'SUPERADMIN', permissions: [] }] };
    expect(hasRequiredRoleOrPermission(admin, ['SUPERADMIN'])).toBe(true);
  });

  it('returns true if admin has required permission', () => {
    const admin = { roles: [{ name: 'ADMIN', permissions: [{ name: 'MANAGE_USERS' }] }] };
    expect(hasRequiredRoleOrPermission(admin, ['MANAGE_USERS'])).toBe(true);
  });

  it('returns false if admin has neither', () => {
    const admin = { roles: [{ name: 'EDITOR', permissions: [{ name: 'VIEW_REPORTS' }] }] };
    expect(hasRequiredRoleOrPermission(admin, ['SUPERADMIN', 'MANAGE_USERS'])).toBe(false);
  });
});
