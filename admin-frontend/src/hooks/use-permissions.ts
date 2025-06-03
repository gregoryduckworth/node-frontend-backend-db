import { useAuthStore } from '@/features/auth/useAuthStore';
import { hasPermission } from '@/utils/permissions';

export function usePermissions() {
  const { permissions } = useAuthStore();

  return {
    hasPermission: (requiredPermissions: string | string[] | undefined) => {
      const permsArray =
        typeof requiredPermissions === 'string' ? [requiredPermissions] : requiredPermissions;
      return hasPermission(permissions, permsArray);
    },
    permissions,
  };
}
