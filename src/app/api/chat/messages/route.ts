import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pusherServer } from '@/lib/pusher';
import { compressString, decompressString } from '@/lib/compression';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const peerId = searchParams.get('peerId');
    const isAi = searchParams.get('isAi') === 'true';

    let messages;

    if (isAi) {
      // Fetch user's conversation with Lumina AI
      messages = await prisma.message.findMany({
        where: {
          userId: session.user.id,
          receiverId: null, // AI messages have no receiver
          sessionId: null,   // Specific for global AI chat
        },
        orderBy: { createdAt: 'asc' },
      });
    } else if (peerId) {
      // Fetch Peer-to-Peer messages
      messages = await prisma.message.findMany({
        where: {
          OR: [
            { userId: session.user.id, receiverId: peerId },
            { userId: peerId, receiverId: session.user.id }
          ]
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
            console.error("Decompression failed for message", msg.id, e);
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, receiverId } = await request.json();

    if (!content || !receiverId) {
      return NextResponse.json({ error: 'Missing content or receiverId' }, { status: 400 });
    }

    // Compress content for storage
    const compressedContent = await compressString(content);

    const message = await prisma.message.create({
      data: {
        userId: session.user.id,
        receiverId,
        content: compressedContent,
        role: 'user', // Required field
        isCompressed: true,
      }
    });

    // Trigger Pusher event for the private channel
    if (pusherServer) {
        // Construct the same stable channel name logic client uses:
        const ids = [session.user.id, receiverId].sort();
        const channelName = `private-chat-${ids[0]}-${ids[1]}`;
        
        await pusherServer.trigger(channelName, 'new-message', {
          id: message.id,
          content: content, // Send raw content via socket for instant display
          userId: message.userId,
          receiverId: message.receiverId,
          role: message.role,
          createdAt: message.createdAt
        });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
