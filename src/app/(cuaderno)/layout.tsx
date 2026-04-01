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
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      {/* Top App Bar (Premium Digital Identity) */}
      <header className="bg-emerald-900 text-white py-3 px-4 shadow-lg sticky top-0 z-50 flex justify-center items-center backdrop-blur-sm bg-opacity-95 border-b border-white/5">
        <h1 className="text-sm font-black tracking-[0.2em] uppercase">SIEX <span className="font-light opacity-80">CUADERNO</span></h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-4 mb-20 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation (Mobile Premium) */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 flex justify-around items-center h-20 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] z-50 pb-safe px-2">
        <Link href="/cuaderno" className="flex flex-col items-center justify-center w-full h-full text-emerald-800 transition-all active:scale-90">
          <div className="bg-emerald-50 p-2 rounded-xl mb-1 mt-0.5">
            <Home size={20} className="fill-emerald-800/10" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider">Hoy</span>
        </Link>
        <Link href="/cuaderno/labores" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-emerald-800 transition-all active:scale-90">
          <NotebookPen size={22} className="mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-[0.05em]">Registro</span>
        </Link>
        <Link href="/cuaderno/premium" className="flex flex-col items-center justify-center w-full h-full text-indigo-600 transition-all active:scale-95">
          <div className="relative mb-1">
             <svg className="w-6 h-6 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Premium</span>
        </Link>
        <Link href="/cuaderno/ajustes" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-emerald-800 transition-all active:scale-90">
          <Settings size={22} className="mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-[0.05em]">Ajustes</span>
        </Link>
      </nav>

    </div>
  );
}
