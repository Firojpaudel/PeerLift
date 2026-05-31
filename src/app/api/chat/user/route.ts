import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

    // Fetch full user details if user exists in the DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json(user || { id: userId, name: 'Test User', username: 'testuser' });
  } catch (error) {
    console.error('Error in fallback user endpoint:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
