'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Droplets, Info } from 'lucide-react';
import { ParcelSelector } from '@/components/agriculture/ParcelSelector';
import { RegistrationAICoach } from '@/components/agriculture/RegistrationAICoach';
import { createFertilizacionAction } from '@/lib/actions/agriculture';

export default function NuevaFertilizacionPage() {
  const router = useRouter();
  
  const [parcelaId, setParcelaId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [tipo, setTipo] = useState<'organico' | 'mineral'>('mineral');
  const [producto, setProducto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState('kg/ha');
  const [metodo, setMetodo] = useState('localizado');
  const [justificacion, setJustificacion] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!parcelaId || !producto || !cantidad || !metodo) {
      setError("Por favor completa los campos obligatorios");
      return;
    }

    setIsSaving(true);
    const result = await createFertilizacionAction({
      parcela_id: parcelaId,
      fecha: new Date(fecha),
      tipo,
      producto,
      cantidad: parseFloat(cantidad),
      unidad,
      metodo,
      justificacion
    });

    if (result.success) {
      router.push('/cuaderno');
    } else {
      setError(result.error || "Error al guardar el abonado");
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
        <h1 className="text-2xl font-black text-white tracking-tight uppercase">Nueva Fertilización</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-[28px] mb-6 text-[10px] font-black uppercase tracking-widest">
           ⚠️ {error}
        </div>
      )}

      {/* IA COACH */}
      <div className="mb-8">
        <RegistrationAICoach 
          module="fertilization" 
          currentData={{ parcelId: parcelaId, type: tipo, product: producto }} 
        />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Parcela Selector */}
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl">
           <ParcelSelector onSelect={setParcelaId} selectedId={parcelaId} />
        </div>

        {/* Datos del Abonado */}
        <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                 <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest pl-1">Tipo de Abono</label>
                 <div className="grid grid-cols-2 gap-2">
                    {['mineral', 'organico'].map((t) => (
                       <button
                        key={t} type="button"
                        onClick={() => setTipo(t as any)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${tipo === t ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                       >
                          {t}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="col-span-2">
                 <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest pl-1">Nombre Comercial / Producto</label>
                 <input 
                  type="text" required
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 font-bold text-white"
                  placeholder="Ej: NPK 15-15-15"
                  value={producto} onChange={(e) => setProducto(e.target.value)}
                 />
              </div>

              <div>
                 <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest pl-1">Cantidad</label>
                 <input 
                  type="number" step="0.01" required
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 font-black text-white text-xl"
                  placeholder="0.00"
                  value={cantidad} onChange={(e) => setCantidad(e.target.value)}
                 />
              </div>

              <div>
                 <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest pl-1">Unidad</label>
                 <select 
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 font-bold text-white appearance-none"
                  value={unidad} onChange={(e) => setUnidad(e.target.value)}
                 >
                    <option value="kg/ha">kg/ha</option>
                    <option value="L/ha">L/ha</option>
                    <option value="kg/pie">kg/pie</option>
                 </select>
              </div>
           </div>

           <div>
              <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest pl-1">Método de Aplicación</label>
              <select 
               className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 font-bold text-white appearance-none"
               value={metodo} onChange={(e) => setMetodo(e.target.value)}
              >
                 <option value="localizado">Localizado (Pie)</option>
                 <option value="voleo">A Voleo</option>
                 <option value="fertirrigacion">Fertirrigación</option>
                 <option value="foliar">Foliar</option>
              </select>
           </div>

           <div>
              <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest pl-1">Justificación / Notas</label>
              <textarea 
               className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-white text-sm"
               rows={3}
               placeholder="Obligatorio para cumplimiento SIEX si es abono excepcional..."
               value={justificacion} onChange={(e) => setJustificacion(e.target.value)}
              />
           </div>
        </div>

        <button 
          type="submit" 
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black py-6 rounded-[28px] shadow-2xl shadow-blue-900/40 transition-all disabled:opacity-50 active:scale-[0.98] text-lg uppercase tracking-widest group"
        >
          {isSaving ? "Guardando..." : <><Save size={24} className="group-hover:translate-y-[-2px] transition-transform" /> Registrar Abonado</>}
        </button>

        <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-[32px] flex items-start gap-4">
           <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
              <Info size={18} />
           </div>
           <p className="text-[10px] text-white/40 font-bold leading-relaxed uppercase tracking-widest">
              Recuerda que para el SIEX, los abonados minerales deben realizarse siguiendo el plan de abonado anual registrado para cada finca.
           </p>
        </div>
      </form>
    </div>
  );
}
