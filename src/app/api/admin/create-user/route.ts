import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, planId } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Create the user in Auth
    // NOTE: user_metadata prevents duplicate keys; we specifically map firstName and lastName
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const newUserId = authData.user.id;

    // 2. If a plan was selected, update the generated public.users row
    let emailSent = false;
    let planName = 'Plan Premium';

    if (planId) {
      const { data: planData } = await supabaseAdmin.from('plans').select('name_es').eq('id', planId).single();
      if (planData?.name_es) planName = planData.name_es;
      
      const { error: planError } = await supabaseAdmin
        .from('users')
        .update({
          plan_id: planId,
          plan_assigned_at: new Date().toISOString(),
          plan_source: 'manual'
        })
        .eq('id', newUserId);

      if (planError) {
        console.error('Error assigning plan:', planError);
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const emailResult = await sendWelcomeEmail({
      to: email,
      firstName,
      planName,
      password,
      loginUrl: `${appUrl}/auth/login`
    });
    emailSent = emailResult.success;

    return NextResponse.json({ success: true, user: authData.user, email_sent: emailSent }, { status: 200 });
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
