import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";
import { getSessionUser } from "@/lib/auth";

export const metadata = {
  title: "VKS BOOST",
  description: "Licenciamento e vendas do VKS BOOST",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  return (
    <html lang="pt-BR">
      <body>
        <header className="site-header">
          <div className="container nav">
            <Link href="/" className="brand">
              <span className="brand-accent">VKS</span> BOOST
            </Link>
            <nav className="nav-links">
              <Link href="/#beneficios">Benefícios</Link>
              <Link href="/#planos">Planos</Link>
              <Link href="/#faq">FAQ</Link>
              {user ? (
                <>
                  <Link href="/dashboard">Cliente</Link>
                  {(user.role === "AFFILIATE" || user.role === "RESELLER" || user.role === "ADMIN") ? (
                    <Link href="/influencer">Influencer</Link>
                  ) : null}
                  {user.role === "ADMIN" ? <Link href="/admin">Admin</Link> : null}
                  <form action="/api/auth/logout" method="post">
                    <button className="ghost-button" type="submit">Sair</button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login">Entrar</Link>
                  <Link href="/register" className="primary-button">Criar conta</Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
