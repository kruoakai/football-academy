import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const verifySession = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
});

export async function requireRole(roles: Array<"ADMIN" | "COACH" | "GUARDIAN" | "STUDENT">) {
  const session = await verifySession();
  if (!roles.includes(session.user.role as (typeof roles)[number])) {
    redirect("/login");
  }
  return session;
}
