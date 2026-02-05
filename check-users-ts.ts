import 'dotenv/config';
import { prisma } from './lib/db';

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
    // await prisma.$disconnect(); 
    // In serverless/edge environments (or with pool), disconnect might behave differently, 
    // but for a script it's good practice. 
    process.exit(0);
  });
