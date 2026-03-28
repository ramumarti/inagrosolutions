import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserAccessibleApps } from '@/lib/access';
import { AppsGrid } from '@/components/apps/AppsGrid';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AppsDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const accessibleSlugs = await getUserAccessibleApps(user.id);
  
  const { data: microApps } = await supabase
    .from('micro_apps')
    .select('*')
    .order('created_at', { ascending: true });

  return (
    <div className="w-full h-full flex flex-col pt-4">
      <AppsGrid 
        apps={microApps || []} 
        accessibleSlugs={accessibleSlugs} 
        hasAnyAccess={accessibleSlugs.length > 0} 
      />
    </div>
  );
}
