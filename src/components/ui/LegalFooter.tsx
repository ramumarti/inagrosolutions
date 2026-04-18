import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

export function LegalFooter() {
  return (
    <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
          <TrendingUp className="text-white w-5 h-5" />
        </div>
        <span className="text-lg font-bold tracking-tight">InagroSolutions</span>
      </div>
      <div className="text-sm text-white/30 flex gap-8">
        <Link href="/legal-notice" className="hover:text-white transition-colors">Aviso Legal</Link>
        <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacidad</Link>
        <Link href="/partner-policy" className="hover:text-white transition-colors underline decoration-[var(--color-primary)]/30">Política de Partners</Link>
      </div>
      <div className="text-sm text-white/20">
        © {new Date().getFullYear()} InagroSolutions. Todos los derechos reservados.
      </div>
    </div>
  );
}
