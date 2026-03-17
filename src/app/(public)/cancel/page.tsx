import Link from "next/link";

export default function CancelPage() {
  return (
    <section className="panel">
      <div className="container">
        <div className="card">
          <div className="badge">Pagamento cancelado</div>
          <h1>Compra não finalizada</h1>
          <p className="muted">Você pode voltar e tentar novamente quando quiser.</p>
          <div style={{ marginTop: 24 }}>
            <Link href="/#planos" className="primary-button">Ver planos novamente</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
