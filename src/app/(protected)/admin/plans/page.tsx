import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { PlansGrid } from '@/components/admin/PlansGrid';
import { TIER_CONFIG, AgriTier } from '@/lib/modules';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPlansPage() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [plansRes, usersRes] = await Promise.all([
    supabaseAdmin.from('plans').select('*').order('sort_order', { ascending: true }),
    supabaseAdmin.from('users').select('plan_id')
  ]);

  const rawPlans = plansRes.data || [];
  const usersData = usersRes.data || [];

  // Definición de conceptos/características idénticas al Cuaderno Digital
  const CORE_FEATURES_ES: Record<string, string[]> = {
    basico: ["Registro SIEX", "Fitosanitarios", "Almacén de Insumos", "Fertilización", "Labores Agrícolas", "Gestión de Parcelas"],
    intermedio: ["Todo lo de Básico", "Control de Costes", "Gestión de Cosechas", "Generación de Documentos"],
    avanzado: ["Todo lo de Intermedio", "Trazabilidad Total", "Dashboards Avanzados", "Exportación PAC / SIEX"],
    premium: ["Todo lo de Avanzado", "Sensores IoT", "Alertas Inteligentes", "Estaciones Climáticas"]
  };

  const CORE_FEATURES_EN: Record<string, string[]> = {
    basico: ["SIEX Registration", "Phytosanitary", "Input Storage", "Fertilization", "Agricultural Labors", "Parcel Management"],
    intermedio: ["Everything in Basic", "Cost Control", "Harvest Management", "Document Generation"],
    avanzado: ["Everything in Intermediate", "Full Traceability", "Advanced Dashboards", "PAC / SIEX Export"],
    premium: ["Everything in Advanced", "IoT Sensors", "Smart Alerts", "Weather Stations"]
  };

  // Count users per plan
  const userCountByPlan: Record<string, number> = {};
  usersData.forEach(u => {
    if (u.plan_id) {
      userCountByPlan[u.plan_id] = (userCountByPlan[u.plan_id] || 0) + 1;
    }
  });

  // FORCED SYNC: We ignore database values and use TIER_CONFIG as the source of truth
  const CORE_PLAN_SLUGS: AgriTier[] = ['basico', 'intermedio', 'avanzado', 'premium'];
  
  const plans = CORE_PLAN_SLUGS.map(slug => {
    const coreTier = TIER_CONFIG[slug];
    
    // Attempt to find the corresponding plan in the database to preserve the ID and user count
    const dbPlan = rawPlans.find(p => {
      const pSlug = (p.slug || "").toLowerCase().trim();
      const pName = (p.name_es || "").toLowerCase().trim();
      
      return pSlug === slug || 
             (slug === 'basico' && (pName.includes('basico') || pName.includes('básico'))) ||
             (slug === 'intermedio' && (pName.includes('profesional') || pName.includes('intermedio') || pName.includes('prof'))) ||
             (slug === 'avanzado' && pName.includes('avanzado')) ||
             (slug === 'premium' && pName.includes('premium'));
    });

    return {
      id: dbPlan?.id || `temp-${slug}`,
      slug: slug,
      name_es: coreTier.label_es,
      name_en: coreTier.label_en,
      description_es: dbPlan?.description_es || "",
      description_en: dbPlan?.description_en || "",
      price_monthly: coreTier.price_monthly,
      price_annual: coreTier.price_annual,
      items_es: CORE_FEATURES_ES[slug] || [],
      items_en: CORE_FEATURES_EN[slug] || [],
      users_count: dbPlan ? (userCountByPlan[dbPlan.id] || 0) : 0
    };
  });

  return (
    <div className="w-full flex justify-center py-12">
      <div className="max-w-7xl w-full px-6 lg:px-8 space-y-12">
        {/* Info Banner for Entities */}
        <div className="p-8 rounded-[32px] bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-xl flex flex-col md:flex-row items-center gap-8 shadow-2xl">
          <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-500/30">
            <Briefcase className="w-10 h-10 text-indigo-400" />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Reglas para Entidades y Empresas</h2>
            <p className="text-white/60 font-medium leading-relaxed">
              Los planes del sistema están sincronizados con el Cuaderno Digital. Las entidades que opten por la modalidad de <span className="text-indigo-400 font-bold">Marca Blanca</span> recibirán un <span className="text-emerald-400 font-bold underline">50% del PVP</span> de los planes de sus agricultores.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 justify-center md:justify-start">
              <span className="px-4 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-xs font-bold text-indigo-400">
                Setup Marca Blanca: 250 € + IVA 
              </span>
              <span className="px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-xs font-bold text-emerald-400">
                Ahorro Anual: 2 Meses (Pago Anual)
              </span>
            </div>
          </div>
        </div>

        <PlansGrid key={JSON.stringify(plans)} initialPlans={plans} />
      </div>
    </div>
  );
}

function Briefcase({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}
