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

    const { requestId, status } = await req.json(); // status: ACCEPTED or DECLINED
    if (!requestId || !['ACCEPTED', 'DECLINED'].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const friendship = await prisma.friendship.findUnique({
      where: { id: requestId }
    });

    if (!friendship || friendship.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Request not found or unauthorized" }, { status: 404 });
    }

    if (status === 'DECLINED') {
      await prisma.friendship.delete({
        where: { id: requestId }
      });
      return NextResponse.json({ message: "Request declined" });
    }

    const updated = await prisma.friendship.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Friend response error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
