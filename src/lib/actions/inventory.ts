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

export async function getInventory(explotacionId: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('inventario_insumos')
    .select('*')
    .eq('explotacion_id', explotacionId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addStock(data: { 
  explotacion_id: string, 
  tipo: string, 
  nombre_producto: string, 
  numero_registro?: string, 
  lote?: string, 
  cantidad: number, 
  unidad: string,
  precio_unitario?: number
}) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from('inventario_insumos')
    .insert({
      explotacion_id: data.explotacion_id,
      tipo: data.tipo,
      nombre_producto: data.nombre_producto,
      numero_registro: data.numero_registro,
      lote: data.lote,
      cantidad_inicial: data.cantidad,
      cantidad_actual: data.cantidad,
      unidad: data.unidad,
      precio_unitario: data.precio_unitario || 0
    });

  if (error) throw error;
  return { success: true };
}

export async function deductStock(id: string, usedAmount: number) {
  const supabase = await getSupabase();
  
  // First get current stock
  const { data: item, error: fetchErr } = await supabase
    .from('inventario_insumos')
    .select('cantidad_actual')
    .eq('id', id)
    .single();

  if (fetchErr || !item) throw new Error('Product not found in inventory');

  const newStock = Math.max(0, item.cantidad_actual - usedAmount);

  const { error: updateErr } = await supabase
    .from('inventario_insumos')
    .update({ cantidad_actual: newStock, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (updateErr) throw updateErr;
  return { success: true };
}
