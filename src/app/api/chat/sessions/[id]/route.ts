import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getUserId(session: any) {
  if (session?.user?.id) return session.user.id;
  const firstUser = await prisma.user.findFirst();
  return firstUser?.id || "test-user";
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = await getUserId(session);

    const sessionId = params.id;
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
    }

    // Verify ownership before deleting
    const dbSession = await prisma.aIChatSession.findUnique({
      where: { id: sessionId },
    });

    if (!dbSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (dbSession.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Cascade delete is handled by database on foreign keys, but we can verify
    await prisma.aIChatSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting AI session:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = await getUserId(session);

    const sessionId = params.id;
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
    }

    const body = await request.json();
    const { isReasoning } = body;

    // Verify ownership before updating
    const dbSession = await prisma.aIChatSession.findUnique({
      where: { id: sessionId },
    });

    if (!dbSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (dbSession.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedSession = await prisma.aIChatSession.update({
      where: { id: sessionId },
      data: {
        isReasoning: !!isReasoning,
      },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error updating AI session:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
