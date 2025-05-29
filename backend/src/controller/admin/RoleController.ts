import { Request, Response } from 'express';
import { prisma } from '@prismaClient/client';

export const listAllRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        permissions: true,
        admins: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return res.status(200).json({ roles });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch roles' });
  }
};

export const updateRolePermissions = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { permissions } = req.body;
  if (!Array.isArray(permissions)) {
    return res.status(400).json({ message: 'Permissions must be an array of permission names' });
  }
  try {
    const updated = await prisma.role.update({
      where: { id },
      data: {
        permissions: {
          set: [],
          connect: permissions.map((name: string) => ({ name })),
        },
      },
      include: {
        permissions: true,
        admins: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    return res.status(200).json({ role: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update role permissions' });
  }
};
