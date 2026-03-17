import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ users });
}
