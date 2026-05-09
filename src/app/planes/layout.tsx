import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { LegalFooter } from '@/components/ui/LegalFooter';
import { PlanesNavbar } from './PlanesNavbar';
import { Suspense } from 'react';

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
      <Suspense fallback={<nav className="absolute top-0 left-0 right-0 z-50 h-20 border-b border-white/5 bg-black/50 backdrop-blur-md" />}>
        <PlanesNavbar />
      </Suspense>

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
