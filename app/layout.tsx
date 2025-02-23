import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nostr0 - Nostr Client',
  description: 'A beautiful Nostr client for viewing user notes',
  icons: {
    icon: '/nostr0.png', // Esto apunta a /public/nostr0.png
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
