import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { TIER_CONFIG, type AgriTier } from '@/lib/modules'

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: Request) {
  const { searchParams, origin: browserOrigin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Determinamos el origin seguro para evitar redirecciones a localhost en producción
  const safeOrigin = browserOrigin;
  
  if (code) {
    const supabase = await createClient()
    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && authData?.user) {
      const userEmail = authData.user.email
      const metadata = authData.user.user_metadata

      // ---------------------------------------------------------------
      // NOTA: La creación de tenant para cuentas de empresa (is_business)
      // se gestiona automáticamente por el trigger de BD `handle_new_user()`
      // con SECURITY DEFINER, lo que evita problemas con RLS.
      // ---------------------------------------------------------------

      // -- Flujo para Agricultores (Auto-vinculación a /c/[slug] y/o asignación de Plan) --
      const isFarmerReg = metadata?.is_partner_reg === false || metadata?.is_business === false || metadata?.platform_role === 'farmer';
      
      if (isFarmerReg) {
        let updateData: any = {};
        
        // Asignar el rol siempre a tenant_member (o el que venga en el auth)
        updateData.platform_role = metadata?.platform_role || 'farmer';
        
        // Asignar plan_id o plan_slug si existe
        const planId = (metadata?.plan_id || metadata?.plan_slug) as AgriTier | undefined;
        if (planId) {
          updateData.agri_tier = planId;
        }

        // Si viene desde un tenant con id o slug, obtenemos el tenant_id
        let resolvedTenantId: string | null = metadata?.tenant_id || null;
        
        // Fallback: buscar tenant por slug en metadata o en searchParams de la URL
        const tenantSlugParam = searchParams.get('tenant') || metadata?.tenant_slug;

        if (resolvedTenantId) {
          updateData.tenant_id = resolvedTenantId;
        } else if (tenantSlugParam) {
          const { data: targetTenant } = await supabase
            .from('tenants')
            .select('id')
            .eq('slug', tenantSlugParam.toLowerCase().trim())
            .single();
            
          if (targetTenant) {
            updateData.tenant_id = targetTenant.id;
            resolvedTenantId = targetTenant.id;
          }
        }

        // Ejecutar actualización si hay algo que actualizar
        if (Object.keys(updateData).length > 0) {
          await supabase.from('users').update(updateData).eq('id', authData.user.id);
        }

        // ── FLUJO DE PAGO AUTOMÁTICO ──
        // Si el agricultor eligió un plan al registrarse, iniciamos el checkout de Stripe
        // automáticamente para que complete el pago antes de entrar al cuaderno.
        if (planId && TIER_CONFIG[planId]) {
          try {
            const adminSupabase = getAdminSupabase();
            const tierInfo = TIER_CONFIG[planId];
            
            let stripeAccountId: string | null = null;
            
            // Buscar tenant por id para ver si tiene Connect configurado
            if (resolvedTenantId) {
              const { data: tenant } = await adminSupabase
                .from('tenants')
                .select('id, stripe_account_id, stripe_charges_enabled')
                .eq('id', resolvedTenantId)
                .single();
              if (tenant) {
                if (tenant.stripe_account_id && tenant.stripe_charges_enabled) {
                  stripeAccountId = tenant.stripe_account_id;
                }
              }
            }

            // Crear o recuperar Stripe Customer
            const { data: userProfile } = await adminSupabase
              .from('users')
              .select('stripe_customer_id')
              .eq('id', authData.user.id)
              .single();

            let customerId = userProfile?.stripe_customer_id;
            if (!customerId) {
              const customerParams = {
                email: authData.user.email!,
                metadata: { supabaseUUID: authData.user.id },
              };
              const customer = stripeAccountId
                ? await stripe.customers.create(customerParams, { stripeAccount: stripeAccountId })
                : await stripe.customers.create(customerParams);
              customerId = customer.id;
              await adminSupabase
                .from('users')
                .update({ stripe_customer_id: customerId })
                .eq('id', authData.user.id);
            }

            // Determinar intervalo de facturación (mensual o anual)
            const isAnnual = metadata?.billing_interval === 'year';
            const price = isAnnual ? tierInfo.price_annual : tierInfo.price_monthly;
            const interval = isAnnual ? 'year' : 'month';

            // Crear Checkout Session de Stripe
            const sessionParams: any = {
              customer: customerId,
              line_items: [{
                price_data: {
                  currency: 'eur',
                  product_data: {
                    name: `Cuaderno Digital - Plan ${tierInfo.label_es}`,
                    description: isAnnual
                      ? `Suscripción anual al Cuaderno Digital. Acceso SIEX completo.`
                      : `Suscripción mensual al Cuaderno Digital. Acceso SIEX completo.`,
                  },
                  unit_amount: Math.round(price * 100),
                  recurring: { interval },
                },
                quantity: 1,
              }],
              mode: 'subscription',
              success_url: `${safeOrigin}/cuaderno?payment=success&session_id={CHECKOUT_SESSION_ID}`,
              cancel_url: `${safeOrigin}/cuaderno`,
              metadata: {
                userId: authData.user.id,
                tenantId: resolvedTenantId || '',
                plan: planId,
                interval,
              },
              subscription_data: {
                metadata: {
                  userId: authData.user.id,
                  tenantId: resolvedTenantId || '',
                },
              },
              locale: 'es',
              allow_promotion_codes: true,
            };

            if (stripeAccountId) {
              sessionParams.subscription_data.application_fee_percent = 50;
            }

            const session = stripeAccountId
              ? await stripe.checkout.sessions.create(sessionParams, { stripeAccount: stripeAccountId })
              : await stripe.checkout.sessions.create(sessionParams);

            if (session.url) {
              return NextResponse.redirect(session.url);
            }
          } catch (stripeError: any) {
            console.error('[AUTH_CALLBACK] Error creando sesión Stripe:', stripeError.message);
            // Si Stripe falla, continuamos al cuaderno (el cuaderno mostrará el bloqueo de pago)
          }
        }
      }

      // -- Flujo de Aceptación de Invitaciones --
      if (userEmail) {
        const { data: invite } = await supabase
          .from('tenant_invitations')
          .select('id, tenant_id, role')
          .eq('email', userEmail)
          .is('accepted_at', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (invite) {
          // Actualizamos el usuario público con el tenant y rol de la invitación
          await supabase.from('users').update({
            tenant_id: invite.tenant_id,
            platform_role: invite.role
          }).eq('id', authData.user.id)

          // Marcamos la invitación como aceptada para que no se use de nuevo
          await supabase.from('tenant_invitations').update({
            accepted_at: new Date().toISOString()
          }).eq('id', invite.id)
        }
      }

      const next = searchParams.get('next')
      
      if (next) {
        return NextResponse.redirect(`${safeOrigin}${next}`)
      }

      // Redirigir al portal principal (el Middleware se encargará de llevarle 
      // a su dashboard correspondiente según su rol)
      return NextResponse.redirect(`${safeOrigin}/enrutar`)
    }
  }

  // Si llegamos aquí es que algo falló (link caducado o inválido)
  // Intentamos redirigir al login con un mensaje claro
  return NextResponse.redirect(`${safeOrigin}/login?error=auth-link-failed&details=otp-expired-or-invalid`)
}
