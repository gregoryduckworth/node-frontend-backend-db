export function hasPermission(userPermissions: string[], requiredPermissions?: string[]): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }
  return requiredPermissions.some((perm) => userPermissions.includes(perm));
}
