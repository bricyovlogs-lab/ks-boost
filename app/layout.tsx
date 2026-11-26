import './globals.css'
import { Anton, Inter, JetBrains_Mono } from 'next/font/google'

const display = Anton({ weight: '400', subsets: ['latin'], variable: '--vx-font-display' })
const body = Inter({ subsets: ['latin'], variable: '--vx-font-body' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--vx-font-mono' })

export const metadata = {
  title: 'VKS BOOST',
  description: 'Performance gamer profissional',
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }, { url: '/favicon.png', type: 'image/png' }],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>{children}</body>
    </html>
  )
}
