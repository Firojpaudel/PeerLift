import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId } = await req.json();
    if (!receiverId) {
      return NextResponse.json({ error: "Missing receiverId" }, { status: 400 });
    }

    if (receiverId === session.user.id) {
        return NextResponse.json({ error: "Cannot add yourself as a friend" }, { status: 400 });
    }

    // Check if friendship already exists
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId },
          { senderId: receiverId, receiverId: session.user.id }
        ]
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Friendship request already exists" }, { status: 400 });
    }

    const friendship = await prisma.friendship.create({
      data: {
        senderId: session.user.id,
        receiverId,
        status: 'PENDING'
      }
    });

    return NextResponse.json(friendship, { status: 201 });
  } catch (error) {
    console.error("Friend request error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
