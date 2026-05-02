import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { LegalFooter } from '@/components/ui/LegalFooter';

export const metadata = {
  title: 'Planes Cuaderno Digital Agrícola | InagroSolutions',
  description: 'Elige el plan de Cuaderno de Campo Digital para tu explotación. Cumple SIEX, gestiona parcelas y fitosanitarios cómodamente.',
  openGraph: {
    title: 'Cuaderno Digital para Agricultores | InagroSolutions',
    description: 'Gestiona tu explotación desde el móvil o el ordenador.',
    images: ['/icon.png'],
  },
};

export default function PlanesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white relative">
      <nav className="absolute top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/planes" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <TrendingUp className="text-black w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Inagro<span className="text-emerald-500">Solutions</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <Link href="/planes" className="hover:text-emerald-500 transition-colors">Planes</Link>
            <a href="#faqs" className="hover:text-emerald-500 transition-colors">FAQs</a>
            <a href="#contacto" className="hover:text-emerald-500 transition-colors">Contacto</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <GlowButton variant="secondary" className="hidden sm:flex border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10">
                Acceso
              </GlowButton>
            </Link>
            <Link href="/signup">
              <GlowButton className="bg-emerald-500 text-black hover:bg-emerald-400 border-none shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                Empezar
              </GlowButton>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {children}
      </main>

      <footer className="py-12 bg-black/60 relative overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LegalFooter />
        </div>
      </footer>
    </div>
  );
}
