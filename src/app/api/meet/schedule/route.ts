import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createGoogleMeetLink } from '@/lib/google-meet';
import prisma from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher';
import { encryptMessage } from '@/lib/encryption';

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

    const { receiverId, summary, startTime } = await req.json();

    if (!receiverId) {
      return NextResponse.json({ error: 'Missing receiverId' }, { status: 400 });
    }

    const start = startTime ? new Date(startTime) : new Date(Date.now() + 5 * 60000); // default to 5 mins from now
    const meetSummary = summary || `Peer Session with ${session.user.name}`;

    const meetLink = await createGoogleMeetLink(meetSummary, start);

    if (!meetLink) {
      return NextResponse.json({ error: 'Failed to generate Google Meet link' }, { status: 500 });
    }

    // Automatically send the meet link as an encrypted DM
    const systemMessage = `📅 **Meeting Scheduled!**\n\nI have generated a secure Google Meet link for our session:\n${meetLink}\n\n*Starts: ${start.toLocaleString()}*`;
    const encryptedContent = encryptMessage(systemMessage);

    const message = await prisma.message.create({
      data: {
        role: 'system',
        content: encryptedContent,
        userId: session.user.id,
        receiverId,
        status: 'SENT',
        isCompressed: false,
      },
    });

    const channelName = getDMChannel(session.user.id, receiverId);
    await pusherServer.trigger(channelName, 'new-message', {
      id: message.id,
      content: systemMessage, // Send decrypted to pusher since it's private SSL channel
      senderId: session.user.id,
      createdAt: message.createdAt,
      status: 'DELIVERED',
      isSystem: true
    });

    await prisma.message.update({
      where: { id: message.id },
      data: { status: 'DELIVERED' }
    });

    return NextResponse.json({ success: true, meetLink, message: { ...message, content: systemMessage } });
  } catch (error) {
    console.error('Meet API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
