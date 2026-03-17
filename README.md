# VKS BOOST Platform — Mercado Pago

Esta versão foi preparada para teste com **Mercado Pago Checkout Pro** no lugar do Stripe.

## O que mudou
- `POST /api/checkout/create-session` agora cria uma **preferência de pagamento** no Mercado Pago e redireciona o cliente para o checkout. citeturn624285search0turn225488search1
- O projeto agora recebe notificações em `POST /api/mercadopago/webhook`, usando o fluxo de **Webhooks/Notifications** do Mercado Pago. O Mercado Pago documenta que as notificações podem ser configuradas por URL e que há **assinatura secreta** nas notificações Webhooks. citeturn753222search2turn225488search0turn753222search7
- Quando o pagamento chega como **approved**, o sistema:
  - confirma o pagamento
  - gera/libera a licença
  - salva no banco
  - envia email
  - manda aviso no Discord

## Variáveis de ambiente
Edite o `.env` com:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vks_boost"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/vks_boost"

JWT_SECRET="troque-por-uma-chave-longa"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

MERCADOPAGO_ACCESS_TOKEN="APP_USR-xxxxxxxx"
MERCADOPAGO_WEBHOOK_SECRET=""

RESEND_API_KEY="re_xxx"
MAIL_FROM="VKS BOOST <no-reply@seudominio.com>"
DOWNLOAD_URL="https://seudominio.com/download/VKS-BOOST-Setup.exe"

ADMIN_EMAIL="admin@vksboost.com"
ADMIN_PASSWORD="12345678"

DISCORD_WEBHOOK_SALES=""
DISCORD_WEBHOOK_PAYOUTS=""
```

## Rodar localmente
```bash
npm install
npx prisma generate
npm run dev
```

## Configurar webhook no Mercado Pago
No painel do Mercado Pago, configure a URL:
```text
http://localhost:3000/api/mercadopago/webhook
```

Para produção:
```text
https://seu-dominio.com/api/mercadopago/webhook
```

## Fluxo esperado
1. Cliente escolhe o plano e vai para o checkout.
2. Mercado Pago cria a preferência e abre o checkout.
3. Após pagamento aprovado, o webhook do Mercado Pago chama seu backend. O Mercado Pago descreve esse uso de Webhooks para atualizar pedidos e status em tempo real. citeturn624285search1turn225488search2
4. O backend gera a key, salva a venda, manda email e envia notificação no Discord.

## Observação
Esta adaptação foi feita para **teste rápido em cima dos seus arquivos atuais**. Alguns campos do banco ainda mantêm nomes legados de Stripe (`stripeSessionId`, etc.), mas o fluxo já foi redirecionado para Mercado Pago para você conseguir validar localmente.
