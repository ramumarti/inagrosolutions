import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { DynamicPlansGrid } from '@/components/plans/DynamicPlansGrid';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PlansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userPlanId = null;
  if (user) {
    const { data } = await supabase.from('users').select('plan_id').eq('id', user.id).single();
    if (data) userPlanId = data.plan_id;
  }

  const { data: plans } = await supabase
    .from('plans')
    .select('*, plan_apps(micro_apps(name_en, name_es, icon))')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const normalizedPlans = (plans || []).map((p: any) => ({
    ...p,
    plan_apps: Array.isArray(p.plan_apps) ? p.plan_apps : (p.plan_apps ? [p.plan_apps] : [])
  }));

  return (
    <div className="w-full h-full flex justify-center">
      <div className="w-full px-4 lg:px-0 flex flex-col items-center">
        <DynamicPlansGrid plans={normalizedPlans} currentPlanId={userPlanId} />
      </div>
    </div>
  );
}
