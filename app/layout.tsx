import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trading Chart Analyzer - AI-Powered Analysis',
  description: 'Upload trading chart screenshots and get AI-powered analysis including pair detection, timeframe analysis, trend analysis, and trading signals.',
  keywords: 'trading, chart analysis, AI, cryptocurrency, forex, technical analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}