'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {}
      }
    }
  );
}

export async function getFullNotebookData(userId: string) {
  const supabase = await getSupabase();
  
  // 1. User & Tenant Info
  const { data: user } = await supabase
    .from('users')
    .select('*, tenants(*)')
    .eq('id', userId)
    .single();

  // 2. Explotaciones & Parcelas
  const { data: explotaciones } = await supabase
    .from('explotaciones')
    .select('*, parcelas(*)')
    .eq('user_id', userId);

  const parcelaIds = explotaciones?.flatMap(e => e.parcelas?.map(p => p.id)) || [];

  // 3. Fitosanitarios
  const { data: treatments } = await supabase
    .from('tratamientos_fitosanitarios')
    .select(`
      *,
      parcela:parcelas(nombre, recinto, poligono, parcela),
      worker:workers(nombre, carnet_ropo),
      machinery:machinery(nombre, roma)
    `)
    .in('parcela_id', parcelaIds);

  // 4. Labores
  const { data: labors } = await supabase
    .from('labores')
    .select(`
      *,
      parcela:parcelas(nombre, recinto),
      worker:workers(nombre),
      machinery:machinery(nombre)
    `)
    .in('parcela_id', parcelaIds);

  // 5. Fertilización
  const { data: fertilizations } = await supabase
    .from('fertilizaciones')
    .select(`
      *,
      parcela:parcelas(nombre, recinto)
    `)
    .in('parcela_id', parcelaIds);

  return {
    owner: user,
    tenant: user?.tenants,
    explotaciones: explotaciones || [],
    activities: {
      treatments: (treatments || []).map(t => ({
        ...t,
        producto_comercial: t.nombre_producto,
        dosis_total: t.dosis,
        num_registro_rop: t.producto_mapa_id,
        // Adapt machinery/personal to the template format (array)
        maquinaria: t.machinery ? [{ maquinaria: t.machinery }] : [],
        personal: t.worker ? [{ workers: t.worker }] : []
      })),
      labors: labors || [],
      fertilizations: fertilizations || []
    }
  };
}
