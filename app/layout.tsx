import './globals.css'
import { Inter } from 'next/font/google'
import AppBootstrap from '@/components/app-bootstrap'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'DBLJ NavSense - AI Navigation Assistant',
  description: 'Sense the Path. Navigate the World. AI-powered navigation assistant for visually impaired users.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#22c55e',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />
      </head>
      <body className={inter.className}>
        <AppBootstrap />
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
}
