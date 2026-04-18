'use server';

import { createClient } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';
import { validateGlobalSiexPayload } from '../validators/siex-validator';

export async function generateSiexData(explotacionId: string, campanaId: string) {
  const supabase = await createClient();

  const [parcelasRes, explotacionRes, tratamientosRes, laboresRes, fertRes] = await Promise.all([
    supabase.from('parcelas').select('*').eq('explotacion_id', explotacionId),
    supabase.from('explotaciones').select('*').eq('id', explotacionId).single(),
    supabase.from('tratamientos_fitosanitarios').select('*').eq('campana_id', campanaId).eq('explotacion_id', explotacionId),
    supabase.from('labores').select('*').eq('campana_id', campanaId).eq('explotacion_id', explotacionId),
    supabase.from('fertilizaciones').select('*').eq('campana_id', campanaId).eq('explotacion_id', explotacionId)
  ]);

  const parcelas = parcelasRes.data || [];
  const explotacion = explotacionRes.data;
  const tratamientos = tratamientosRes.data || [];
  const labores = laboresRes.data || [];
  const fertilizaciones = fertRes.data || [];

  const validation = validateGlobalSiexPayload({ parcelas, tratamientos, productos_mapa: [] });

  return {
    explotacion,
    parcelas,
    tratamientos,
    labores,
    fertilizaciones,
    validation
  };
}


