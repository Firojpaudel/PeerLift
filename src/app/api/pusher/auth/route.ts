import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { pusherServer } from '@/lib/pusher';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.text();
    const params = new URLSearchParams(body);
    const socketId = params.get('socket_id') as string;
    const channelName = params.get('channel_name') as string;

    if (!socketId || !channelName) {
      console.error('Pusher Auth Missing parameters:', body);
      return new NextResponse('Missing parameters', { status: 400 });
    }

    // Prepare presence data so clients know who is online
    const presenceData = {
      user_id: session.user.id,
      user_info: {
        name: session.user.name,
        email: session.user.email,
      },
    };

    // Authenticate the user for the requested channel
    const authResponse = pusherServer.authorizeChannel(socketId, channelName, presenceData);
    return NextResponse.json(authResponse);

  } catch (error) {
    console.error('Pusher auth error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
