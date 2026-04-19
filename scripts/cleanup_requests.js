const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up exchange_requests data for migration...');
  
  // Actually, let's just delete all existing requests to make the migration clean
  // since the previous data used a mixed format (Skill UUIDs vs "CREDITS_X" strings)
  const deleted = await prisma.exchangeRequest.deleteMany({});
  
  console.log(`Deleted ${deleted.count} existing requests.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
