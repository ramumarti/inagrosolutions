'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save, Plus, MapPin, Layers, Sprout } from 'lucide-react';
import { createExplotacionAction } from '@/lib/actions/agriculture';

export default function ExplotacionesPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [explotaciones, setExplotaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newNombre, setNewNombre] = useState('');
  const [newUbicacion, setNewUbicacion] = useState('');
  const [newSiex, setNewSiex] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('explotaciones').select('*').order('created_at', { ascending: false });
      setExplotaciones(data || []);
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const result = await createExplotacionAction({
      nombre: newNombre,
      ubicacion: newUbicacion,
      num_registro_siex: newSiex
    });

    if (result.success) {
      setExplotaciones([result.data, ...explotaciones]);
      setIsAdding(false);
      setNewNombre('');
      setNewUbicacion('');
      setNewSiex('');
    } else {
      alert(result.error);
    }
    setIsSaving(false);
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
        <h1 className="text-2xl font-black text-white tracking-tight uppercase">Mis Fincas</h1>
      </div>

      {isAdding ? (
        <form onSubmit={handleCreate} className="space-y-6 animate-in zoom-in-95 duration-300">
          <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Nueva Explotación</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest pl-1">Nombre de la Finca</label>
                <input 
                  type="text" required
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold text-white text-base transition-all"
                  placeholder="Ej: Finca El Horcajo"
                  value={newNombre} onChange={(e) => setNewNombre(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest pl-1">Ubicación / Término</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold text-white text-sm"
                    placeholder="Ej: Jaén, España"
                    value={newUbicacion} onChange={(e) => setNewUbicacion(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest pl-1">Número Registro SIEX</label>
                <input 
                  type="text"
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold text-white text-sm"
                  placeholder="Ej: ES12345678"
                  value={newSiex} onChange={(e) => setNewSiex(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
               <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="flex-1 py-4 bg-white/5 text-white/40 font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all text-[10px]"
               >
                 Cancelar
               </button>
               <button 
                type="submit" 
                disabled={isSaving}
                className="flex-[2] py-4 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-500 transition-all text-[10px] flex items-center justify-center gap-2"
               >
                 {isSaving ? "Guardando..." : <><Save size={16} /> Crear Finca</>}
               </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-8 bg-emerald-500/10 border-2 border-dashed border-emerald-500/20 rounded-[32px] text-emerald-400 font-black uppercase tracking-widest flex flex-col items-center gap-3 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={24} />
            </div>
            <span className="text-[11px]">Añadir Nueva Explotación</span>
          </button>

          {loading ? (
            <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" /></div>
          ) : (
            explotaciones.map((exp) => (
              <div 
                key={exp.id}
                className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-xl backdrop-blur-md group hover:bg-white/[0.07] transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform">
                  <Layers size={80} />
                </div>
                
                <div className="flex items-start justify-between relative z-10">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{exp.nombre}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                       <MapPin size={12} /> {exp.ubicacion || 'Sin Ubicación'}
                    </div>
                  </div>
                  <div className="bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                    SIEX: {exp.num_registro_siex || 'Pendiente'}
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Superficie Total</div>
                      <div className="text-white font-black">{exp.superficie_total || 0} ha</div>
                   </div>
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                      <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Cultivo</div>
                      <div className="flex items-center gap-2 text-emerald-400 font-black italic">
                        <Sprout size={14} /> Olivar
                      </div>
                   </div>
                </div>

                <div className="mt-6 flex justify-end">
                   <button 
                    onClick={() => router.push(`/cuaderno/parcelas/configuracion?explotacionId=${exp.id}`)}
                    className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:text-white transition-colors group"
                   >
                     Gestionar Parcelas <Plus size={14} className="group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
