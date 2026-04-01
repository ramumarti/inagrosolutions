import { Lock, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

interface PremiumLockProps {
  hasAccess: boolean;
  moduleName: string;
  description: string;
  children: React.ReactNode;
}

export default function PremiumLock({ hasAccess, moduleName, description, children }: PremiumLockProps) {
  if (hasAccess) return <>{children}</>;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-black rounded-3xl p-6 text-white shadow-xl shadow-indigo-900/20 border border-indigo-500/30 w-full animate-in fade-in duration-500">
      
      {/* Glow effects */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        <div className="bg-indigo-500/20 p-4 rounded-2xl border border-indigo-400/30 shadow-inner">
          <Lock className="text-indigo-300" size={36} />
        </div>
        
        <div>
          <h2 className="text-xl font-extrabold tracking-tight flex items-center justify-center gap-2">
            Módulo <span className="bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">{moduleName}</span>
          </h2>
          <p className="text-sm text-indigo-200/80 mt-2 max-w-xs mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full backdrop-blur-sm mt-2 mb-2 text-left space-y-3">
          <div className="flex items-start gap-3">
            <TrendingUp size={16} className="text-emerald-400 mt-0.5 shrink-0" />
            <span className="text-xs text-indigo-100 font-medium leading-tight">Controla márgenes y costes laborales por cada parcela.</span>
          </div>
          <div className="flex items-start gap-3">
            <Sparkles size={16} className="text-cyan-400 mt-0.5 shrink-0" />
            <span className="text-xs text-indigo-100 font-medium leading-tight">Visualiza proyecciones de rendimiento de tu cosecha en tiempo real.</span>
          </div>
        </div>

        <Link href="/cuaderno/planes" className="w-full">
          <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 active:scale-[0.98] transition-all text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 border border-indigo-400/50">
            Actualizar a Premium
          </button>
        </Link>
        <button className="text-xs text-indigo-300 hover:text-white transition-colors underline underline-offset-4 mt-1">
          Comparar Planes
        </button>
      </div>
    </div>
  );
}
