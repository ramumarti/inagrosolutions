import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let isAuthorized = false;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('platform_role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching admin role:', error);
      // Si hay error pero el usuario existe, podemos ser menos restrictivos o 
      // redirigir a una página de espera
    }

    isAuthorized = data?.platform_role === 'superadmin' || data?.platform_role === 'tenant_admin';
  } catch (err) {
    console.error('Crash in AdminLayout:', err);
  }

  if (!isAuthorized) {
    redirect('/');
  }

  return (
    <div className="max-w-7xl mx-auto w-full pb-20 space-y-8">
      {children}
    </div>
  );
}
