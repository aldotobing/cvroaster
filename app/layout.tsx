import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CV Roaster - AI Powered CV Review',
  description: 'AI Powered CV Review',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
