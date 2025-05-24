import { prisma } from '@prismaClient/client';

export async function getAdminWithRolesAndPermissions(adminId: string) {
  return prisma.adminUser.findUnique({
    where: { id: adminId },
    include: {
      roles: {
        include: { permissions: true },
      },
    },
  });
}

export function hasRequiredRoleOrPermission(admin: any, required: string[]): boolean {
  const roleNames = new Set(admin.roles.map((r: any) => r.name));
  const permissionNames = new Set(
    admin.roles.flatMap((r: any) => r.permissions.map((p: any) => p.name)),
  );
  return required.some((rp) => roleNames.has(rp) || permissionNames.has(rp));
}
