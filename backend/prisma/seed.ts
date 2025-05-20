import { prisma } from './client';
import bcrypt from 'bcrypt';

async function main() {
  const password = await bcrypt.hash('password', 10);
  await prisma.adminUser.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password,
      firstName: 'Admin',
      lastName: 'User',
    },
  });
  console.log('Default admin user created: admin@example.com / password');

  // Seed regular users
  const userPassword = await bcrypt.hash('password', 10);
  await prisma.user.createMany({
    data: [
      {
        email: 'user1@example.com',
        password: userPassword,
        firstName: 'User',
        lastName: 'One',
      },
      {
        email: 'user2@example.com',
        password: userPassword,
        firstName: 'User',
        lastName: 'Two',
      },
      {
        email: 'user3@example.com',
        password: userPassword,
        firstName: 'User',
        lastName: 'Three',
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
