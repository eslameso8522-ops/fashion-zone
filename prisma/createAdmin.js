const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@fashionzone.com';
  const rawPassword = 'admin123456';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (!existing) {
    await prisma.adminUser.create({
      data: {
        email,
        password: hashedPassword,
        name: 'مديرة متجر Fashion Zone',
      },
    });
    console.log('✅ Created Admin Account:', email);
  } else {
    await prisma.adminUser.update({
      where: { email },
      data: { password: hashedPassword },
    });
    console.log('✅ Updated Admin Account Password:', email);
  }
}

createAdmin()
  .catch((err) => console.error(err))
  .finally(() => prisma.$disconnect());
