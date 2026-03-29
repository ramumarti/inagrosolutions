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

  const [plansRes, appsRes, planAppsRes, usersRes] = await Promise.all([
    supabaseAdmin.from('plans').select('*').order('sort_order', { ascending: true }),
    supabaseAdmin.from('micro_apps').select('id, slug, name_en, name_es, icon').order('created_at', { ascending: true }),
    supabaseAdmin.from('plan_apps').select('plan_id, app_id'),
    supabaseAdmin.from('users').select('plan_id')
  ]);

  const rawPlans = plansRes.data || [];
  const microApps = appsRes.data || [];
  const planAppsData = planAppsRes.data || [];
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

  // Map planApps
  const planAppsMap: Record<string, string[]> = {};
  planAppsData.forEach(pa => {
    if (!planAppsMap[pa.plan_id]) planAppsMap[pa.plan_id] = [];
    planAppsMap[pa.plan_id].push(pa.app_id);
  });

  return (
    <div className="w-full flex justify-center pt-8">
      <div className="max-w-7xl w-full px-4 lg:px-0">
        <PlansGrid initialPlans={plans} allApps={microApps} initialPlanApps={planAppsMap} />
      </div>
    </div>
  );
}
