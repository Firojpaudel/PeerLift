import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SkillLevel } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get all pre-defined skills available in the system
    const allSkills = await prisma.skill.findMany({
      orderBy: { name: 'asc' },
    });

    // Get user's current offering and wanting skills
    const userSkills = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        skillsOffered: {
          include: { skill: true },
        },
        skillsWanted: {
          include: { skill: true },
        },
      },
    });

    return NextResponse.json({
      allSkills,
      skillsOffered: userSkills?.skillsOffered || [],
      skillsWanted: userSkills?.skillsWanted || [],
    });
  } catch (error) {
    console.error('Fetch user skills error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { skillId, type, level, note } = await req.json();
    if (!skillId || !type) {
      return new NextResponse('Missing skillId or type', { status: 400 });
    }

    const userId = session.user.id;

    // Check if the user already has this skill in their profile
    const existing = await prisma.userSkill.findFirst({
      where: {
        skillId,
        OR: [{ offeringUserId: userId }, { wantingUserId: userId }],
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Skill already added to your profile.' }, { status: 400 });
    }

    const data: {
      skillId: string;
      level: SkillLevel;
      note: string;
      offeringUserId?: string;
      wantingUserId?: string;
    } = {
      skillId,
      level: level || SkillLevel.INTERMEDIATE,
      note: note || '',
    };

    if (type === 'teaching') {
      data.offeringUserId = userId;
    } else if (type === 'learning') {
      data.wantingUserId = userId;
    } else {
      return new NextResponse('Invalid skill type', { status: 400 });
    }

    const newUserSkill = await prisma.userSkill.create({
      data,
      include: { skill: true },
    });

    return NextResponse.json(newUserSkill);
  } catch (error) {
    console.error('Create user skill error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Missing UserSkill ID', { status: 400 });
    }

    // Verify ownership before deleting
    const userSkill = await prisma.userSkill.findUnique({
      where: { id },
    });

    if (!userSkill) {
      return new NextResponse('Not found', { status: 404 });
    }

    if (
      userSkill.offeringUserId !== session.user.id &&
      userSkill.wantingUserId !== session.user.id
    ) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    await prisma.userSkill.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user skill error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
