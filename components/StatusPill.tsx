export function Status({ s }: { s: string }) {
  const map: Record<string, [string, string]> = {
    APPROVED: ['Aprovado', 'ok'], PAID: ['Pago', 'ok'], ACTIVE: ['Ativa', 'ok'],
    PENDING: ['Pendente', 'wait'], REJECTED: ['Recusado', 'bad'], BLOCKED: ['Bloqueada', 'bad'], EXPIRED: ['Expirada', 'bad'],
  }
  const [label, tone] = map[s] || [s, 'wait']
  return <span className={`px-pill px-pill--${tone}`}>{label}</span>
}
