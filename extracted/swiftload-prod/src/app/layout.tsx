import type { Metadata, Viewport } from 'next'
import { Inter, Barlow_Condensed } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from '@/components/layout/Providers'
import { AmbientBackground } from '@/components/layout/AmbientBackground'
import { Toaster } from 'sonner'

const inter = Inter({ subsets:['latin'], variable:'--font-inter', display:'swap' })
const barlow = Barlow_Condensed({ subsets:['latin'], weight:['700','800','900'], variable:'--font-barlow', display:'swap' })

export const metadata: Metadata = {
  title: { default:'Pronto SwiftLoad — Africa\'s Logistics OS', template:'%s | SwiftLoad' },
  description: 'Find verified trucks in minutes. AI matching, secure escrow, live GPS tracking. Botswana\'s #1 digital freight marketplace.',
  keywords: ['freight','logistics','truck','delivery','Botswana','escrow','GPS tracking','Africa','marketplace'],
  authors: [{ name:'Pronto SwiftLoad (Pty) Ltd' }],
  creator: 'Pronto SwiftLoad',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://swiftload.co.bw'),
  openGraph: {
    type: 'website', siteName: 'Pronto SwiftLoad',
    title: 'Pronto SwiftLoad — Got A Load? Get A Truck.',
    description: 'Botswana\'s digital freight marketplace. AI matching, escrow payments, live GPS.',
    locale: 'en_BW',
  },
  twitter: { card:'summary_large_image', creator:'@swiftloadbw' },
  manifest: '/manifest.json',
  icons: {},
  robots: { index:true, follow:true },
  alternates: { canonical:'https://swiftload.co.bw' },
}

export const viewport: Viewport = {
  themeColor: '#080E1A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${barlow.variable}`}>
      <body className="bg-brand-navy text-white antialiased font-body">
        <AmbientBackground />
        <Providers>
          {children}
          <Toaster position="bottom-right" theme="dark" richColors closeButton />
        </Providers>
      </body>
    </html>
  )
}
