# Integração VKS Precision FIX com o site VKS BOOST

Rotas adicionadas:

- `POST /api/auth/precision-login`
- `POST /api/auth/app-login`
- `GET /api/license/check`
- `POST /api/license/check`

## Login do app Precision Fix

URL em produção:

```txt
https://vks-boost.com/api/auth/precision-login
```

Body:

```json
{
  "email": "cliente@email.com",
  "password": "senha",
  "product_type": "PRECISSION_FIX",
  "device_id": "HWID_DO_PC"
}
```

O app só deve abrir quando a API retornar:

```json
{
  "success": true,
  "can_open_app": true
}
```

## Verificação ao abrir o app

URL:

```txt
https://vks-boost.com/api/license/check
```

Body:

```json
{
  "token": "JWT_RECEBIDO_NO_LOGIN",
  "key": "VKS-PREC-XXXXX",
  "product_type": "PRECISSION_FIX",
  "device_id": "HWID_DO_PC"
}
```

## Produtos aceitos

- `OPTIMIZER`
- `PRECISSION_FIX`
- `CROSSHAIR`

O app VKS Precision FIX deve enviar sempre `PRECISSION_FIX`.

## Depois de copiar/subir

Rode no projeto do site:

```bash
npx prisma generate
npx prisma db push
git add .
git commit -m "Adicionar API do app Precision Fix"
git push
```

Na Vercel, faça Redeploy sem cache.
