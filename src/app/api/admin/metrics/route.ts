import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();

  const [users, licenses, payments, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.license.count(),
    prisma.payment.count({ where: { status: "PAID" } }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
  ]);

  return NextResponse.json({
    metrics: {
      users,
      licenses,
      paidPayments: payments,
      revenue: revenue._sum.amount || 0,
    },
  });
}
