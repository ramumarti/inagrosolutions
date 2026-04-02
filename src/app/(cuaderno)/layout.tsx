import type { Metadata } from "next";
import { Home, NotebookPen, Map, Settings } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cuaderno MAPA",
  description: "Cuaderno Digital Modular para Agricultores",
};

export default function CuadernoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-base-100)] text-white font-sans relative overflow-x-hidden">
      {/* Background Orbs (Consistent with Dashboard) */}
      <div className="fixed top-[10%] left-[10%] w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] rounded-full bg-[var(--color-primary)]/10 blur-[120px] animate-pulse pointer-events-none z-0" style={{ animationDuration: '12s' }} />
      <div className="fixed bottom-[10%] right-[10%] w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] rounded-full bg-emerald-500/5 blur-[120px] animate-pulse pointer-events-none z-0" style={{ animationDuration: '15s', animationDelay: '2s' }} />

      {/* Top App Bar (Premium Digital Identity) */}
      <header className="bg-[var(--color-base-200)]/40 text-white py-4 px-4 shadow-lg sticky top-0 z-50 flex justify-center items-center backdrop-blur-xl border-b border-white/10">
        <h1 className="text-xs font-black tracking-[0.3em] uppercase">SIEX <span className="text-[var(--color-primary)] font-light opacity-80 pl-1">CUADERNO</span></h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-4 mb-24 relative z-10">
        {children}
      </main>

      {/* Bottom Navigation (Mobile Premium) */}
      <nav className="fixed bottom-0 w-full bg-[var(--color-base-300)]/80 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center h-20 shadow-[0_-8px_40px_rgba(0,0,0,0.4)] z-50 pb-safe px-2">
        <Link href="/cuaderno" className="flex flex-col items-center justify-center w-full h-full text-emerald-400 transition-all active:scale-90">
          <div className="bg-emerald-500/10 p-2 rounded-xl mb-1 mt-0.5 border border-emerald-500/10">
            <Home size={20} className="fill-emerald-400/10" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider">Hoy</span>
        </Link>
        <Link href="/cuaderno/labores" className="flex flex-col items-center justify-center w-full h-full text-white/40 hover:text-emerald-400 transition-all active:scale-90">
          <NotebookPen size={22} className="mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-[0.05em]">Registro</span>
        </Link>
        <Link href="/cuaderno/premium" className="flex flex-col items-center justify-center w-full h-full text-indigo-400 transition-all active:scale-95">
          <div className="relative mb-1">
             <svg className="w-6 h-6 animate-pulse drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Premium</span>
        </Link>
        <Link href="/cuaderno/ajustes" className="flex flex-col items-center justify-center w-full h-full text-white/40 hover:text-emerald-400 transition-all active:scale-90">
          <Settings size={22} className="mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-[0.05em]">Ajustes</span>
        </Link>
      </nav>

    </div>
  );
}
