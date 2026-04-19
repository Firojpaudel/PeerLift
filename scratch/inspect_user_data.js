const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = 'samikshya_panday@peerlift.app'
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      skillsOffered: { include: { skill: true } },
      skillsWanted: { include: { skill: true } },
      requestsReceived: true,
      requestsSent: true,
      sessionsAsMentor: true,
      sessionsAsLearner: true,
    }
  });

  if (!user) {
    console.log(`User ${email} not found.`);
    return;
  }

  console.log('--- User Data ---')
  console.log('Name:', user.name)
  console.log('Credits:', user.credits)
  console.log('Skills Offered:', user.skillsOffered.map(s => s.skill.name))
  console.log('Skills Wanted:', user.skillsWanted.map(s => s.skill.name))
  console.log('Requests Received count:', user.requestsReceived.length)
  console.log('Requests Sent count:', user.requestsSent.length)
  console.log('Sessions As Mentor count:', user.sessionsAsMentor.length)
  console.log('Sessions As Learner count:', user.sessionsAsLearner.length)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
