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
    <div className="w-full flex justify-center pt-8">
      <div className="max-w-7xl w-full px-4 lg:px-0">
        <PlansGrid initialPlans={plans} />
      </div>
    </div>
  );
}
