import Link from "next/link";

export default function SuccessPage() {
  return (
    <section className="panel">
      <div className="container">
        <div className="card" style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="badge">Pagamento confirmado</div>
          <h1 style={{ marginTop: 0 }}>Sua compra foi aprovada com sucesso.</h1>
          <p className="muted" style={{ fontSize: 18, lineHeight: 1.8 }}>
            O sistema já iniciou o processo de liberação da sua key. Assim que o webhook confirmar a transação,
            sua licença será enviada para o email cadastrado e também poderá aparecer no seu painel de cliente.
          </p>

          <div className="grid-3" style={{ marginTop: 28 }}>
            <div className="card">
              <h3>1. Pagamento aprovado</h3>
              <p className="muted">Sua compra foi recebida com segurança.</p>
            </div>
            <div className="card">
              <h3>2. Key gerada</h3>
              <p className="muted">A licença é vinculada ao seu pedido automaticamente.</p>
            </div>
            <div className="card">
              <h3>3. Entrega por email</h3>
              <p className="muted">Você recebe a key e as instruções de ativação.</p>
            </div>
          </div>

          <div className="buy-now-strip" style={{ marginTop: 28 }}>
            <strong>Dica:</strong> entre no painel do cliente para acompanhar suas licenças, histórico e link oficial de download.
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
            <Link href="/dashboard" className="primary-button">Ir para meu painel</Link>
            <Link href="/" className="secondary-button">Voltar para o site</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
