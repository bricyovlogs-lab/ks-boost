import './globals.css'

export const metadata = {
  title: 'VKS BOOST',
  description: 'Performance gamer profissional',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>
}
