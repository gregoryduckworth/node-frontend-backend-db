import { Request, Response } from 'express';
import { prisma } from '@prismaClient/client';

export const listAllPermissions = async (_req: Request, res: Response) => {
  try {
    const permissions = await prisma.permission.findMany({
      select: { id: true, name: true, description: true },
      orderBy: { name: 'asc' },
    });
    return res.status(200).json({ permissions });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch permissions' });
  }
};

export {};
