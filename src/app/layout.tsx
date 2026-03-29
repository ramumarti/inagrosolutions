import type { Metadata } from 'next'
import './globals.css'
import { I18nProvider } from '@/lib/i18n'
import { ToastProvider } from '@/components/ui/Toast'
import { CookieBanner } from '@/components/ui/CookieBanner'

export const metadata: Metadata = {
  title: 'IASOLUTIONS',
  description: 'Tu portal de micro aplicaciones',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased font-sans flex flex-col min-h-screen">
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
