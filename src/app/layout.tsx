// FILE: src/app/layout.tsx
import type { Metadata } from 'next'
import { DM_Serif_Display, DM_Sans, DM_Mono } from 'next/font/google'
import '@livekit/components-styles'
import './globals.css'

const display = DM_Serif_Display({ subsets: ['latin'], weight: ['400'], variable: '--font-display' })
const body    = DM_Sans({ subsets: ['latin'], variable: '--font-body' })
const mono    = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'VocalHQ — AI Voice Receptionist',
  description: 'Deploy AI receptionists that handle real calls 24/7.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="bg-surface-0 font-body text-surface-950 antialiased">{children}</body>
    </html>
  )
}