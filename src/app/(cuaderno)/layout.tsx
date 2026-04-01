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
      {/* Top App Bar */}
      <header className="bg-green-700 text-white p-4 shadow-md sticky top-0 z-50 flex justify-center items-center">
        <h1 className="text-lg font-bold tracking-wide">SIEX <span className="font-light">CUADERNO</span></h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-4 mb-20 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation (Mobile First) */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] z-50 pb-safe">
        <Link href="/cuaderno" className="flex flex-col items-center justify-center w-full h-full text-green-700">
          <Home size={22} className="mb-1" />
          <span className="text-[10px] font-semibold uppercase tracking-wider">Hoy</span>
        </Link>
        <Link href="/cuaderno/labores" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-green-700 transition-colors">
          <NotebookPen size={22} className="mb-1" />
          <span className="text-[10px] font-semibold uppercase tracking-wider">Registro</span>
        </Link>
        <Link href="/cuaderno/premium" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-indigo-600 transition-colors">
          <svg className="mb-1 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Premium</span>
        </Link>
        <Link href="/cuaderno/ajustes" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-green-700 transition-colors">
          <Settings size={22} className="mb-1" />
          <span className="text-[10px] font-semibold uppercase tracking-wider">Ajustes</span>
        </Link>
      </nav>
    </div>
  );
}
