import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client using Service Role Key to bypass SMTP email verification
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase admin credentials are not configured in environment variables.');
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      firstName,
      lastName,
      isBusiness = false,
      platformRole = 'farmer',
      tenantId = null,
      tenantSlug = null,
      planId = 'basico',
      billingInterval = 'month',
      // Partner fields if applicable
      companyName = null,
      nifCif = null,
      phone = null,
      address = null,
      province = null,
      estimatedMembers = null,
    } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son obligatorios.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getAdminClient();

    // Create user via Admin Auth API with email auto-confirmed
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Bypass SMTP confirmation email sending
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        is_business: isBusiness,
        platform_role: platformRole,
        tenant_id: tenantId,
        tenant_slug: tenantSlug,
        plan_id: planId,
        plan_slug: planId,
        billing_interval: billingInterval,
        company_name: companyName,
        nif_cif: nifCif,
        phone,
        address,
        province,
        estimated_members: estimatedMembers,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: data.user,
    });
  } catch (err: any) {
    console.error('Signup API error:', err);
    return NextResponse.json(
      { error: err.message || 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
