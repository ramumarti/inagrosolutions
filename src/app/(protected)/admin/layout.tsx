import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await supabase
    .from('users')
    .select('platform_role')
    .eq('id', user.id)
    .single();

  const isAuthorized = data?.platform_role === 'superadmin' || data?.platform_role === 'tenant_admin';

  if (!isAuthorized) {
    redirect('/');
  }

  return (
    <div className="max-w-7xl mx-auto w-full pb-20 space-y-8">
      {children}
    </div>
  );
}
