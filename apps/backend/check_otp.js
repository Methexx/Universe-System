const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.otpVerification.findMany({
  orderBy: { created_at: 'desc' },
  take: 5
}).then(console.log).finally(() => prisma.$disconnect());
