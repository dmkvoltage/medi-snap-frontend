import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
}

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'MediSnap - Medical Document Translator',
  description: 'Instantly translate complex medical documents into plain language using AI. Privacy-first PWA with zero data persistence.',
  generator: 'MediSnap',
  keywords: ['medical', 'document', 'translation', 'AI', 'healthcare', 'privacy'],
  authors: [{ name: 'MediSnap' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://medisnap.app',
    siteName: 'MediSnap',
    title: 'MediSnap - Medical Document Translator',
    description: 'Instantly translate complex medical documents into plain language',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MediSnap',
    description: 'Medical document translator powered by AI',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${_geist.variable} ${_geistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
