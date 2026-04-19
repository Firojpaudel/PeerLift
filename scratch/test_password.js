const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const email = 'samikshya_panday@peerlift.app'
  const passwordToCheck = 'password123'
  
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`User ${email} not found.`);
    return;
  }

  const isMatch = await bcrypt.compare(passwordToCheck, user.passwordHash || '');
  console.log(`Password match for ${email}: ${isMatch}`);
  
  if (!isMatch) {
    console.log('Password does NOT match.');
    // Let's check if there are other users or what the hash actually is
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
