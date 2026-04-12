import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && authData?.user) {
      const userEmail = authData.user.email
      const metadata = authData.user.user_metadata

      // -- Flujo para Cuentas de Empresa (Marca Blanca) --
      if (metadata?.is_business && metadata?.company_name) {
        // Verificar si el usuario ya tiene un tenant asignado en la tabla publica
        const { data: publicUser } = await supabase
          .from('users')
          .select('tenant_id')
          .eq('id', authData.user.id)
          .single();

        if (publicUser && !publicUser.tenant_id) {
          // Crear el Tenant (Entidad) automáticamente
          const slug = metadata.company_name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

          const { data: newTenant, error: tenantError } = await supabase
            .from('tenants')
            .insert({
              name: metadata.company_name,
              slug: `${slug}-${Math.random().toString(36).substring(2, 7)}`, // Slug único
              type: 'cooperativa',
              subscription_tier: 'basico'
            })
            .select()
            .single();

          if (!tenantError && newTenant) {
            // Asignar el nuevo tenant y el rol de admin al usuario
            await supabase.from('users').update({
              tenant_id: newTenant.id,
              platform_role: 'tenant_admin'
            }).eq('id', authData.user.id);
          }
        }
      } else if (metadata?.tenant_slug) {
        // -- Flujo para Auto-vinculación de Agricultores (/c/[slug]) --
        const { data: targetTenant } = await supabase
          .from('tenants')
          .select('id')
          .eq('slug', metadata.tenant_slug)
          .single();
          
        if (targetTenant) {
          await supabase.from('users').update({
            tenant_id: targetTenant.id,
            platform_role: 'farmer'
          }).eq('id', authData.user.id);
        }
      }

      // -- Punto 3: Flujo de Aceptación de Invitaciones --
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

      // Redirigir al portal principal (el Middleware se encargará de llevarle a su dashboard correspondiente según su rol)
      return NextResponse.redirect(`${origin}/`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-link-failed`)
}
