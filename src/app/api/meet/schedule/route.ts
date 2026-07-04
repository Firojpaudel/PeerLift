import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createGoogleMeetLink } from '@/lib/google-meet';
import prisma from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher';
import { compressString } from '@/lib/compression';

function getDMChannel(user1: string, user2: string) {
  const sorted = [user1, user2].sort();
  return `private-chat-${sorted[0]}-${sorted[1]}`;
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

    // Look up sender and receiver emails to invite them to the Google Calendar event
    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true } }),
      prisma.user.findUnique({ where: { id: receiverId }, select: { email: true } }),
    ]);

    const attendeeEmails: string[] = [];
    if (sender?.email) attendeeEmails.push(sender.email);
    if (receiver?.email) attendeeEmails.push(receiver.email);

    const meetLink = await createGoogleMeetLink(
      meetSummary,
      start,
      60,
      attendeeEmails,
      session.user.id
    );

    if (!meetLink) {
      return NextResponse.json({ error: 'Failed to generate Google Meet link' }, { status: 500 });
    }

    // Automatically send the meet link as a compressed DM
    const systemMessage = `📅 **Meeting Scheduled!**\n\nI have generated a secure Google Meet link for our session:\n${meetLink}\n\n*Starts: ${start.toLocaleString()}*`;
    const compressedContent = await compressString(systemMessage);

    const message = await prisma.message.create({
      data: {
        role: 'system',
        content: compressedContent,
        userId: session.user.id,
        receiverId,
        status: 'SENT',
        isCompressed: true,
      },
    });

    const channelName = getDMChannel(session.user.id, receiverId);
    await pusherServer.trigger(channelName, 'new-message', {
      id: message.id,
      content: systemMessage, // Send plain text to pusher for instant display
      userId: session.user.id,
      receiverId,
      role: 'system',
      createdAt: message.createdAt,
      status: 'DELIVERED',
      isSystem: true,
    });

    await prisma.message.update({
      where: { id: message.id },
      data: { status: 'DELIVERED' },
    });

    return NextResponse.json({
      success: true,
      meetLink,
      message: { ...message, content: systemMessage },
    });
  } catch (error) {
    console.error('Meet API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
