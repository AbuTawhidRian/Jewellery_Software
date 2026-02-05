const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users found:', users.length);
  users.forEach(u => {
      console.log(`User: ${u.email}, Hash length: ${u.passwordHash?.length}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
