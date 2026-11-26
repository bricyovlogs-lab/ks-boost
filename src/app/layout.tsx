import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";
import { getSessionUser } from "@/lib/auth";
import { Anton, Inter, JetBrains_Mono } from "next/font/google";

const display = Anton({ weight: "400", subsets: ["latin"], variable: "--vx-font-display" });
const body = Inter({ subsets: ["latin"], variable: "--vx-font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--vx-font-mono" });

export const metadata = {
  title: "VKS BOOST",
  description: "Licenciamento e vendas do VKS BOOST",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    title: "VKS BOOST",
    description: "Licenciamento e vendas do VKS BOOST",
    images: ["/vks-boost-logo.png"],
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  return (
    <html lang="pt-BR">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        <header className="site-header">
          <div className="container nav">
            <Link href="/" className="brand" aria-label="VKS BOOST">
              <svg width="54" height="26" viewBox="0 -6 122 58" aria-hidden="true">
                <g fill="none" stroke="#F5F5F5" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6,14 L18,46 L30,14" />
                  <path d="M48,0 V46" />
                  <path d="M68,14 L52,31 L68,46" />
                  <path d="M102.9,18 A8,8 0 1 0 96,30 A8,8 0 1 1 89.1,42" />
                </g>
                <circle cx="114.5" cy="45.5" r="6" fill="#E10600" />
              </svg>
              <span className="brand-sub">BOOST</span>
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
