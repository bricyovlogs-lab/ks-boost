/**
 * Cria (ou atualiza) uma conta de VENDEDOR ou CRIADOR DE CONTEÚDO com cupom próprio.
 *
 *   npx tsx scripts/criar-vendedor.ts --nome "João" --email joao@gmail.com --senha MinhaSenha123 --cupom JOAO5
 *   npx tsx scripts/criar-vendedor.ts --tipo criador --nome "Canal X" --email canalx@gmail.com --senha Senha123 --cupom CANALX
 *
 * Regra: o cliente ganha 5% de desconto com o cupom e o vendedor recebe 35% do valor que o cliente pagou.
 * Rodar de novo com o mesmo email só atualiza (não duplica nada).
 */
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DESCONTO_CLIENTE = 5; // % de desconto no cupom
const COMISSAO_VENDEDOR = 35; // % do valor pago que vai para o vendedor

function arg(name: string, fallback: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

async function main() {
  const nome = arg("nome", "Vendedor VKS");
  const email = arg("email", "vendedor@vksboost.com").trim().toLowerCase();
  const senhaGerada = randomBytes(6).toString("base64url");
  const senha = arg("senha", senhaGerada);
  const cupom = arg("cupom", "VKS5").trim().toUpperCase();
  const tipo = arg("tipo", "vendedor").toLowerCase();
  const role = tipo === "criador" || tipo === "youtuber" ? "AFFILIATE" : "RESELLER";

  const passwordHash = await bcrypt.hash(senha, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { name: nome, role, passwordHash, emailVerified: true },
    create: { email, name: nome, role, passwordHash, emailVerified: true },
  });

  const profile = await prisma.affiliateProfile.upsert({
    where: { userId: user.id },
    update: { displayName: nome, commissionPercent: COMISSAO_VENDEDOR, isActive: true },
    create: {
      userId: user.id,
      displayName: nome,
      codePrefix: cupom,
      commissionPercent: COMISSAO_VENDEDOR,
      isActive: true,
    },
  });

  const existente = await prisma.coupon.findUnique({ where: { code: cupom } });
  if (existente && existente.affiliateProfileId && existente.affiliateProfileId !== profile.id) {
    throw new Error(`O cupom ${cupom} já pertence a outro vendedor. Use outro código com --cupom.`);
  }

  await prisma.coupon.upsert({
    where: { code: cupom },
    update: {
      discountType: "PERCENT",
      discountValue: DESCONTO_CLIENTE,
      isActive: true,
      affiliateProfileId: profile.id,
      label: `Cupom de ${nome}`,
    },
    create: {
      code: cupom,
      label: `Cupom de ${nome}`,
      discountType: "PERCENT",
      discountValue: DESCONTO_CLIENTE,
      isActive: true,
      affiliateProfileId: profile.id,
    },
  });

  const exemplo = 11990;
  const pago = Math.round(exemplo * (1 - DESCONTO_CLIENTE / 100));
  const comissao = Math.round(pago * (COMISSAO_VENDEDOR / 100));
  const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  console.log(`\n✅ ${role === "AFFILIATE" ? "Criador de conteúdo" : "Vendedor"} pronto!\n`);
  console.log(`   Nome:      ${nome}`);
  console.log(`   Login:     ${email}`);
  console.log(`   Senha:     ${senha}`);
  console.log(`   Cupom:     ${cupom}  (${DESCONTO_CLIENTE}% de desconto para o cliente)`);
  console.log(`   Comissão:  ${COMISSAO_VENDEDOR}% de cada venda com o cupom`);
  console.log(`\n   Exemplo: plano de ${brl(exemplo)} → cliente paga ${brl(pago)} → vendedor ganha ${brl(comissao)}`);
  console.log(`   Ele entra em /login e acompanha as vendas e a comissão na aba Influencer.\n`);
}

main()
  .catch((e) => {
    console.error("\n❌ Erro:", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
