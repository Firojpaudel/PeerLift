import { PrismaClient, SkillCategory, SkillLevel, MessageStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const USERS_TO_SEED = 12;

const SKILLS = [
  { name: 'React & Next.js', slug: 'react-next', category: SkillCategory.TECHNICAL },
  { name: 'Nepali Literature', slug: 'nepali-lit', category: SkillCategory.ACADEMIC },
  { name: 'UI/UX Design', slug: 'uiux', category: SkillCategory.CREATIVE },
  { name: 'Node.js Backend', slug: 'nodejs', category: SkillCategory.TECHNICAL },
  { name: 'Digital Art', slug: 'digital-art', category: SkillCategory.CREATIVE },
  { name: 'Public Speaking', slug: 'public-speaking', category: SkillCategory.OTHER },
  { name: 'Financial Literacy', slug: 'finance', category: SkillCategory.BUSINESS },
  { name: 'Python for Data Science', slug: 'python-ds', category: SkillCategory.TECHNICAL },
];

const NEPALI_NAMES = [
  'Aarya Sharma', 'Sagar Thapa', 'Pranjal Karki', 'Sushma Rai', 'Bikash Gurung',
  'Anjali Shrestha', 'Kushal Magar', 'Samikshya Panday', 'Dipesh Tamang', 'Reeya Maharjan',
  'Nikesh Adhikari', 'Sneha Regmi'
];

const NEPALI_BIOS = [
  'CS student at IOE Pulchowk. Love teaching React and Next.js to beginners.',
  'Dedicated to preserving Nepali literature and帮助ing students with grammar.',
  'Creative designer from Kathmandu. Let us build beautiful interfaces together.',
  'Backend developer with 3 years of experience in Node.js and SQL.',
  'Artist and illustrator. I can teach you the basics of Procreate and Digital Art.',
  'Helping young people gain confidence through public speaking and debate.',
  'Finance professional sharing knowledge about investment and saving in Nepal.',
  'AI enthusiast. I can guide you through the basics of Python and Pandas.',
];

const LOCATIONS = ['Kathmandu', 'Pokhara', 'Lalitpur', 'Bhaktapur', 'Chitwan', 'Dharan'];

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  console.log('--- STARTING PREMIUM NEPALI SEED ---');

  // 1. Clean existing data (Nuclear Reset handled by db push, but we cleanup here too)
  await prisma.userSkill.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.user.deleteMany({ where: { NOT: { email: 'admin@peerlift.app' } } });
  await prisma.skill.deleteMany({});

  // 2. Create Skills
  const createdSkills = [];
  for (const skillData of SKILLS) {
    const s = await prisma.skill.create({ data: skillData });
    createdSkills.push(s);
    console.log(`+ Skill: ${s.name}`);
  }

  // 3. Create Users
  for (let i = 0; i < USERS_TO_SEED; i++) {
    const name = NEPALI_NAMES[i];
    const username = name.toLowerCase().replace(' ', '_');
    const email = `${username}@peerlift.app`;
    
    const offerCount = Math.floor(Math.random() * 2) + 1;
    const skillsToOffer = [...createdSkills].sort(() => 0.5 - Math.random()).slice(0, offerCount);

    await prisma.user.create({
      data: {
        email,
        username,
        name,
        passwordHash,
        bio: NEPALI_BIOS[i % NEPALI_BIOS.length],
        avatarUrl: `https://i.pravatar.cc/150?u=${username}`,
        location: LOCATIONS[i % LOCATIONS.length],
        credits: 100,
        skillsOffered: {
          create: skillsToOffer.map(s => ({
            skillId: s.id,
            level: [SkillLevel.BEGINNER, SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED][Math.floor(Math.random() * 3)],
            note: 'Excited to share my knowledge with fellow students.'
          }))
        }
      }
    });
    console.log(`+ User: ${name}`);
  }

  console.log('--- SEEDING COMPLETE ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

