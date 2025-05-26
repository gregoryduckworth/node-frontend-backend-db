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

  // Seed regular users (no duplicate emails allowed)
  const userPassword = await bcrypt.hash('password', 10);
  const regularUsers = [
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
  ];
  for (const user of regularUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  // Seed permissions
  const permissions = [
    { name: 'MANAGE_USERS', description: 'Can manage users' },
    { name: 'VIEW_REPORTS', description: 'Can view reports' },
    { name: 'EDIT_SETTINGS', description: 'Can edit settings' },
  ];
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  // Seed roles with permissions
  const superadminRole = await prisma.role.upsert({
    where: { name: 'SUPERADMIN' },
    update: {},
    create: {
      name: 'SUPERADMIN',
      description: 'Super administrator',
      permissions: {
        connect: permissions.map((p) => ({ name: p.name })),
      },
    },
    include: { permissions: true },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator',
      permissions: {
        connect: [{ name: 'MANAGE_USERS' }, { name: 'VIEW_REPORTS' }],
      },
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: 'EDITOR' },
    update: {},
    create: {
      name: 'EDITOR',
      description: 'Editor',
      permissions: {
        connect: [{ name: 'VIEW_REPORTS' }],
      },
    },
  });

  // Assign SUPERADMIN role to default admin user
  await prisma.adminUser.update({
    where: { email: 'admin@example.com' },
    data: {
      roles: {
        connect: [{ name: superadminRole.name }],
      },
    },
  });
  console.log('Default roles and permissions seeded, SUPERADMIN assigned to admin@example.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
