"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Search, Save, Sprout, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchProductosMAPA, ProductoMAPA } from "@/lib/mapa-api";
import { addToQueue } from "@/lib/offline-db";
import { useSyncStore } from "@/store/syncStore";

import { createClient } from "@/lib/supabase/client";
import { ParcelSelector } from "@/components/agriculture/ParcelSelector";
import { RegistrationAICoach } from "@/components/agriculture/RegistrationAICoach";

export default function NuevoTratamientoPage() {
  const router = useRouter();
  const { isOnline, syncNow } = useSyncStore();

  const [parcelaId, setParcelaId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductoMAPA[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductoMAPA | null>(null);

  const [dosis, setDosis] = useState("");
  const [unidad, setUnidad] = useState("L/ha");
  const [superficie, setSuperficie] = useState("");
  const [ropo, setRopo] = useState("");
  const [plaga, setPlaga] = useState("");
  
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's profile to pre-fill ROPO if available
  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('carnet_ropo').eq('id', user.id).single();
        if (data?.carnet_ropo) setRopo(data.carnet_ropo);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedProduct || !dosis || !parcelaId || !ropo) {
      setError("Por favor completa los campos obligatorios (Parcela, Producto, Dosis y ROPO)");
      return;
    }

    setIsSaving(true);
    
    try {
      const payload = {
        parcela_id: parcelaId,
        fecha: new Date(),
        producto: selectedProduct.nombreComercial,
        numero_registro: selectedProduct.numRegistro,
        dosis: parseFloat(dosis),
        unidad: unidad,
        ropo: ropo,
        plaga_objetivo: plaga,
        nivel_plaga: 10, // Simulated for validation
      };

      if (!isOnline) {
        await addToQueue({
          table: "tratamientos_fitosanitarios",
          action: "INSERT",
          payload
        });
        router.push("/cuaderno");
        return;
      }

      // USE THE NEW PROFESIONAL SERVICE ACTION
      const { createTreatmentAction } = await import("@/lib/actions/treatments");
      const result = await createTreatmentAction(payload);

      if (result.success) {
        router.push("/cuaderno/tratamientos");
      } else {
        setError(result.error || "Error al guardar el tratamiento");
        setIsSaving(false);
      }

    } catch (err: any) {
      console.error(err);
      setError("Error inesperado al procesar el tratamiento");
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-32 relative px-4 sm:px-0 z-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8 pt-4">
        <button 
          onClick={() => router.push('/cuaderno/tratamientos')} 
          className="p-2.5 bg-white/5 rounded-2xl text-white/70 hover:bg-white/10 shadow-sm border border-white/10 transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-white tracking-tight uppercase">Nuevo Tratamiento</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-[28px] mb-6 text-xs font-bold uppercase tracking-widest animate-in shake-in duration-500">
           ⚠️ {error}
        </div>
      )}

      {/* AI TECH ASSISTANT */}
      <div className="mb-8">
        <RegistrationAICoach 
          module="treatment" 
          currentData={{ parcelId: parcelaId, product: selectedProduct?.nombreComercial, pest: plaga }} 
        />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Parcela Selector */}
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl">
          <ParcelSelector 
            onSelect={setParcelaId} 
            selectedId={parcelaId} 
          />
        </div>

        {/* Producto MAPA */}
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl space-y-4">
          <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mb-2 pl-1">Buscador Oficial MAPA</label>
          {!selectedProduct ? (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="text"
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold text-white placeholder:text-white/10 transition-all"
                placeholder="Buscar por nombre o Nº Registro..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between animate-in zoom-in-95 duration-300">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400"><Sprout size={18} /></div>
                 <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Producto Validado</p>
                    <p className="text-white font-bold text-xs line-clamp-1">{selectedProduct.nombreComercial}</p>
                 </div>
               </div>
               <button 
                type="button" 
                onClick={() => { setSelectedProduct(null); setQuery(""); }}
                className="text-[10px] font-black text-white/20 hover:text-white uppercase tracking-widest underline underline-offset-4"
               >
                 Cambiar
               </button>
            </div>
          )}

          {/* Opciones */}
          {results.length > 0 && !selectedProduct && (
            <div className="mt-2 bg-black/40 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5 animate-in slide-in-from-top-2 duration-300 max-h-60 overflow-y-auto">
              {results.map((prod) => (
                <button
                  key={prod.numRegistro}
                  type="button"
                  className="w-full px-5 py-4 text-left hover:bg-white/5 transition-colors flex flex-col gap-1"
                  onClick={() => {
                    setSelectedProduct(prod);
                    setResults([]);
                  }}
                >
                  <span className="text-white font-black text-sm uppercase tracking-tight">{prod.nombreComercial}</span>
                  <span className="text-[10px] text-white/30 font-bold">Nº Registro: {prod.numRegistro} • {prod.materiaActiva}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dosificación y Detalles Legales */}
        {selectedProduct && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-500">
            <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-white/30 mb-3 uppercase tracking-widest pl-1 leading-none">Dosis</label>
                  <input 
                    type="number" step="0.01" required
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 font-black text-white text-xl"
                    placeholder="0.00"
                    value={dosis} onChange={(e) => setDosis(e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-white/30 mb-3 uppercase tracking-widest pl-1 leading-none">Unidad</label>
                  <select 
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold text-white text-base appearance-none cursor-pointer"
                    value={unidad} onChange={(e) => setUnidad(e.target.value)}
                  >
                    <option value="L/ha" className="bg-zinc-900">L/ha</option>
                    <option value="kg/ha" className="bg-zinc-900">kg/ha</option>
                    <option value="%" className="bg-zinc-900">%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/30 mb-3 uppercase tracking-widest pl-1 leading-none">Carnet ROPO (Obligatorio)</label>
                <input 
                  type="text" required
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold text-white text-base"
                  placeholder="Ej: 23/12345/A"
                  value={ropo} onChange={(e) => setRopo(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/30 mb-3 uppercase tracking-widest pl-1 leading-none">Plaga Objetivo / Justificación</label>
                <input 
                  type="text"
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold text-white text-base"
                  placeholder="Ej: Mosca del Olivo (Bactrocera oleae)"
                  value={plaga} onChange={(e) => setPlaga(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black py-6 rounded-[28px] shadow-2xl shadow-emerald-900/40 transition-all disabled:opacity-50 disabled:grayscale active:scale-[0.98] text-lg uppercase tracking-widest group mb-12"
            >
              {isSaving ? "Validando y Guardando..." : <><Save size={24} className="group-hover:rotate-12 transition-transform" /> Confirmar Tratamiento</>}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

