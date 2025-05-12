import { Request, Response } from 'express';
import { prisma } from '@prismaClient/client';

/**
 * Deletes all data from all tables in the database.
 * Only for use in non-production environments.
 */
export const resetDatabase = async (_req: Request, res: Response) => {
  try {
    await prisma.user.deleteMany();
    res.status(200).json({ message: 'Database reset successful' });
  } catch (error) {
    res.status(500).json({ error: 'Database reset failed', details: error });
  }
};
