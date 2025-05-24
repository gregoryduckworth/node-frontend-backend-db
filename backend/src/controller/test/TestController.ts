import { Request, Response } from 'express';
import { prisma } from '@prismaClient/client';
import { logger } from '@/utils/logger';

/**
 * Deletes all data from all tables in the database.
 * Only for use in non-production environments.
 */
export const resetDatabase = async (_req: Request, res: Response) => {
  try {
    await prisma.user.deleteMany();
    const { exec } = await import('child_process');
    exec(
      'npx ts-node ./prisma/seed.ts',
      { cwd: __dirname + '/../../' },
      (error, stdout, _stderr) => {
        if (error) {
          logger.error('Seeding failed', error);
          return res
            .status(500)
            .json({ error: 'Database reset but seeding failed', details: error });
        }
        res.status(200).json({ message: 'Database reset and seeded', output: stdout });
      },
    );
  } catch (error) {
    logger.error('Database reset failed', error);
    res.status(500).json({ error: 'Database reset failed', details: error });
  }
};
