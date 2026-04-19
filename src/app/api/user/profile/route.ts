import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        avatarUrl: true,
        credits: true,
      }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await req.json();
    const { name, bio, avatarUrl } = data;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        bio,
        avatarUrl,
      },
      select: {
        id: true,
        name: true,
        bio: true,
        avatarUrl: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
