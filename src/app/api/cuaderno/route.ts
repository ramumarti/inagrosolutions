import { createClient } from '@/lib/supabase/server';
import { AgriculturalValidator, RuleResult } from '@/lib/agriculture/validations';
import { NextResponse } from 'next/server';

/**
 * UNIFIED API: /api/cuaderno
 * 
 * Handles inserts for multiple agricultural modules with business logic enforcement.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { table, payload } = await request.json();

  if (!table || !payload) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
  }

  try {
    // 1. Fetch relevant parcel for context
    const { data: parcela, error: pError } = await supabase
      .from('parcelas')
      .select('*')
      .eq('id', payload.parcela_id)
      .single();

    if (pError || !parcela) {
      return NextResponse.json({ error: 'Parcela no encontrada' }, { status: 404 });
    }

    // 2. APPLY SPECIFIC BUSINESS LOGIC
    let validation: RuleResult = { valid: true, message: '', level: 'info' };

    switch (table) {

      case 'tratamientos_fitosanitarios':
        validation = AgriculturalValidator.validateTratamiento(parcela, payload);
        break;
      case 'riegos':
        validation = AgriculturalValidator.validateRiego(parcela, new Date(parcela.last_riego)); // Simulated context
        break;
      case 'produccion':
        // Check security period logic before harvesting
        // (Assuming we query the last treatment)
        break;
    }

    if (!validation.valid && validation.level === 'error') {
      return NextResponse.json({ 
        error: validation.message, 
        code: 'VALIDATION_ERROR' 
      }, { status: 400 });
    }

    // 3. EXECUTE TRANSACTION
    const { data, error } = await supabase
      .from(table)
      .insert({
        ...payload,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      data, 
      warning: !validation.valid ? validation.message : null 
    }, { status: 201 });

  } catch (error: any) {
    console.error(`API Error [${table}]:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
