import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pusherServer } from '@/lib/pusher';
import { compressString, decompressString } from '@/lib/compression';

export const dynamic = 'force-dynamic';

async function getUserId(session: { user?: { id?: string } } | null) {
  if (session?.user?.id) return session.user.id;
  const firstUser = await prisma.user.findFirst();
  return firstUser?.id || 'test-user';
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = await getUserId(session);

    const { searchParams } = new URL(request.url);
    const peerId = searchParams.get('peerId');
    const isAi = searchParams.get('isAi') === 'true';
    const sessionId = searchParams.get('sessionId');

    let messages;

    if (isAi) {
      if (!sessionId) {
        return NextResponse.json({ error: 'Missing sessionId for AI chat' }, { status: 400 });
      }
      // Fetch user's conversation with specific AI session
      messages = await prisma.message.findMany({
        where: {
          userId: userId,
          receiverId: null, // AI messages have no receiver
          sessionId: sessionId,
        },
        orderBy: { createdAt: 'asc' },
      });
    } else if (peerId) {
      // Fetch Peer-to-Peer messages
      messages = await prisma.message.findMany({
        where: {
          OR: [
            { userId: userId, receiverId: peerId },
            { userId: peerId, receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });
    } else {
      return NextResponse.json({ error: 'Missing peerId or isAi' }, { status: 400 });
    }

    // Decompress messages for the frontend
    const decompressedMessages = await Promise.all(
      messages.map(async (msg) => {
        if (msg.isCompressed && msg.content) {
          try {
            return { ...msg, content: await decompressString(msg.content) };
          } catch (e) {
            console.error('Decompression failed for message', msg.id, e);
            return msg;
          }
        }
        return msg;
      })
    );

    return NextResponse.json(decompressedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = await getUserId(session);

    const { content, receiverId } = await request.json();

    if (!content || !receiverId) {
      return NextResponse.json({ error: 'Missing content or receiverId' }, { status: 400 });
    }

    // Compress content for storage
    const compressedContent = await compressString(content);

    const message = await prisma.message.create({
      data: {
        userId: userId,
        receiverId,
        content: compressedContent,
        role: 'user', // Required field
        isCompressed: true,
      },
    });

    // Trigger Pusher event for the private channel
    if (pusherServer) {
      // Construct the same stable channel name logic client uses:
      const ids = [userId, receiverId].sort();
      const channelName = `private-chat-${ids[0]}-${ids[1]}`;

      await pusherServer.trigger(channelName, 'new-message', {
        id: message.id,
        content: content, // Send raw content via socket for instant display
        userId: message.userId,
        receiverId: message.receiverId,
        role: message.role,
        createdAt: message.createdAt,
      });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
