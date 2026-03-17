export default function RegisterPage() {
  return (
    <section className="login-shell">
      <div className="login-card-v8">
        <div className="login-panel-info">
          <div className="badge">Criar conta</div>
          <h1>
            Comece sua experiência com o <span className="hero-highlight">VKS BOOST</span>
          </h1>
          <p>
            Cadastre sua conta para centralizar licenças, compras, downloads e todo o
            histórico do seu acesso em uma área premium.
          </p>
          <div className="login-bullets">
            <div>🔑 Licenças organizadas em um só lugar.</div>
            <div>💳 Histórico de compras e planos.</div>
            <div>🎯 Acesso rápido ao painel do cliente.</div>
          </div>
        </div>

        <div className="login-panel-form">
          <h1 className="auth-title">Criar conta</h1>
          <p className="auth-subtitle">Preencha seus dados para cadastrar seu acesso.</p>
          <form className="form" method="post" action="/api/auth/register">
            <div className="form-split">
              <div className="field">
                <label>Nome</label>
                <input className="input" name="name" type="text" />
              </div>
              <div className="field">
                <label>Email</label>
                <input className="input" name="email" type="email" required />
              </div>
            </div>
            <div className="field">
              <label>Senha</label>
              <input className="input" name="password" type="password" required />
            </div>
            <button className="primary-button" type="submit">Criar conta</button>
          </form>
        </div>
      </div>
    </section>
  );
}
