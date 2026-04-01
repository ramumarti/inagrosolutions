import { Sprout, Tractor, CloudRain, AlertTriangle, FileText, Droplets, Bug, ShoppingBasket, Trash2, FileSpreadsheet, HelpCircle } from "lucide-react";
import Link from "next/link";
import { SmartAssistant } from "@/components/agriculture/SmartAssistant";

export default function HoyPage() {
  return (
    <div className="space-y-6 max-w-lg mx-auto pb-8 px-4 sm:px-0">
      {/* Cabecera con Acción de Reporte y Ayuda */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Mi Cuaderno</h1>
          <p className="text-sm text-gray-500 font-medium tracking-wide uppercase mt-0.5">Campaña 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/cuaderno/ayuda">
            <button 
              title="Manual de Usuario"
              className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm border border-gray-100 hover:bg-blue-50 transition-all active:scale-95"
            >
              <HelpCircle size={22} />
            </button>
          </Link>
          <button 
            title="Exportar SIEX"
            className="p-3 bg-white rounded-2xl text-green-600 shadow-sm border border-gray-100 hover:bg-green-50 transition-all active:scale-95"
          >
            <FileSpreadsheet size={22} />
          </button>
        </div>
      </div>

      {/* Alertas Inteligentes (IA) */}
      <SmartAssistant />

      {/* Resumen Superior */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

        <h2 className="text-sm text-gray-500 font-medium mb-1 uppercase tracking-wider">Hoy en la Parcela</h2>
        <div className="flex items-center justify-between">
          <p className="text-3xl font-extrabold text-gray-900 tracking-tight">12 Abr</p>
          <div className="flex items-center bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full">
            <CloudRain size={18} className="mr-1.5" />
            <span className="font-bold text-sm">22°C</span>
          </div>
        </div>
      </div>

      {/* Alertas UX (Cumplimiento legal) */}
      <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
        <div className="bg-amber-100 p-2.5 rounded-2xl mt-0.5">
          <AlertTriangle className="text-amber-600" size={22} />
        </div>
        <div>
          <h3 className="font-bold text-amber-900 text-sm">Cumplimiento SIEX / PAC</h3>
          <p className="text-sm text-amber-800/80 mt-1 leading-relaxed">
            Recordatorio: Las parcelas de Olivar Superintensivo requieren registros de riego mensuales para ser elegibles para la ayuda eco-régimen.
          </p>
        </div>
      </div>

      {/* Accesos Rápidos (Cuaderno Digital Completo) */}
      <div className="pt-2">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Módulos del Cuaderno</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/cuaderno/tratamientos/nuevo">
            <button className="w-full flex-col items-center justify-center bg-green-50 hover:bg-green-100 border border-green-200 transition-colors h-32 rounded-3xl gap-3 flex shadow-sm group">
              <div className="bg-green-600 group-hover:scale-110 transition-transform rounded-2xl p-3 text-white shadow-md shadow-green-600/20">
                <Sprout size={24} />
              </div>
              <span className="font-semibold text-green-900 text-sm">Fitosanitario</span>
            </button>
          </Link>

          <Link href="/cuaderno/labores/nuevo">
            <button className="w-full flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors h-32 rounded-3xl gap-3 flex shadow-sm group">
              <div className="bg-blue-600 group-hover:scale-110 transition-transform rounded-2xl p-3 text-white shadow-md shadow-blue-600/20">
                <Tractor size={24} />
              </div>
              <span className="font-semibold text-blue-900 text-sm">Labores</span>
            </button>
          </Link>

          <Link href="/cuaderno/riegos/nuevo">
            <button className="w-full flex-col items-center justify-center bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-colors h-32 rounded-3xl gap-3 flex shadow-sm group">
              <div className="bg-cyan-600 group-hover:scale-110 transition-transform rounded-2xl p-3 text-white shadow-md shadow-cyan-600/20">
                <Droplets size={24} />
              </div>
              <span className="font-semibold text-cyan-900 text-sm">Riegos</span>
            </button>
          </Link>

          <Link href="/cuaderno/plagas/nuevo">
            <button className="w-full flex-col items-center justify-center bg-red-50 hover:bg-red-100 border border-red-200 transition-colors h-32 rounded-3xl gap-3 flex shadow-sm group">
              <div className="bg-red-600 group-hover:scale-110 transition-transform rounded-2xl p-3 text-white shadow-md shadow-red-600/20">
                <Bug size={24} />
              </div>
              <span className="font-semibold text-red-900 text-sm">Plagas</span>
            </button>
          </Link>

          <Link href="/cuaderno/produccion/nuevo">
            <button className="w-full flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors h-32 rounded-3xl gap-3 flex shadow-sm group">
              <div className="bg-purple-600 group-hover:scale-110 transition-transform rounded-2xl p-3 text-white shadow-md shadow-purple-600/20">
                <ShoppingBasket size={24} />
              </div>
              <span className="font-semibold text-purple-900 text-sm">Producción</span>
            </button>
          </Link>

          <Link href="/cuaderno/residuos/nuevo">
            <button className="w-full flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors h-32 rounded-3xl gap-3 flex shadow-sm group">
              <div className="bg-gray-600 group-hover:scale-110 transition-transform rounded-2xl p-3 text-white shadow-md shadow-gray-600/20">
                <Trash2 size={24} />
              </div>
              <span className="font-semibold text-gray-900 text-sm">Residuos</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Historial Corto */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-lg">Última Actividad</h3>
          <Link href="/cuaderno/historial" className="text-green-600 text-sm font-bold">Ver todo</Link>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-sm">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-xl text-gray-600"><FileText size={18} /></div>
              <div>
                <p className="font-semibold text-gray-800">Abono Fondo</p>
                <p className="text-gray-500 text-xs">Parcela El Olivar</p>
              </div>
            </div>
            <span className="text-gray-400 text-xs font-medium">Ayer</span>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-xl text-gray-600"><FileText size={18} /></div>
              <div>
                <p className="font-semibold text-gray-800">Poda</p>
                <p className="text-gray-500 text-xs">Parcela Norte</p>
              </div>
            </div>
            <span className="text-gray-400 text-xs font-medium">10 Abr</span>
          </div>
        </div>
      </div>
    </div>
  );
}

