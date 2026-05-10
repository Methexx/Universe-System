const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetParent() {
  const user = await prisma.user.findUnique({ where: { email: 'methum.official1@gmail.com' } });
  if (user) {
    await prisma.parentStudent.deleteMany({ where: { parent_id: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }
  await prisma.student.updateMany({
    where: { parent_email: 'methum.official1@gmail.com' },
    data: { is_parent_linked: false }
  });
  console.log("Reset successful for methum.official1@gmail.com");
}

resetParent().finally(() => prisma.$disconnect());
