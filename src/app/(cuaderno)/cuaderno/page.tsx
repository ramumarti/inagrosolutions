import { Sprout, Tractor, CloudRain, AlertTriangle, FileText } from "lucide-react";
import Link from "next/link";

export default function HoyPage() {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
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
          <h3 className="font-bold text-amber-900 text-sm">Cierre Mensual PAC</h3>
          <p className="text-sm text-amber-800/80 mt-1 leading-relaxed">
            Tienes hasta el 30 de abril para registrar las fertilizaciones del mes de Marzo y evitar penalizaciones.
          </p>
        </div>
      </div>

      {/* Accesos Rápidos (Botones grandes UX Mobile-First) */}
      <div className="pt-2">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Registro Rápido</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/cuaderno/tratamientos/nuevo">
            <button className="w-full flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 active:bg-green-200 border border-green-200 transition-colors h-36 rounded-3xl gap-4 shadow-sm">
              <div className="bg-green-600 rounded-2xl p-3.5 text-white shadow-md shadow-green-600/20">
                <Sprout size={28} />
              </div>
              <span className="font-semibold text-green-900 text-sm">Fitosanitario</span>
            </button>
          </Link>

          <Link href="/cuaderno/labores/nuevo">
            <button className="w-full flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border border-blue-200 transition-colors h-36 rounded-3xl gap-4 shadow-sm">
              <div className="bg-blue-600 rounded-2xl p-3.5 text-white shadow-md shadow-blue-600/20">
                <Tractor size={28} />
              </div>
              <span className="font-semibold text-blue-900 text-sm">Labor Física</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Tareas Pendientes / Historial Corto */}
      <div className="pt-4">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Última Actividad</h3>
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
