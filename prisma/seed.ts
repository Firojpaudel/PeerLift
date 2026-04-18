import { PrismaClient, SkillCategory, SkillLevel } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  const pw = await bcrypt.hash('password123', 10);
  console.log('Seeding initial data...');

  const cat1 = await prisma.skill.upsert({
    where: { name: 'Python' },
    update: {},
    create: { name: 'Python', slug: 'python', category: SkillCategory.TECHNICAL },
  });

  const cat2 = await prisma.skill.upsert({
    where: { name: 'Guitar' },
    update: {},
    create: { name: 'Guitar', slug: 'guitar', category: SkillCategory.CREATIVE },
  });
  
  const cat3 = await prisma.skill.upsert({
    where: { name: 'French' },
    update: {},
    create: { name: 'French', slug: 'french', category: SkillCategory.LANGUAGE },
  });

  const u1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      username: 'alice',
      name: 'Alice',
      passwordHash: pw,
      skillsOffered: {
        create: [{ skillId: cat1.id, level: SkillLevel.ADVANCED, note: 'Python for Data Science' }]
      },
      skillsWanted: {
        create: [{ skillId: cat2.id, level: SkillLevel.BEGINNER }]
      }
    }
  });

  const u2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      username: 'bob',
      name: 'Bob',
      passwordHash: pw,
      skillsOffered: {
        create: [{ skillId: cat2.id, level: SkillLevel.ADVANCED, note: 'Acoustic fingerstyle' }]
      },
      skillsWanted: {
        create: [{ skillId: cat1.id, level: SkillLevel.BEGINNER }]
      }
    }
  });

  const u3 = await prisma.user.upsert({
    where: { email: 'charlie@example.com' },
    update: {},
    create: {
      email: 'charlie@example.com',
      username: 'charlie',
      name: 'Charlie',
      passwordHash: pw,
      skillsOffered: {
        create: [{ skillId: cat3.id, level: SkillLevel.ADVANCED, note: 'Native speaker' }]
      },
      skillsWanted: {
        create: [{ skillId: cat2.id, level: SkillLevel.BEGINNER }]
      }
    }
  });

  const pwTest = await bcrypt.hash('pass123', 10);
  const u4 = await prisma.user.upsert({
    where: { email: 'twst@mail.com' },
    update: {},
    create: {
      email: 'twst@mail.com',
      username: 'testuser1',
      name: 'Test Person',
      passwordHash: pwTest,
    }
  });

  console.log('Seeded database successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
