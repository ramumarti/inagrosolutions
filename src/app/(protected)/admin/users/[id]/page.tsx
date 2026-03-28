import React from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ChevronLeft, Key, User, Calendar, CreditCard, Activity, Copy, Clock } from 'lucide-react';
import { getUserAccessibleApps } from '@/lib/access';
import { UserPlanAction } from '@/components/admin/UserPlanAction';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function timeAgo(dateStr: string) {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const min = Math.floor(diff / 60000);
  const hours = Math.floor(min / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (min > 0) return `${min}m ago`;
  return 'Just now';
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateStr));
}

export default async function AdminUserDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [userRes, plansRes, accessibleSlugs, totalAppsRes, totalExecsRes] = await Promise.all([
    supabaseAdmin.from('users').select('*, plans(name_en, name_es, slug, price_monthly)').eq('id', id).single(),
    supabaseAdmin.from('plans').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    getUserAccessibleApps(id),
    supabaseAdmin.from('micro_apps').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('app_executions').select('id', { count: 'exact', head: true }).eq('user_id', id)
  ]);

  if (userRes.error || !userRes.data) {
    return <div className="p-8 text-center text-red-400">User not found</div>;
  }

  const user = userRes.data;
  const plans = plansRes.data || [];
  const totalApps = totalAppsRes.count || 0;
  const totalExecutions = totalExecsRes.count || 0;
  
  // PostgREST embeds might return array or single object if schema changed. Force extracting object:
  const planData = Array.isArray(user.plans) ? user.plans[0] : user.plans;

  // Execution history (admin bypass)
  const { data: rawExecutions } = await supabaseAdmin
    .from('app_executions')
    .select('*, micro_apps(name_en, name_es)')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(10);

  const executions = (rawExecutions || []).map((ex: any) => ({
    ...ex,
    micro_apps: Array.isArray(ex.micro_apps) ? ex.micro_apps[0] : ex.micro_apps
  }));

  const initial = (user.first_name?.[0] || user.email[0]).toUpperCase();

  return (
    <div className="w-full flex justify-center">
      <div className="max-w-7xl w-full flex flex-col pt-8 gap-6 px-4 lg:px-0 pb-20">
        <div className="flex items-center">
          <Link href="/admin" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Back to Users</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Col 1: Details & Plan */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col gap-6 backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-primary)]/40 to-black/40 border border-white/10 flex items-center justify-center shrink-0">
                  <span className="text-2xl font-semibold text-white/80">{initial}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{user.first_name} {user.last_name}</h2>
                  <p className="text-white/50">{user.email}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 py-4 border-y border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50 flex items-center gap-2"><Key className="w-4 h-4"/> ID</span>
                  <span className="font-mono text-white/70">{user.id.substring(0,8)}...</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50 flex items-center gap-2"><User className="w-4 h-4"/> Role</span>
                  <span className="capitalize text-white/90">{user.role}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50 flex items-center gap-2"><Calendar className="w-4 h-4"/> Joined</span>
                  <span className="text-white/90">{formatDate(user.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col gap-4 backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-3 text-[var(--color-primary)] mb-2">
                <CreditCard className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Plan Assignment</h3>
              </div>

              {/* Plan Name + Price */}
              <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between">
                <span className="text-white/60">Current:</span>
                <span className="font-semibold text-white">
                  {planData ? `${planData.name_en} (${planData.price_monthly} €)` : 'No Plan'}
                </span>
              </div>

              {/* Enhanced Info Grid */}
              {planData && (
                <div className="grid grid-cols-1 gap-3">
                  {/* Assigned Date */}
                  {user.plan_assigned_at && (
                    <div className="p-3 rounded-lg bg-black/10 border border-white/5 flex items-center justify-between text-sm">
                      <span className="text-white/50 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Since
                      </span>
                      <span className="text-white/80">
                        {new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(user.plan_assigned_at))}
                      </span>
                    </div>
                  )}

                  {/* Days Active */}
                  {user.plan_assigned_at && (
                    <div className="p-3 rounded-lg bg-black/10 border border-white/5 flex items-center justify-between text-sm">
                      <span className="text-white/50 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        Active
                      </span>
                      <span className="text-white/80">
                        {Math.max(0, Math.floor((Date.now() - new Date(user.plan_assigned_at).getTime()) / 86400000))} days
                      </span>
                    </div>
                  )}

                  {/* Apps Unlocked */}
                  <div className="p-3 rounded-lg bg-black/10 border border-white/5 flex items-center justify-between text-sm">
                    <span className="text-white/50 flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5" />
                      Apps
                    </span>
                    <span className="text-emerald-400 font-medium">
                      {accessibleSlugs.length} of {totalApps} apps
                    </span>
                  </div>

                  {/* Total Executions */}
                  <div className="p-3 rounded-lg bg-black/10 border border-white/5 flex items-center justify-between text-sm">
                    <span className="text-white/50 flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5" />
                      Executions
                    </span>
                    <span className="text-blue-400 font-medium">
                      {totalExecutions} total
                    </span>
                  </div>
                </div>
              )}
              
              <UserPlanAction userId={user.id} currentPlanId={user.plan_id} plans={plans} />
            </div>
          </div>

          {/* Col 2: Apps & History */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col gap-4 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 text-emerald-400">
                  <Activity className="w-5 h-5" />
                  <h3 className="font-semibold text-lg">Accessible Apps</h3>
                </div>
                <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                  {accessibleSlugs.length} apps accessible
                </span>
              </div>
              {accessibleSlugs.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {accessibleSlugs.map(slug => (
                    <span key={slug} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-sm font-medium border border-emerald-500/20">
                      {slug}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-black/20 border border-white/5 text-center text-white/50">
                  This user currently has no access to any apps.
                </div>
              )}
              <p className="text-xs text-white/40 mt-2">Note: Override management coming in Day 9.</p>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col gap-4 backdrop-blur-md shadow-xl w-full">
              <div className="flex items-center gap-3 text-blue-400 mb-2">
                <Clock className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Execution History</h3>
              </div>
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left break-words">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50 text-sm">
                      <th className="pb-3 pr-2 font-medium">App</th>
                      <th className="pb-3 px-2 font-medium">Status</th>
                      <th className="pb-3 pl-2 font-medium text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executions.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-white/50">
                          No executions found.
                        </td>
                      </tr>
                    ) : (
                      executions.map((ex: any) => {
                        const isSuccess = ex.status === 'completed';
                        return (
                          <tr key={ex.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="py-3 pr-2 font-medium text-white/80">
                              {ex.micro_apps?.name_en || ex.app_id}
                            </td>
                            <td className="py-3 px-2">
                              {isSuccess ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  Success
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                                  {ex.status}
                                </span>
                              )}
                            </td>
                            <td className="py-3 pl-2 text-right text-white/50 text-sm">
                              {formatDate(ex.created_at)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
