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
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: { system: true },
    create: {
      name: 'ADMIN',
      description: 'Administrator',
      system: true,
      permissions: {
        connect: [{ name: 'MANAGE_USERS' }, { name: 'VIEW_REPORTS' }],
      },
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: 'EDITOR' },
    update: { system: false },
    create: {
      name: 'EDITOR',
      description: 'Editor',
      system: false,
      permissions: {
        connect: [{ name: 'VIEW_REPORTS' }],
      },
    },
  });

  // Assign ADMIN role to default admin user
  await prisma.adminUser.update({
    where: { email: 'admin@example.com' },
    data: {
      roles: {
        connect: [{ name: 'ADMIN' }],
      },
    },
  });

  // Create additional admin users for each role
  const adminUsers = [
    {
      email: 'admin.regular@example.com',
      password: await bcrypt.hash('password', 10),
      firstName: 'Regular',
      lastName: 'Admin',
      roleName: 'ADMIN',
    },
    {
      email: 'admin.editor@example.com',
      password: await bcrypt.hash('password', 10),
      firstName: 'Editor',
      lastName: 'Admin',
      roleName: 'EDITOR',
    },
  ];

  for (const adminUser of adminUsers) {
    const { roleName, ...userData } = adminUser;
    const createdAdmin = await prisma.adminUser.upsert({
      where: { email: adminUser.email },
      update: {},
      create: userData,
    });

    // Assign role to the admin user
    await prisma.adminUser.update({
      where: { id: createdAdmin.id },
      data: {
        roles: {
          connect: [{ name: roleName }],
        },
      },
    });
  }

  console.log('Default roles and permissions seeded, admin users created:');
  console.log('- admin@example.com (ADMIN) / password');
  console.log('- admin.regular@example.com (ADMIN) / password');
  console.log('- admin.editor@example.com (EDITOR) / password');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
