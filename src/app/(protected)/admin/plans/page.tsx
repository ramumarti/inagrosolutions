import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { PlansGrid } from '@/components/admin/PlansGrid';

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

  // Count users per plan
  const userCountByPlan: Record<string, number> = {};
  usersData.forEach(u => {
    if (u.plan_id) {
      userCountByPlan[u.plan_id] = (userCountByPlan[u.plan_id] || 0) + 1;
    }
  });

  const plans = rawPlans.map(p => ({
    ...p,
    users_count: userCountByPlan[p.id] || 0
  }));

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
              Los planes del sistema están sincronizados con el Cuaderno Digital. Las entidades que opten por la modalidad de <span className="text-indigo-400 font-bold">Marca Blanca</span> recibirán un <span className="text-emerald-400 font-bold underline">descuento del 50%</span> sobre el PVP de los planes para sus agricultores.
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

        <PlansGrid initialPlans={plans} />
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
