# VKS BOOST Platform

Base completa para vendas, licenciamento, cupons e painel de influenciadores/revendedores do VKS BOOST.

## Rodar localmente

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Stripe local

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Depois copie o `whsec_...` para `STRIPE_WEBHOOK_SECRET`.

## Endpoints do app
- `POST /api/license/validate`
- `POST /api/license/activate`
- `POST /api/license/check`
- `POST /api/license/deactivate`

## Painéis
- Cliente: `/dashboard`
- Admin: `/admin`
- Influencer/Revendedor: `/influencer`
- Gestão de cupons: `/admin/coupons`

## Seed
Cria:
- admin usando `ADMIN_EMAIL` e `ADMIN_PASSWORD`
- influencer demo `influencer@vksboost.com / 12345678`


## v10 final de deploy
- layout final mais polido para admin e cupons
- área de criação de cupom ampliada
- checklist visual de deploy
- pronto para etapa final de integração e publicação


## v11 deploy real
- Discord webhooks para venda aprovada e solicitação de saque
- área de saque para influencer/revendedor
- cadastro de nome PIX e chave PIX
- histórico de solicitações de saque
- variáveis novas:
  - DISCORD_WEBHOOK_SALES
  - DISCORD_WEBHOOK_PAYOUTS

### Passos após atualizar
```bash
npx prisma generate
npx prisma migrate dev --name payout_requests
npm run dev
```


## v12 produção final
- painel admin para aprovar, rejeitar e marcar saques como pagos
- ajuste automático de `pendingPayoutCents` e `paidOutCents`
- área de saque completa para influencer/revendedor
- integração pronta para webhooks do Discord:
  - venda aprovada
  - solicitação de saque
- nova página admin: `/admin/payouts`

### Rodar após atualizar
```bash
npx prisma generate
npx prisma migrate dev --name admin_payout_flow
npm run dev
```


## v13 release candidate
- correção do bug visual na sidebar da página de cupons
- ícones e opções do admin agora seguem o mesmo padrão do dashboard
- link de saques mantido em todas as telas do admin
- ajuste visual na tabela de cupons para reduzir inconsistências de layout

### Rodar
```bash
npm install
npx prisma generate
npm run dev
```


## v14 stable
- padronização final da sidebar nas telas do admin
- correção de inconsistência visual entre dashboard, cupons e saques
- estabilização visual dos ícones e links
- ajuste do painel influencer para navegação mais segura
- melhorias de consistência no layout e nas tabelas

### Rodar
```bash
npm install
npx prisma generate
npm run dev
```


## v15 production hardening
- headers de segurança via middleware
- proteção de rotas sensíveis no edge
- rate limiting básico em licenças e saques
- health check em `/api/health`
- auditoria centralizada em ações sensíveis
- documentação de deploy de produção em `DEPLOY_PRODUCTION.md`

### Rodar local
```bash
npm install
npx prisma generate
npm run dev
```

### Deploy produção
```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
```


## v16 final release
- corrigido erro de build no middleware
- verificação de sessão movida para helper edge-safe
- compatibilidade melhor com Turbopack / middleware do Next.js
- auth principal continua funcionando com cookies e prisma


## v17 anti compartilhamento de key profissional
- proteção profissional por dispositivo com vínculo de HWID
- HWID agora é armazenado com hash no banco
- ativação bloqueia uso da mesma key em outro PC
- endpoints de licença limpos e estabilizados
- `.env.example` já preenchido com seus `STRIPE_PRICE_*`

### Prices configurados
- 30 dias: `price_1TBn6xDEt5gD3KriL19qqFlH`
- 90 dias: `price_1TBn8ZDEt5gD3Kri2zYc5WNL`
- Vitalícia: `price_1TBn9bDEt5gD3Krif3gIqJKu`


## Fix final Mercado Pago
- removidos erros restantes da Stripe no build
- checkout principal usando Mercado Pago
- webhook principal usando Mercado Pago
- correção de tipagem do payout route
- projeto preparado para deploy com Vercel + Neon + Mercado Pago
