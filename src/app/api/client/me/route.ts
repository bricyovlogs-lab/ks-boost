import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireUser();
  const [licenses, payments] = await Promise.all([
    prisma.license.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.payment.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  return NextResponse.json({ user, licenses, payments });
}
