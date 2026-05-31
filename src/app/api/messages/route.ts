import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher';
import { encryptMessage, decryptMessage } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

// Determines a deterministic channel name for two users
function getDMChannel(user1: string, user2: string) {
  const sorted = [user1, user2].sort();
  return `private-dm-${sorted[0]}-${sorted[1]}`;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverId, content, type = 'message', targetMessageId } = await req.json();

    if (!receiverId) {
      return NextResponse.json({ error: 'Missing receiverId' }, { status: 400 });
    }

    const channelName = getDMChannel(session.user.id, receiverId);

    // Handle Read/Delivered Receipts
    if (type === 'receipt') {
      if (!targetMessageId)
        return NextResponse.json({ error: 'Missing targetMessageId' }, { status: 400 });

      const updated = await prisma.message.update({
        where: { id: targetMessageId },
        data: { status: 'READ' },
      });

      await pusherServer.trigger(channelName, 'receipt', {
        messageId: targetMessageId,
        status: 'READ',
        readerId: session.user.id,
      });
      return NextResponse.json({ success: true, updated });
    }

    // Standard message path
    if (!content) return NextResponse.json({ error: 'Missing content' }, { status: 400 });

    const encryptedContent = encryptMessage(content);

    const message = await prisma.message.create({
      data: {
        role: 'p2p',
        content: encryptedContent,
        userId: session.user.id,
        receiverId,
        status: 'SENT',
        isCompressed: false, // Turned off since we use crypto payload sizing
      },
    });

    // Send the PLAIN text over Pusher. Since it's a private channel and we are
    // terminating SSL, it's secure in transit. For true zero-knowledge, the client
    // would encrypt before POST, but we are using Server-Side Application Encryption
    // to preserve history mapping.
    await pusherServer.trigger(channelName, 'new-message', {
      id: message.id,
      content,
      senderId: session.user.id,
      createdAt: message.createdAt,
      status: 'DELIVERED', // Predict optimistic delivery to the pusher queue
    });

    // Mark as delivered in DB because pusher accepted it
    await prisma.message.update({
      where: { id: message.id },
      data: { status: 'DELIVERED' },
    });

    return NextResponse.json({ ...message, content }, { status: 201 });
  } catch (error) {
    console.error('P2P Message error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const peerId = searchParams.get('peerId');

    if (!peerId) {
      return NextResponse.json({ error: 'Missing peerId' }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { userId: session.user.id, receiverId: peerId },
          { userId: peerId, receiverId: session.user.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    // Decrypt messages before sending to client
    const decryptedMessages = messages.map((msg) => ({
      ...msg,
      content: decryptMessage(msg.content),
    }));

    return NextResponse.json(decryptedMessages);
  } catch (error) {
    console.error('P2P Fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
