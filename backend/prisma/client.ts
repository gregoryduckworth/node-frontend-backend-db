import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';

function normalizeFields(
  configs: Array<{
    model: string;
    field: string;
    transformFn: (val: string) => string;
  }>,
): Prisma.Middleware {
  return async (params, next) => {
    configs.forEach(({ model, field, transformFn }) => {
      if (params.model === model) {
        const { action, args } = params;

        if (['create', 'update', 'upsert'].includes(action)) {
          if (args.data?.[field]) {
            args.data[field] = transformFn(args.data[field]);
          }
        }

        if (['findUnique', 'findFirst', 'findMany'].includes(action)) {
          const value = args.where?.[field];

          if (typeof value === 'string') {
            args.where[field] = transformFn(value);
          } else if (value?.equals) {
            value.equals = transformFn(value.equals);
          } else if (value?.contains) {
            value.contains = transformFn(value.contains);
          } else if (Array.isArray(value?.in)) {
            value.in = value.in.map((v: string) => transformFn(v));
          }
        }
      }
    });

    return next(params);
  };
}

const prismaClientSingleton = () => {
  const prisma = new PrismaClient();

  prisma.$use(
    normalizeFields([
      {
        model: 'User',
        field: 'email',
        transformFn: (val) => val.trim().toLowerCase(),
      },
    ]),
  );

  return prisma;
};

export const prisma = prismaClientSingleton();
