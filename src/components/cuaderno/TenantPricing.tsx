'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { Leaf, Star } from 'lucide-react';
import { TIER_CONFIG } from '@/lib/modules';

export function TenantPricing({ tenantSlug, primaryColor }: { tenantSlug: string, primaryColor: string }) {
  const [annualBilling, setAnnualBilling] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-6 text-center">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-left">
          <h2 className="text-4xl font-black text-white mb-4">Elige el plan para tu explotación</h2>
          <p className="text-gray-400 text-lg max-w-2xl">Selecciona tu plan ahora y disfruta de la plataforma completa. Todos los planes incluyen acceso inmediato.</p>
        </div>
        
        {/* Toggle Billing */}
        <div className="inline-flex items-center p-1 bg-white/5 rounded-full border border-white/10 shrink-0">
          <button 
            onClick={() => setAnnualBilling(false)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${!annualBilling ? 'text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
            style={!annualBilling ? { backgroundColor: primaryColor } : {}}
          >
            Mensual
          </button>
          <button 
            onClick={() => setAnnualBilling(true)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${annualBilling ? 'text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
            style={annualBilling ? { backgroundColor: primaryColor } : {}}
          >
            Anual <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 text-white font-black">-2 MESES</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['basico', 'intermedio', 'avanzado', 'premium'].map((tierStr) => {
          const tier = tierStr as keyof typeof TIER_CONFIG;
          const info = TIER_CONFIG[tier];
          
          const price = annualBilling ? info.price_annual : info.price_monthly;
          const period = annualBilling ? 'año' : 'mes';
          
          return (
            <GlassCard key={tier} className="p-8 flex flex-col items-center text-center hover:border-white/20 transition-all group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.gradient} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                {tier === 'premium' ? <Star size={20} /> : <Leaf size={20} />}
              </div>
              <h3 className="text-xl font-black text-white mb-1">{info.label_es}</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">Hasta {info.max_ha} HA</p>
              <div className="mb-2">
                <span className="text-4xl font-black text-white">{price.toFixed(2).replace('.', ',')} €</span>
              </div>
              <p className="text-gray-500 font-medium mb-8">/{period} <span className="text-xs text-white/40">+ IVA</span></p>
              <Link href={`/cuaderno/planes-suscripcion?tenant=${tenantSlug}`} className="w-full mt-auto">
                <button className="w-full py-3 rounded-xl font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white text-sm">
                  Ver Detalles
                </button>
              </Link>
            </GlassCard>
          )
        })}
      </div>
      
      <div className="mt-12">
        <Link href={`/cuaderno/planes-suscripcion?tenant=${tenantSlug}`}>
          <button 
            className="px-10 py-5 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-all"
            style={{ backgroundColor: primaryColor, color: '#000' }}
          >
            Ver Comparativa de Planes
          </button>
        </Link>
      </div>
    </div>
  );
}
