import { Request, Response } from 'express';
import { prisma } from '@prismaClient/client';

interface Permission {
  id: string;
  name: string;
  description?: string;
}

interface ListAllPermissionsResponse {
  permissions: Permission[];
}

export const listAllPermissions = async (
  _req: Request,
  res: Response<ListAllPermissionsResponse | { message: string }>,
) => {
  try {
    const permissions = (
      await prisma.permission.findMany({
        select: { id: true, name: true, description: true },
        orderBy: { name: 'asc' },
      })
    ).map((p) => ({ ...p, description: p.description ?? undefined }));
    return res.status(200).json({ permissions });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch permissions' });
  }
};

export {};
