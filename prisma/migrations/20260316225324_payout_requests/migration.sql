-- CreateEnum
CREATE TYPE "PayoutRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'REJECTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "AffiliateProfile" ADD COLUMN     "paidOutCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "payoutPixKey" TEXT,
ADD COLUMN     "payoutPixName" TEXT,
ADD COLUMN     "pendingPayoutCents" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PayoutRequest" (
    "id" TEXT NOT NULL,
    "affiliateProfileId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "pixName" TEXT NOT NULL,
    "pixKey" TEXT NOT NULL,
    "status" "PayoutRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "PayoutRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PayoutRequest_affiliateProfileId_idx" ON "PayoutRequest"("affiliateProfileId");

-- CreateIndex
CREATE INDEX "PayoutRequest_status_idx" ON "PayoutRequest"("status");

-- CreateIndex
CREATE INDEX "PayoutRequest_requestedAt_idx" ON "PayoutRequest"("requestedAt");

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_affiliateProfileId_fkey" FOREIGN KEY ("affiliateProfileId") REFERENCES "AffiliateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
