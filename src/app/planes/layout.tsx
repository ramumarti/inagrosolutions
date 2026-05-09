import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { LegalFooter } from '@/components/ui/LegalFooter';

export const metadata = {
  title: 'Planes Cuaderno Digital Agrícola | Plataforma Oficial',
  description: 'Elige el plan de Cuaderno de Campo Digital para tu explotación. Cumple SIEX, gestiona parcelas y fitosanitarios cómodamente.',
  openGraph: {
    title: 'Cuaderno Digital para Agricultores | Plataforma Oficial',
    description: 'Gestiona tu explotación desde el móvil o el ordenador.',
    images: ['/icon.png'],
  },
};

export default function PlanesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white relative">
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
