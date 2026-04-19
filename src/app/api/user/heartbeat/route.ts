import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Use raw query to avoid type errors if client isn't regenerated yet
    await prisma.$executeRaw`UPDATE "users" SET "lastSeen" = NOW() WHERE id = ${session.user.id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Heartbeat error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
