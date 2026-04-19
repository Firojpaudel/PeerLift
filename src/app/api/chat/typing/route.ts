import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { peerId, isTyping } = await req.json();
    if (!peerId) {
      return new NextResponse('Missing peerId', { status: 400 });
    }

    const ids = [session.user.id, peerId].sort();
    const channelName = `private-chat-${ids[0]}-${ids[1]}`;

    await pusherServer.trigger(channelName, 'peer-typing', {
      userId: session.user.id,
      isTyping: isTyping
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Typing broadcast error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
