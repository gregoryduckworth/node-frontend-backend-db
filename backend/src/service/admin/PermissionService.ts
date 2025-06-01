import { prisma } from '@prismaClient/client';
import type { Permission } from '@/types/roleTypes';

function normalizePermission(p: {
  id: string;
  name: string;
  description: string | null;
}): Permission {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? undefined,
  };
}

export async function listAllPermissionsService(): Promise<Permission[]> {
  const permissions = await prisma.permission.findMany({
    select: { id: true, name: true, description: true },
    orderBy: { name: 'asc' },
  });
  return permissions.map(normalizePermission);
}
