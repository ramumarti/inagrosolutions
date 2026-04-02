"use client";

import { Badge } from "@/components/ui/Badge";
import { Download, FileSpreadsheet, Settings2, UserCircle, DatabaseBackup } from "lucide-react";
import { exportarCuadernoCompletoSIEX, ReporteTratamiento } from "@/lib/export-siex";
import { useSyncStore } from "@/store/syncStore";
import { useEffect } from "react";

export default function AjustesPage() {
  const { isOnline, pendingItems, checkQueue, syncNow } = useSyncStore();

  useEffect(() => {
    checkQueue();
  }, [checkQueue]);

  const handleExportSIEX = () => {
    // Simulación de carga desde base de datos Supabase:
    const mockTratamientos: ReporteTratamiento[] = [
      {
        "Referencia Parcela (SIGPAC)": "12:34:56:78",
        "Nombre Finca": "El Olivar",
        "Fecha Tratamiento": "12-04-2026",
        "Producto (Num Reg MAPA)": "24680",
        "Nombre Comercial": "ABAMECTINA 1.8%",
        "Dosis (L/ha)": 1.5,
        "Superficie (ha)": 6.2,
        "Operario": "Juan Pérez",
      },
      {
        "Referencia Parcela (SIGPAC)": "87:65:43:21",
        "Nombre Finca": "Parcela Norte",
        "Fecha Tratamiento": "10-04-2026",
        "Producto (Num Reg MAPA)": "12345",
        "Nombre Comercial": "GLIFOSATO 36%",
        "Dosis (L/ha)": 2.0,
        "Superficie (ha)": 4.0,
        "Operario": "Juan Pérez",
      }
    ];

    exportarCuadernoCompletoSIEX(
      mockTratamientos, 
      [], // No fertilizers for this mock
      [], // No harvest for this mock
      "PAC_SIEX_Trazabilidad"
    );
  };


  return (
    <div className="max-w-lg mx-auto pb-24 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="pt-2">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Preferencias</h1>
      </div>

      {/* Perfil */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-left">
        <div className="p-6 flex items-center gap-4">
          <div className="bg-gray-100 p-3.5 rounded-2xl">
            <UserCircle size={32} className="text-gray-500" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-lg">Agricultor Principal</h2>
            <div className="flex items-center gap-2 mt-1 mt-0.5">
              <Badge variant="success" className="px-3 py-1 font-black">
                Plan Básico
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Legales SIEX */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-800 text-lg px-1">Inspector Institucional</h3>
        
        <button 
          onClick={handleExportSIEX}
          className="w-full bg-white p-5 rounded-3xl border border-green-200 shadow-sm flex items-center justify-between group hover:border-green-400 active:bg-green-50 transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-50 p-3.5 rounded-2xl text-green-600 group-hover:bg-green-100 transition-colors">
              <FileSpreadsheet size={26} />
            </div>
            <div>
              <p className="font-bold text-gray-800 underline decoration-green-300 decoration-2 underline-offset-4">Exportar Cuaderno Oficial</p>
              <p className="text-gray-500 text-xs mt-1.5 leading-relaxed pr-6">Descarga el Excel (.xlsx) estructurado listo para enviarle a la cooperativa o Junta.</p>
            </div>
          </div>
          <div className="text-green-600 bg-green-50 p-2 rounded-full">
            <Download size={20} />
          </div>
        </button>
      </div>

      {/* Sincronización y Dispositivo */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-800 text-lg px-1">Sincronización Inteligente</h3>
        <button 
          onClick={syncNow}
          disabled={!isOnline || pendingItems === 0}
          className="w-full bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between active:bg-gray-50 transition-colors text-left disabled:opacity-60"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3.5 rounded-2xl text-blue-600">
              <DatabaseBackup size={26} />
            </div>
            <div>
              <p className="font-bold text-gray-800">Forzar Subida Nube</p>
              <p className="text-gray-500 text-xs mt-1.5 leading-relaxed truncate max-w-[200px]">
                {pendingItems > 0 
                  ? `Tienes ${pendingItems} tareas pendientes de subir.` 
                  : "Todo el cuaderno está respaldado."}
              </p>
            </div>
          </div>
          {pendingItems > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">{pendingItems}</span>}
        </button>

        <button className="w-full bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between active:bg-gray-50 transition-colors text-left">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-3.5 rounded-2xl text-gray-600">
              <Settings2 size={26} />
            </div>
            <div>
              <p className="font-bold text-gray-800">Caché y Permisos</p>
              <p className="text-gray-500 text-xs mt-1">Garantiza el uso Offline.</p>
            </div>
          </div>
        </button>
      </div>

    </div>
  );
}
