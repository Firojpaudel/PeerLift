const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const usersCount = await prisma.user.count()
  const skillCount = await prisma.skill.count()
  const userSkillCount = await prisma.userSkill.count()
  
  console.log('--- DB Data Check ---')
  console.log('Total Users:', usersCount)
  console.log('Total Skills:', skillCount)
  console.log('Total UserSkills:', userSkillCount)
  
  const sampleUsers = await prisma.user.findMany({
    take: 5,
    include: {
      skillsOffered: true
    }
  })
  
  console.log('\nSample Users with SkillsOffered count:')
  sampleUsers.forEach(u => {
    console.log(`- ${u.name} (id: ${u.id}): ${u.skillsOffered.length} skills offered`)
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
