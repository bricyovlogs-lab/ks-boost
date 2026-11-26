import Link from "next/link";

type Mode = "login" | "register";

const Mail = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>
);
const Lock = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
);
const User = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);
const Arrow = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
);

/** Tela de entrar / criar conta (mesmo visual da página inicial) */
export function AuthShell({ mode, errorMessage }: { mode: Mode; errorMessage?: string | null }) {
  const isLogin = mode === "login";

  return (
    <section className="ax-shell">
      <div className="ax-visual" aria-hidden="true">
        <div className="ax-giant">VKS</div>
        <div className="ax-glow" />
        <img className="ax-gpu" src="/brand/gpu.webp" alt="" />
        <div className="ax-chips">
          <span><b>+FPS</b> ajustes de jogo</span>
          <span><b>-LAG</b> input lag</span>
          <span><b>1</b> clique</span>
        </div>
      </div>

      <div className="ax-copy">
        <div className="ax-eyebrow">{isLogin ? "Área do cliente" : "Criar conta"}</div>
        <h1 className="ax-headline">
          {isLogin ? (<>Bem-vindo<br /><em>de volta.</em></>) : (<>Seu PC no<br /><em>modo competitivo.</em></>)}
        </h1>
        <p className="ax-lead">
          {isLogin
            ? "Suas keys, compras e o download do app em um só lugar."
            : "Cadastre-se para receber sua key, acompanhar compras e baixar o app."}
        </p>
      </div>

      <div className="ax-card">
        <div className="ax-tabs" role="tablist">
          <Link href="/login" className={isLogin ? "is-on" : ""}>Entrar</Link>
          <Link href="/register" className={!isLogin ? "is-on" : ""}>Criar conta</Link>
        </div>

        <h2 className="ax-title">{isLogin ? "Entrar" : "Criar conta"}</h2>
        <p className="ax-sub">{isLogin ? "Use o email e a senha da sua conta." : "Leva menos de um minuto."}</p>

        {errorMessage ? <div className="ax-error" role="alert">{errorMessage}</div> : null}

        <form className="ax-form" method="post" action={isLogin ? "/api/auth/login" : "/api/auth/register"}>
          {!isLogin ? (
            <label className="ax-field">
              <span>Nome</span>
              <div className="ax-input"><User /><input name="name" type="text" placeholder="Seu nome" autoComplete="name" /></div>
            </label>
          ) : null}
          <label className="ax-field">
            <span>Email</span>
            <div className="ax-input"><Mail /><input name="email" type="email" required placeholder="seuemail@exemplo.com" autoComplete="email" /></div>
          </label>
          <label className="ax-field">
            <span>Senha</span>
            <div className="ax-input"><Lock /><input name="password" type="password" required placeholder="••••••••" autoComplete={isLogin ? "current-password" : "new-password"} /></div>
          </label>
          <button className="ax-submit" type="submit">
            {isLogin ? "Entrar" : "Criar minha conta"} <Arrow />
          </button>
        </form>

        <div className="ax-switch">
          {isLogin ? (<>Ainda não tem conta? <Link href="/register">Criar conta</Link></>) : (<>Já tem conta? <Link href="/login">Entrar</Link></>)}
        </div>

        <div className="ax-trust">
          <span>Conexão segura</span>
          <span>Key na hora</span>
          <span>Suporte VKS</span>
        </div>
      </div>
    </section>
  );
}
