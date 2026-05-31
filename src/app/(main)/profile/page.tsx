import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function ProfileRedirect() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.username) {
    redirect(`/u/${session.user.username}`);
  }
  
  // Fallback to Settings so they can configure their profile
  redirect("/settings");
}
