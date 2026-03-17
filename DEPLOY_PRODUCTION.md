# V15 Production Hardening

## Checklist
1. Configure PostgreSQL de produção.
2. Configure Stripe com chaves de produção.
3. Configure `DISCORD_WEBHOOK_SALES` e `DISCORD_WEBHOOK_PAYOUTS`.
4. Configure domínio do email e remetente.
5. Rode:
   - `npx prisma generate`
   - `npx prisma migrate deploy`
6. Faça smoke tests em:
   - `/api/health`
   - login
   - checkout
   - webhook Stripe
   - painel admin
   - saque de parceiro

## Segurança adicionada
- middleware com headers de segurança
- proteção de rotas admin/partner
- rate limiting básico em APIs críticas
- logs de auditoria centralizados
- endpoint de health check
