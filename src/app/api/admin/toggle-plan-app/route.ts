import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, planId, appId } = body;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (action === 'add') {
      const { error } = await supabaseAdmin
        .from('plan_apps')
        .insert({ plan_id: planId, app_id: appId });
      if (error) throw error;
    } else if (action === 'remove') {
      const { error } = await supabaseAdmin
        .from('plan_apps')
        .delete()
        .match({ plan_id: planId, app_id: appId });
      if (error) throw error;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Toggle plan app error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
