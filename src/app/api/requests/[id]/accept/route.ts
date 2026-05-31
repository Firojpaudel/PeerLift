import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createGoogleMeetLink } from '@/lib/google-meet';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestId = params.id;

    const request = await prisma.exchangeRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: true,
        receiver: true,
      },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Only the receiver can accept the request
    if (request.receiverId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (request.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request is no longer pending' }, { status: 400 });
    }

    // 1. Generate Google Meet Link
    // For now, we use a generic time or a fallback if startTime is not provided
    // In a real app, you'd have a proposed time in the request
    const meetingSummary = `PeerLift: ${request.sender.name} & ${request.receiver.name}`;

    const attendeeEmails: string[] = [];
    if (request.sender.email) attendeeEmails.push(request.sender.email);
    if (request.receiver.email) attendeeEmails.push(request.receiver.email);

    const meetLink = await createGoogleMeetLink(
      meetingSummary,
      new Date(Date.now() + 86400000), // Tomorrow
      60,
      attendeeEmails
    );

    // 2. Update Request & Create Session
    const [updatedRequest, newSession] = await prisma.$transaction([
      prisma.exchangeRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      }),
      prisma.session.create({
        data: {
          requestId: request.id,
          mentorId: request.receiverId,
          learnerId: request.senderId,
          skillId: request.requestedSkillId || request.offeredSkillId || 'unknown',
          scheduledAt: new Date(Date.now() + 86400000),
          duration: 60,
          meetingLink: meetLink || 'https://meet.google.com/pending',
          status: 'SCHEDULED',
        },
      }),
    ]);

    return NextResponse.json({ 
      request: updatedRequest, 
      session: newSession,
      meetingLink: meetLink 
    }, { status: 200 });

  } catch (error) {
    console.error('Accept request error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
