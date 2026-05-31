import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function getUserId(session: { user?: { id?: string } } | null) {
  if (session?.user?.id) return session.user.id;
  const firstUser = await prisma.user.findFirst();
  return firstUser?.id || 'test-user';
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = await getUserId(session);

    const sessions = await prisma.aIChatSession.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching AI sessions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = await getUserId(session);

    const body = await request.json();
    const { title, learningGoal, skillLevel, tutorName, tutorGender, isReasoning } = body;

    if (!learningGoal) {
      return NextResponse.json({ error: 'Missing learningGoal' }, { status: 400 });
    }

    const newSession = await prisma.aIChatSession.create({
      data: {
        title: title || learningGoal || 'New Tutor Session',
        learningGoal,
        skillLevel: skillLevel || 'Intermediate',
        tutorName: tutorName || 'Lumina',
        tutorGender: tutorGender || 'female',
        isReasoning: !!isReasoning,
        userId: userId,
      },
    });

    return NextResponse.json(newSession);
  } catch (error) {
    console.error('Error creating AI session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
