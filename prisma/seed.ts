import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log("ADMIN_EMAIL ou ADMIN_PASSWORD não configurados. Seed pulado.");
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: UserRole.ADMIN,
      passwordHash,
      emailVerified: true,
    },
    create: {
      email: adminEmail,
      name: "Administrador VKS BOOST",
      role: UserRole.ADMIN,
      passwordHash,
      emailVerified: true,
    },
  });

  const influencerPassword = await bcrypt.hash("12345678", 10);
  const influencer = await prisma.user.upsert({
    where: { email: "influencer@vksboost.com" },
    update: {
      role: UserRole.AFFILIATE,
      passwordHash: influencerPassword,
      emailVerified: true,
    },
    create: {
      email: "influencer@vksboost.com",
      name: "Influencer Demo",
      role: UserRole.AFFILIATE,
      passwordHash: influencerPassword,
      emailVerified: true,
    },
  });

  await prisma.affiliateProfile.upsert({
    where: { userId: influencer.id },
    update: {
      displayName: "Influencer Demo",
      commissionPercent: 12,
      isActive: true,
    },
    create: {
      userId: influencer.id,
      displayName: "Influencer Demo",
      commissionPercent: 12,
      isActive: true,
    },
  });

  console.log(`Admin criado/atualizado: ${admin.email}`);
  console.log("Influencer demo criado: influencer@vksboost.com / 12345678");
}

main().finally(async () => {
  await prisma.$disconnect();
});
