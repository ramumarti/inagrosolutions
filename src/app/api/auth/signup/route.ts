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

    let resolvedTenantId = tenantId;
    let resolvedTenantSlug = tenantSlug;
    let resolvedPlatformRole = platformRole;
    let inviteIdToMarkAccepted: string | null = null;

    // Check if there is a pending invitation for this email
    try {
      const { data: invites } = await supabaseAdmin
        .from('tenant_invitations')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .is('accepted_at', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (invites && invites.length > 0) {
        const invite = invites[0];
        resolvedTenantId = invite.tenant_id;
        resolvedPlatformRole = invite.role || 'farmer';
        inviteIdToMarkAccepted = invite.id;

        // Fetch tenant slug to keep metadata/trigger in sync
        const { data: tenantData } = await supabaseAdmin
          .from('tenants')
          .select('slug')
          .eq('id', resolvedTenantId)
          .limit(1);

        if (tenantData && tenantData.length > 0) {
          resolvedTenantSlug = tenantData[0].slug;
        }
      }
    } catch (inviteErr) {
      console.error('Error resolving invitation details during signup:', inviteErr);
    }

    // Create user via Admin Auth API with email auto-confirmed
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Bypass SMTP confirmation email sending
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        is_business: isBusiness,
        platform_role: resolvedPlatformRole,
        tenant_id: resolvedTenantId,
        tenant_slug: resolvedTenantSlug,
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

    // Update public.users profile directly to guarantee linking & platform role is correctly set
    try {
      await supabaseAdmin
        .from('users')
        .update({
          tenant_id: resolvedTenantId,
          platform_role: resolvedPlatformRole,
          billing_interval: billingInterval,
        })
        .eq('id', data.user.id);
    } catch (profileErr) {
      console.error('Error updating public.users profile:', profileErr);
    }

    // Mark invitation as accepted if applicable
    if (inviteIdToMarkAccepted) {
      try {
        await supabaseAdmin
          .from('tenant_invitations')
          .update({ accepted_at: new Date().toISOString() })
          .eq('id', inviteIdToMarkAccepted);
      } catch (inviteUpdateErr) {
        console.error('Error updating invitation accepted status:', inviteUpdateErr);
      }
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
