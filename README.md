# VKS BOOST Site

Stack: Next.js, Tailwind CSS, TypeScript, Prisma e Neon PostgreSQL.

## Rodar local
1. `npm install`
2. Copie `.env.example` para `.env` e coloque a `DATABASE_URL` do Neon.
3. `npx prisma db push`
4. `npm run dev`

Rotas principais: `/`, `/login`, `/register`, `/cliente`, `/admin`, `/revendedor`.

API de licença: `GET /api/license/check?email=&key=&product_type=OPTIMIZER&device_id=`


## Video de fundo
Para usar video local sem botoes do YouTube e com menos lag, coloque o arquivo em `public/videos/hero.mp4`. Recomendado MP4 1080p, sem audio, 20-30s, comprimido.
