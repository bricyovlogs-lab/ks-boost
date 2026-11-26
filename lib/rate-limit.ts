/**
 * Limite de tentativas por IP (anti-força-bruta e anti-spam).
 * Fica na memória de cada servidor da Vercel: não é perfeito, mas corta a grande maioria dos robôs.
 */
const buckets = new Map<string, number[]>()

export function clientIp(req: Request) {
  const fwd = req.headers.get('x-forwarded-for') || ''
  return fwd.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown'
}

/** true = pode seguir; false = passou do limite */
export function allow(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs)
  if (hits.length >= limit) {
    buckets.set(key, hits)
    return false
  }
  hits.push(now)
  buckets.set(key, hits)
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.length || now - v[v.length - 1] > windowMs) buckets.delete(k)
  }
  return true
}

export function tooMany(message = 'Muitas tentativas. Aguarde alguns minutos e tente de novo.') {
  return Response.json({ ok: false, success: false, message }, { status: 429 })
}
