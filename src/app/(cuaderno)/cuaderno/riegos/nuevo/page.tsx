'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Droplets, Clock, Info } from 'lucide-react';
import { ParcelSelector } from '@/components/agriculture/ParcelSelector';
import { createRiegoAction } from '@/lib/actions/agriculture';

export default function NuevoRiegoPage() {
  const router = useRouter();
  
  const [parcelaId, setParcelaId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [volumen, setVolumen] = useState('');
  const [horas, setHoras] = useState('');
  const [metodo, setMetodo] = useState('goteo');
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!parcelaId || !volumen) {
      setError("Por favor completa los campos obligatorios");
      return;
    }

    setIsSaving(true);
    const result = await createRiegoAction({
      parcela_id: parcelaId,
      fecha: new Date(fecha),
      volumen_m3: parseFloat(volumen),
      horas: horas ? parseFloat(horas) : undefined,
      metodo
    });

    if (result.success) {
      router.push('/cuaderno');
    } else {
      setError(result.error || "Error al registrar el riego");
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-32 px-4 sm:px-0 relative z-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8 pt-4">
        <button 
          onClick={() => router.push('/cuaderno')} 
          className="p-2.5 bg-white/5 rounded-2xl text-white/70 hover:bg-white/10 shadow-sm border border-white/10 transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-white tracking-tight uppercase">Nuevo Riego</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-[28px] mb-6 text-[10px] font-black uppercase tracking-widest">
           ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl">
           <ParcelSelector onSelect={setParcelaId} selectedId={parcelaId} />
        </div>

        <div className="bg-[#0c0c0e] p-8 rounded-[40px] border border-white/10 shadow-2xl space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                 <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest pl-1">Método de Riego</label>
                 <select 
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 font-bold text-white appearance-none"
                  value={metodo} onChange={(e) => setMetodo(e.target.value)}
                 >
                    <option value="goteo">Goteo Localizado</option>
                    <option value="aspersion">Aspersión</option>
                    <option value="gravedad">Gravedad / Manta</option>
                    <option value="microaspersion">Microaspersión</option>
                 </select>
              </div>

              <div>
                 <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest pl-1">Caudal / Vol (m³)</label>
                 <div className="relative">
                    <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400/30" size={18} />
                    <input 
                      type="number" step="0.1" required
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 font-black text-white text-xl"
                      placeholder="0.0"
                      value={volumen} onChange={(e) => setVolumen(e.target.value)}
                    />
                 </div>
              </div>

              <div>
                 <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest pl-1">Duración (h)</label>
                 <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="number" step="0.5"
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 font-black text-white text-xl"
                      placeholder="0.0"
                      value={horas} onChange={(e) => setHoras(e.target.value)}
                    />
                 </div>
              </div>
           </div>

           <div className="pt-2">
              <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest pl-1">Fecha de la Jornada</label>
              <input 
                type="date"
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 font-bold text-white"
                value={fecha} onChange={(e) => setFecha(e.target.value)}
              />
           </div>
        </div>

        <button 
          type="submit" 
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black py-6 rounded-[28px] shadow-2xl shadow-blue-900/40 transition-all disabled:opacity-50 active:scale-[0.98] text-lg uppercase tracking-widest group"
        >
          {isSaving ? "Guardando..." : <><Save size={24} className="group-hover:translate-x-[-2px] transition-transform" /> Registrar Riego</>}
        </button>

        <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-[32px] flex items-start gap-4">
           <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
              <Info size={18} />
           </div>
           <p className="text-[10px] text-white/40 font-bold leading-relaxed uppercase tracking-widest">
              El registro de riegos es obligatorio para la condicionalidad reforzada de la PAC 2026. Asegúrate de que el contador coincida con tu cuaderno de riego.
           </p>
        </div>
      </form>
    </div>
  );
}
