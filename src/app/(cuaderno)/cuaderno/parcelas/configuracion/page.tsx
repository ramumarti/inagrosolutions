'use client'

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Plus, Map, Info, Sprout, Droplets, Target } from 'lucide-react';
import { createParcelaAction } from '@/lib/actions/agriculture';

function ParcelasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explotacionId = searchParams.get('explotacionId');
  const supabase = createClient();

  const [parcelas, setParcelas] = useState<any[]>([]);
  const [explotacion, setExplotacion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [nombre, setNombre] = useState('');
  const [sigpac, setSigpac] = useState('');
  const [superficie, setSuperficie] = useState('');
  const [tipo, setTipo] = useState('tradicional');
  const [produccion, setProduccion] = useState('convencional');
  const [riego, setRiego] = useState('secano');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!explotacionId) {
      router.push('/cuaderno/explotaciones');
      return;
    }

    async function loadData() {
      const { data: exp } = await supabase.from('explotaciones').select('nombre').eq('id', explotacionId).single();
      setExplotacion(exp);

      const { data: par } = await supabase.from('parcelas').select('*').eq('explotacion_id', explotacionId).order('nombre');
      setParcelas(par || []);
      setLoading(false);
    }
    loadData();
  }, [explotacionId, supabase, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const result = await createParcelaAction({
      explotacion_id: explotacionId,
      nombre,
      referencia_sigpac: sigpac,
      superficie: parseFloat(superficie),
      tipo_olivar: tipo,
      sistema_produccion: produccion,
      sistema_riego: riego
    });

    if (result.success) {
      setParcelas([...parcelas, result.data]);
      setIsAdding(false);
      setNombre('');
      setSigpac('');
      setSuperficie('');
    } else {
      alert(result.error);
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-lg mx-auto pb-32 px-4 sm:px-0 relative z-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8 pt-4">
        <button 
          onClick={() => router.push('/cuaderno/explotaciones')} 
          className="p-2.5 bg-white/5 rounded-2xl text-white/70 hover:bg-white/10 shadow-sm border border-white/10 transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Parcelas</h1>
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest leading-none mt-1">{explotacion?.nombre || 'Cargando...'}</p>
        </div>
      </div>

      {isAdding ? (
        <form onSubmit={handleCreate} className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
          <div className="bg-[#0c0c0e] p-8 rounded-[40px] border border-white/10 shadow-3xl space-y-6">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                   <Plus size={20} />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Nueva Parcela</h3>
             </div>

             <div className="space-y-5">
                <div>
                   <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest pl-1">Nombre Coloquial</label>
                   <input 
                    type="text" required
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold text-white text-base"
                    placeholder="Ej: La Umbría Derecha"
                    value={nombre} onChange={(e) => setNombre(e.target.value)}
                   />
                </div>

                <div>
                   <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest pl-1">Referencia SIGPAC Completa</label>
                   <div className="relative">
                      <Map className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="text" required
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold text-white text-sm"
                        placeholder="Prov.Mun.Pol.Parc.Rec"
                        value={sigpac} onChange={(e) => setSigpac(e.target.value)}
                      />
                   </div>
                   <p className="text-[9px] text-white/20 mt-2 pl-1 italic">El formato debe seguir el estándar oficial del SIGPAC.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest pl-1">Superficie (ha)</label>
                      <input 
                        type="number" step="0.0001" required
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 font-black text-white text-lg"
                        placeholder="0.0000"
                        value={superficie} onChange={(e) => setSuperficie(e.target.value)}
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest pl-1">Sistema Riego</label>
                      <select 
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold text-white text-base appearance-none"
                        value={riego} onChange={(e) => setRiego(e.target.value)}
                      >
                         <option value="secano" className="bg-zinc-900">Secano</option>
                         <option value="regadio" className="bg-zinc-900">Regadío</option>
                      </select>
                   </div>
                </div>

                <div className="pt-2">
                   <label className="block text-[10px] font-black text-white/30 mb-3 uppercase tracking-widest pl-1">Tipo de Olivar</label>
                   <div className="grid grid-cols-3 gap-2">
                      {['tradicional', 'intensivo', 'superintensivo'].map((t) => (
                        <button
                          key={t} type="button"
                          onClick={() => setTipo(t)}
                          className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${tipo === t ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-white/5 border-white/10 text-white/40'}`}
                        >
                          {t}
                        </button>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="block text-[10px] font-black text-white/30 mb-3 uppercase tracking-widest pl-1">Producción</label>
                   <div className="grid grid-cols-3 gap-2">
                      {['convencional', 'integrado', 'ecologico'].map((p) => (
                        <button
                          key={p} type="button"
                          onClick={() => setProduccion(p)}
                          className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${produccion === p ? 'bg-blue-500 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-white/5 border-white/10 text-white/40'}`}
                        >
                          {p}
                        </button>
                      ))}
                   </div>
                </div>
             </div>

             <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-[2] py-5 bg-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-900/20"
                >
                   {isSaving ? 'Guardando...' : 'Confirmar Parcela'}
                </button>
             </div>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-6 bg-white/5 border border-dashed border-white/10 rounded-[32px] text-white/40 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/10 active:scale-[0.98] transition-all"
          >
            <Plus size={18} /> <span className="text-[10px]">Añadir Parcela a {explotacion?.nombre}</span>
          </button>

          {loading ? (
             <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" /></div>
          ) : parcelas.length === 0 ? (
             <div className="py-20 text-center space-y-4 opacity-30">
                <Map size={48} className="mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest">No hay parcelas registradas aún</p>
             </div>
          ) : (
            parcelas.map((par) => (
              <div 
                key={par.id}
                className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-xl group hover:border-emerald-500/30 transition-all relative overflow-hidden"
              >
                <div className="flex items-start justify-between relative z-10">
                   <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-1">{par.nombre}</h3>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.15em]">{par.referencia_sigpac}</p>
                   </div>
                   <div className="bg-blue-500/20 px-3 py-1 rounded-full text-[8px] font-black text-blue-400 uppercase tracking-widest border border-blue-500/20">
                      {par.sistema_produccion}
                   </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/5 pt-6 relative z-10">
                   <div className="text-center">
                      <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Superficie</div>
                      <div className="text-xs font-black text-white">{par.superficie} ha</div>
                   </div>
                   <div className="text-center border-x border-white/5">
                      <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Tipo</div>
                      <div className="text-xs font-black text-white uppercase truncate px-1">{par.tipo_olivar}</div>
                   </div>
                   <div className="text-center">
                      <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Riego</div>
                      <div className="flex items-center justify-center gap-1 text-blue-400 font-black text-[10px] uppercase">
                         <Droplets size={10} /> {par.sistema_riego}
                      </div>
                   </div>
                </div>

                <div className="absolute -bottom-2 -right-2 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-all duration-700 pointer-events-none">
                   <Target size={100} />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function ParcelaConfigContainer() {
   return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black"><Loader className="animate-spin text-emerald-500" /></div>}>
         <ParcelasContent />
      </Suspense>
   );
}

function Loader({ className }: { className?: string }) {
   return <div className={`w-8 h-8 border-4 border-white/10 border-t-emerald-500 rounded-full ${className}`} />;
}
