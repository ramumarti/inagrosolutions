'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { Leaf, Star, CheckCircle2, AlertTriangle, ShieldCheck, Tractor } from 'lucide-react';
import { TIER_CONFIG } from '@/lib/modules';

export function TenantPricing({ tenantSlug, primaryColor }: { tenantSlug: string, primaryColor: string }) {
  const [annualBilling, setAnnualBilling] = useState(false);

  // Features description for each tier
  const tierFeatures = {
    basico: [
      "Registro de tratamientos y labores",
      "Importación SIGPAC automática",
      "Exportación Excel/PDF legal",
      "Soporte básico por email"
    ],
    intermedio: [
      "Todo lo del plan Básico",
      "Validación de dosis por IA",
      "Supervisado técnicamente",
      "Soporte prioritario por WhatsApp",
      "Control de ecorregímenes y abonos"
    ],
    avanzado: [
      "Todo lo del plan Intermedio",
      "Soporte multiusuario (Operarios)",
      "Control de maquinaria y equipos",
      "Asesoramiento personalizado",
      "Atención preferente"
    ],
    premium: [
      "Todo lo del plan Avanzado",
      "Soporte telefónico 24/7",
      "Revisión de expediente PAC",
      "Informes de rentabilidad",
      "Atención prioritaria VIP"
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-6 text-center">
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between text-left gap-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-500">Tarifas Transparentes</span>
          <h2 className="text-3xl md:text-5xl font-black text-white mt-2 mb-4">¿Cuánto cuesta tu tranquilidad?</h2>
          <p className="text-gray-400 text-lg max-w-2xl">Sin sorpresas, sin cuotas ocultas y adaptado al tamaño real de tu explotación. Selecciona el plan que se ajusta a tus olivos.</p>
        </div>
        
        {/* Toggle Billing */}
        <div className="inline-flex items-center p-1.5 bg-white/5 rounded-full border border-white/10 shrink-0 self-start md:self-end">
          <button 
            onClick={() => setAnnualBilling(false)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${!annualBilling ? 'text-black shadow-lg font-black' : 'text-gray-400 hover:text-white'}`}
            style={!annualBilling ? { backgroundColor: primaryColor } : {}}
          >
            Mensual
          </button>
          <button 
            onClick={() => setAnnualBilling(true)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${annualBilling ? 'text-black shadow-lg font-black' : 'text-gray-400 hover:text-white'}`}
            style={annualBilling ? { backgroundColor: primaryColor } : {}}
          >
            Anual <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/35 text-white font-black">AHORRA 2 MESES</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {['basico', 'intermedio', 'avanzado', 'premium'].map((tierStr) => {
          const tier = tierStr as keyof typeof TIER_CONFIG;
          const info = TIER_CONFIG[tier];
          
          const price = annualBilling ? info.price_annual / 12 : info.price_monthly;
          const originalPrice = info.price_monthly;
          const periodLabel = "mes";
          
          const features = tierFeatures[tier];
          const isRecommended = tier === 'intermedio';

          return (
            <GlassCard 
              key={tier} 
              className={`p-8 flex flex-col justify-start hover:border-white/20 transition-all text-left relative h-full ${
                isRecommended 
                  ? 'border-emerald-500/30 bg-[#0c1219]/90 shadow-[0_0_30px_rgba(16,185,129,0.05)] md:scale-105 z-10' 
                  : 'border-white/5 bg-white/[0.01]'
              }`}
            >
              {isRecommended && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-black">
                  RECOMENDADO
                </div>
              )}
              
              <div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.gradient} flex items-center justify-center text-white mb-6 shadow-lg`}>
                  {tier === 'premium' ? <Star size={20} /> : tier === 'avanzado' ? <Tractor size={20} /> : tier === 'intermedio' ? <ShieldCheck size={20} /> : <Leaf size={20} />}
                </div>
                
                <h3 className="text-xl font-black text-white">{info.label_es}</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 mb-6">Hasta {info.max_ha} HA</p>
                
                <div className="mb-2 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">{price.toFixed(2).replace('.', ',')} €</span>
                  <span className="text-gray-500 text-sm font-medium">/{periodLabel} <span className="text-[10px] text-white/30">+ IVA</span></span>
                </div>
                
                {annualBilling && (
                  <p className="text-emerald-400 text-xs font-bold">
                    Facturado anualmente ({info.price_annual.toFixed(2).replace('.', ',')} €/año)
                  </p>
                )}
                {!annualBilling && (
                  <p className="text-gray-500 text-xs font-medium">
                    Pago mensual recurrente
                  </p>
                )}
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* Alerta de Ahorro y Rentabilidad */}
      <div className="mt-16 max-w-4xl mx-auto p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex flex-col sm:flex-row items-center gap-4 text-left">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-white text-base">Haz cuentas: El coste de la tranquilidad</h4>
          <p className="text-sm text-gray-300 mt-1 leading-relaxed">
            El precio de estar al día es **menor que el coste de llenar un solo depósito de gasoil** de tu tractor, o la mitad de lo que perderías por un solo día de retraso en la PAC. Estar protegido ante una multa de 3.000€ es la decisión financiera más inteligente para tu explotación de olivar.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <Link href={`/planes?tenant=${tenantSlug}`}>
          <button 
            className="px-10 py-5 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all"
            style={{ backgroundColor: primaryColor, color: '#000' }}
          >
            Ver Comparativa Completa de Módulos
          </button>
        </Link>
      </div>
    </div>
  );
}
