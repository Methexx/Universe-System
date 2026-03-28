import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../common/utils/hash';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Master Admin account...');
  
  const email = 'admin@school.lk';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email }
  });

  if (existingAdmin) {
    console.log('Admin account already exists! Skipping seed.');
    return;
  }

  // Hash password: 'adminpassword'
  const password_hash = await hashPassword('adminpassword');

  await prisma.user.create({
    data: {
      email,
      password_hash,
      role: 'admin',
      full_name: 'System Principal',
      is_active: true,
      is_suspended: false,
    }
  });

  console.log('✅ Master Admin created successfully:');
  console.log(`Email: ${email}`);
  console.log(`Password: adminpassword`);
}

main()
  .catch((e) => {
    console.error('Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
