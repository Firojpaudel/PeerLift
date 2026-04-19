const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = 'samikshya_panday@peerlift.app'
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`User ${email} not found.`);
  } else {
    console.log(`User found:`);
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Username: ${user.username}`);
    console.log(`Is Banned: ${user.isBanned}`);
    console.log(`Has passwordHash: ${!!user.passwordHash}`);
    // We can't easily check passwordHash without bcrypt, but we can see if it starts with $2a$ or similar
    console.log(`Password Hash starts with: ${user.passwordHash ? user.passwordHash.substring(0, 10) : 'N/A'}`);
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
