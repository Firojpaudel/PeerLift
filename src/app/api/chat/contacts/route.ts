import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Fetch all requests (Accepted and Pending)
    const requests = await prisma.exchangeRequest.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: { id: true, name: true, username: true, avatarUrl: true /* lastSeen: true */ }
        },
        receiver: {
          select: { id: true, name: true, username: true, avatarUrl: true /* lastSeen: true */ }
        }
      }
    });

    // 2. Fetch all messages to find unique peers (messaging without a friendship)
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { userId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    const contactsMap = new Map();

    // Helper to add/update contact
    const addOrUpdateContact = (user: any, relationship: any) => {
      if (!user || user.id === userId) return;
      
      const existing = contactsMap.get(user.id);
      if (!existing || (relationship.status === 'ACCEPTED' && existing.status !== 'ACCEPTED')) {
        contactsMap.set(user.id, {
          ...user,
          status: relationship.status || 'MESSAGE_ONLY',
          lastActivity: relationship.updatedAt || relationship.createdAt
        });
      }
    };

    // Load friendships into the map
    requests.forEach(f => {
      const otherUser = f.senderId === userId ? f.receiver : f.sender;
      addOrUpdateContact(otherUser, f);
    });

    // Determine missing message-only users
    const missingUserIds = new Set<string>();
    const messageActivityMap = new Map<string, string>(); // peerId -> maxCreatedAt

    messages.forEach(m => {
      const otherId = m.userId === userId ? m.receiverId : m.userId;
      if (otherId && !contactsMap.has(otherId)) {
        missingUserIds.add(otherId);
      }
      
      if (otherId) {
         const currentMax = messageActivityMap.get(otherId) || "1970-01-01T00:00:00.000Z";
         const mDate = new Date(m.createdAt).toISOString();
         if (mDate > currentMax) {
           messageActivityMap.set(otherId, mDate);
         }
      }
    });

    if (missingUserIds.size > 0) {
      const missingUsers = await prisma.user.findMany({
        where: { id: { in: Array.from(missingUserIds) } },
        select: { id: true, name: true, username: true, avatarUrl: true /* lastSeen: true */ }
      });

      missingUsers.forEach(u => {
        addOrUpdateContact(u, { 
           status: 'MESSAGE_ONLY', 
           createdAt: messageActivityMap.get(u.id), 
           updatedAt: messageActivityMap.get(u.id) 
        });
      });
    }

    const contacts = Array.from(contactsMap.values()).sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Contacts fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
