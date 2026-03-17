export default function LoginPage() {
  return (
    <section className="login-shell">
      <div className="login-card-v8">
        <div className="login-panel-info">
          <div className="badge">Acesso oficial</div>
          <h1>
            Entre na sua <span className="hero-highlight">conta</span> VKS BOOST
          </h1>
          <p>
            Acesse seu painel de cliente, visualize suas licenças, acompanhe compras
            e mantenha tudo centralizado em uma experiência premium.
          </p>
          <div className="login-bullets">
            <div>⚡ Visualize suas keys e status de ativação.</div>
            <div>🧾 Confira pagamentos e histórico de compras.</div>
            <div>🚀 Baixe o aplicativo pelo link oficial.</div>
          </div>
        </div>

        <div className="login-panel-form">
          <h1 className="auth-title">Entrar</h1>
          <p className="auth-subtitle">Use seu email e senha para acessar o sistema.</p>
          <form className="form" method="post" action="/api/auth/login">
            <div className="field">
              <label>Email</label>
              <input className="input" name="email" type="email" required />
            </div>
            <div className="field">
              <label>Senha</label>
              <input className="input" name="password" type="password" required />
            </div>
            <button className="primary-button" type="submit">Entrar</button>
          </form>
        </div>
      </div>
    </section>
  );
}
