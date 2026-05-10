const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.student.findMany({ 
  take: 10, 
  select: { student_id_no: true, full_name: true, parent_email: true } 
}).then(console.log).finally(() => prisma.$disconnect());
