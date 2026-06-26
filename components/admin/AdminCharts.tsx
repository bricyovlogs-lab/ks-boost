export function BarChartCard() {
  const bars = [42, 68, 53, 91, 76, 88, 64]
  const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  return (
    <div className="rounded-3xl bg-vks-card border border-red-500/20 p-6 glow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black">Vendas da semana</h3>
          <p className="text-sm text-zinc-400">Movimento dos últimos 7 dias</p>
        </div>
        <span className="rounded-full bg-red-500/15 px-3 py-1 text-sm text-red-300">+24%</span>
      </div>
      <div className="flex h-56 items-end gap-3">
        {bars.map((bar, i) => (
          <div key={labels[i]} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full rounded-t-2xl bg-gradient-to-t from-red-700 to-red-400 shadow-[0_0_22px_rgba(255,23,68,.35)]" style={{ height: `${bar}%` }} />
            <span className="text-xs text-zinc-500">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DonutChartCard() {
  return (
    <div className="rounded-3xl bg-vks-card border border-red-500/20 p-6 glow">
      <h3 className="text-xl font-black">Produtos ativos</h3>
      <p className="text-sm text-zinc-400 mb-6">Distribuição por licença</p>
      <div className="flex items-center gap-7">
        <div className="h-44 w-44 rounded-full grid place-items-center bg-[conic-gradient(#ff1744_0_48%,#ef4444_48%_82%,#7f1d1d_82%_100%)] shadow-[0_0_45px_rgba(255,23,68,.25)]">
          <div className="h-24 w-24 rounded-full bg-vks-card grid place-items-center border border-red-500/20">
            <b className="text-2xl text-red-400">100%</b>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <p><span className="text-red-400">●</span> Optimizer</p>
          <p><span className="text-red-300">●</span> Precission FIX</p>
          <p><span className="text-red-800">●</span> Crosshair</p>
        </div>
      </div>
    </div>
  )
}
