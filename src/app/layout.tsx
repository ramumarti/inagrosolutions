import type { Metadata, Viewport } from 'next'
import './globals.css'
import { I18nProvider } from '@/lib/i18n'
import { ToastProvider } from '@/components/ui/Toast'
import { CookieBanner } from '@/components/ui/CookieBanner'

export const metadata: Metadata = {
  title: 'Inagrosolutions',
  description: 'GestiÃ³n AgrÃ­cola Inteligente y Cuaderno de Campo SIEX',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased font-sans flex flex-col min-h-screen" suppressHydrationWarning>
        <I18nProvider>
          <ToastProvider>
            {children}
            <CookieBanner />
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
