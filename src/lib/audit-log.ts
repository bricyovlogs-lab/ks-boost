import { prisma } from "@/lib/prisma";

export async function createAuditLog(params: {
  adminId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  description?: string;
  metadataJson?: unknown;
}) {
  return prisma.adminLog.create({
    data: {
      adminId: params.adminId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId || undefined,
      description: params.description,
      metadataJson: params.metadataJson as any,
    },
  });
}
