import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, action, slug, name_en, name_es, description_en, description_es, price_monthly, price_annual, items_en, items_es } = body;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (action === 'create') {
      const { data, error } = await supabaseAdmin
        .from('plans')
        .insert({
          slug, name_en, name_es, description_en, description_es, price_monthly, price_annual, items_en, items_es
        })
        .select()
        .single();
      
      if (error) throw error;
      return NextResponse.json({ success: true, plan: data }, { status: 200 });
    } else {
      const { data, error } = await supabaseAdmin
        .from('plans')
        .update({
          name_en, name_es, description_en, description_es, price_monthly, price_annual, items_en, items_es
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, plan: data }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Save plan error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
