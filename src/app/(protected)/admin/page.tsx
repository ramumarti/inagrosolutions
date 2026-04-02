import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { UsersTable } from '@/components/admin/UsersTable';
import { RecentActivity, ActivityItem } from '@/components/admin/RecentActivity';
import { Users, CreditCard, Activity, DollarSign } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminUsersPage() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [usersResponse, plansResponse, totalUsersRes, usersWithPlanRes, totalExplotacionesRes, webhookLogsRes, recentPaymentsRes] = await Promise.all([
    supabaseAdmin.from('users').select('*, plans(name_en, name_es, slug)').order('created_at', { ascending: false }),
    supabaseAdmin.from('plans').select('id, name_en, name_es, sort_order').eq('is_active', true).order('sort_order', { ascending: true }),
    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).not('plan_id', 'is', null),
    supabaseAdmin.from('explotaciones').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('webhook_logs').select('normalized_payload').eq('status', 'processed'),
    supabaseAdmin.from('webhook_logs').select('id, normalized_payload, created_at').eq('status', 'processed').order('created_at', { ascending: false }).limit(5)
  ]);

  const users = usersResponse.data || [];
  const plans = plansResponse.data || [];
  const totalUsers = totalUsersRes.count || 0;
  const usersWithPlan = usersWithPlanRes.count || 0;
  const totalExplotaciones = totalExplotacionesRes.count || 0;
  const recentPayments = (recentPaymentsRes.data || []) as any[];

  // Calculate simulated revenue from webhook logs
  const simulatedRevenue = (webhookLogsRes.data || []).reduce((sum: number, log: any) => {
    const amount = log.normalized_payload?.amount;
    return sum + (typeof amount === 'number' ? amount : parseFloat(amount) || 0);
  }, 0);

  const stats = [
    { label: 'Total Users', labelEs: 'Total Usuarios', value: totalUsers.toLocaleString(), icon: Users, color: 'text-blue-400' },
    { label: 'Users with Plan', labelEs: 'Usuarios con Plan', value: usersWithPlan.toLocaleString(), icon: CreditCard, color: 'text-indigo-400' },
    { label: 'Total Farms', labelEs: 'Explotaciones Totales', value: totalExplotaciones.toLocaleString(), icon: Activity, color: 'text-amber-400' },
    { label: 'Simulated Revenue', labelEs: 'Ingresos Simulados', value: `${simulatedRevenue.toFixed(2)} €`, icon: DollarSign, color: 'text-blue-400' },
  ];

  // Combine activities for the feed
  const activities: ActivityItem[] = [
    ...users.slice(0, 5).map(u => ({
      id: u.id,
      type: 'user' as const,
      descriptionEn: `🆕 New user ${u.first_name || u.email} joined`,
      descriptionEs: `🆕 Nuevo usuario ${u.first_name || u.email} se registró`,
      timestamp: u.created_at,
      iconType: 'user' as const
    })),
    ...recentPayments.map(p => ({
      id: p.id,
      type: 'payment' as const,
      descriptionEn: `💰 Payment of ${p.normalized_payload?.amount || 0} € received from ${p.normalized_payload?.customer_email || 'unknown'}`,
      descriptionEs: `💰 Pago de ${p.normalized_payload?.amount || 0} € recibido de ${p.normalized_payload?.customer_email || 'unknown'}`,
      timestamp: p.created_at,
      iconType: 'payment' as const
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

  return (
    <div className="flex flex-col gap-8 px-4 lg:px-8 py-6">
      {/* Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-5 flex items-center gap-4 shadow-lg active:scale-[0.98] transition-all cursor-default"
          >
            <div className={`w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
              <p className="text-[10px] uppercase font-bold text-white/30 tracking-wider">
                {stat.label} / {stat.labelEs}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Table Area */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <UsersTable initialUsers={users} activePlans={plans} />
        </div>

        {/* Activity Sidebar Area */}
        <div className="xl:col-span-1">
          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  );
}
