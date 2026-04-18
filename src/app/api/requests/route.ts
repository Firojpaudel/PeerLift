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

    const { receiverId, offeredSkillId, requestedSkillId, message } = await req.json();

    if (!receiverId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const request = await prisma.exchangeRequest.create({
      data: {
        senderId: session.user.id,
        receiverId,
        offeredSkillId: offeredSkillId || "CREDITS", // Fallback for credit transactions
        requestedSkillId: requestedSkillId || "CREDITS",
        message,
      }
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error("ExchangeRequest creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
