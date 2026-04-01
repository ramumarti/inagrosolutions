"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Search, Save, Sprout, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchProductosMAPA, ProductoMAPA } from "@/lib/mapa-api";
import { addToQueue } from "@/lib/offline-db";
import { useSyncStore } from "@/store/syncStore";

export default function NuevoTratamientoPage() {
  const router = useRouter();
  const { isOnline, syncNow } = useSyncStore();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductoMAPA[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductoMAPA | null>(null);

  const [dosis, setDosis] = useState("");
  const [unidad, setUnidad] = useState("L/ha");
  const [superficie, setSuperficie] = useState("");
  
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 3 && !selectedProduct) {
        setIsSearching(true);
        const data = await searchProductosMAPA(query);
        setResults(data);
        setIsSearching(false);
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, selectedProduct]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !dosis) return;

    setIsSaving(true);
    try {
      // Registrar "Mutación" para la DB local/remota
      await addToQueue({
        table: "tratamientos_fitosanitarios",
        action: "INSERT",
        payload: {
          parcela_id: "00000000-0000-0000-0000-000000000000", // TODO: Añadir selector de Parcelas Reales
          fecha: new Date().toISOString(),
          producto_mapa_id: selectedProduct.numRegistro,
          nombre_producto: selectedProduct.nombreComercial,
          dosis: parseFloat(dosis),
          unidad_dosis: unidad,
          superficie_tratada: parseFloat(superficie) || null,
        }
      });

      if (isOnline) {
        await syncNow();
      }

      router.push("/cuaderno");
    } catch (error) {
      console.error(error);
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-24 relative">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2.5 bg-white rounded-full text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-100">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Nuevo Tratamiento</h1>
      </div>

      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-4 rounded-2xl flex items-center gap-3 mb-6 shadow-sm">
          <WifiOff size={22} className="text-amber-600" />
          <p className="text-sm font-medium leading-tight">Sin conexión. El tratamiento se guardará localmente y se enviará cuando recuperes señal.</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* API MAPA Buscador */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Fitosanitario</label>
            {!selectedProduct ? (
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500/50 outline-none transition-all font-medium text-gray-800"
                  placeholder="Ej: Cobre, Glifosato..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {isSearching && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-green-600 animate-pulse">Buscando...</span>}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-2xl">
                <div>
                  <p className="font-extrabold text-green-950 text-base">{selectedProduct.nombreComercial}</p>
                  <p className="text-xs text-green-800 font-medium mt-0.5">Reg: {selectedProduct.numRegistro} • {selectedProduct.materiaActiva}</p>
                </div>
                <button type="button" onClick={() => { setSelectedProduct(null); setQuery(""); }} className="text-xs font-bold text-green-800 bg-green-200 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                  Cambiar
                </button>
              </div>
            )}
            
            {/* Opciones */}
            {results.length > 0 && !selectedProduct && (
              <div className="mt-2 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
                {results.map(prod => (
                  <button 
                    key={prod.numRegistro}
                    type="button"
                    className="w-full text-left p-4 hover:bg-green-50 border-b border-gray-50 last:border-0 transition-colors"
                    onClick={() => {
                      setSelectedProduct(prod);
                      setResults([]);
                    }}
                  >
                    <p className="font-bold text-gray-800 text-sm">{prod.nombreComercial}</p>
                    <p className="text-xs text-gray-500 mt-1">{prod.materiaActiva} (Reg: {prod.numRegistro})</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Formulario Dosis */}
        {selectedProduct && (
          <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm grid grid-cols-2 gap-5">
              <div className="col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Dosis</label>
                <input 
                  type="number" step="0.01" required
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500/50 font-bold text-lg text-gray-900 placeholder:font-normal placeholder:text-gray-400"
                  placeholder="0.00"
                  value={dosis} onChange={(e) => setDosis(e.target.value)}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Unidad</label>
                <select 
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold text-gray-900"
                  value={unidad} onChange={(e) => setUnidad(e.target.value)}
                >
                  <option value="L/ha">L / ha</option>
                  <option value="kg/ha">kg / ha</option>
                  <option value="%">%</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Superficie (ha)</label>
                <input 
                  type="number" step="0.01"
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-gray-900"
                  placeholder="Opcional. Por defecto toda la parcela."
                  value={superficie} onChange={(e) => setSuperficie(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-5 rounded-2xl shadow-lg shadow-green-600/30 transition-all disabled:opacity-70 disabled:scale-[0.98] active:scale-[0.98] text-lg mt-4"
            >
              {isSaving ? "Guardando Local..." : <><Save size={22} className="mb-0.5" /> Confirmar Tratamiento</>}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
