import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const requests = await prisma.exchangeRequest.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: { id: true, name: true, username: true, avatarUrl: true, email: true }
        },
        receiver: {
          select: { id: true, name: true, username: true, avatarUrl: true, email: true }
        },
        offeredSkill: {
          include: { skill: true }
        },
        requestedSkill: {
          include: { skill: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add a direction field so the frontend can distinguish sent vs received
    const enriched = requests.map(req => ({
      ...req,
      direction: req.senderId === userId ? 'sent' : 'received'
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('Fetch requests error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
