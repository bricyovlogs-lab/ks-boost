import { prisma } from "@/lib/prisma";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomGroup(length = 4) {
  let value = "";
  for (let i = 0; i < length; i += 1) {
    value += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return value;
}

export async function generateUniqueLicenseKey() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const key = `VKS-${randomGroup()}-${randomGroup()}-${randomGroup()}-${randomGroup()}`;
    const existing = await prisma.license.findUnique({ where: { key } });
    if (!existing) return key;
  }
  throw new Error("Não foi possível gerar uma key única.");
}
