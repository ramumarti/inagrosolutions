import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (data?.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="max-w-7xl mx-auto w-full pb-20 space-y-8">
      {children}
    </div>
  );
}
