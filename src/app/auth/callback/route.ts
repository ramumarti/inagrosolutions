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

      // ---------------------------------------------------------------
      // NOTA: La creación de tenant para cuentas de empresa (is_business)
      // se gestiona automáticamente por el trigger de BD `handle_new_user()`
      // con SECURITY DEFINER, lo que evita problemas con RLS.
      // ---------------------------------------------------------------

      // -- Flujo para Auto-vinculación de Agricultores (/c/[slug]) --
      if (metadata?.tenant_slug && !metadata?.is_business) {
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

      // Redirigir al portal principal (el Middleware se encargará de llevarle 
      // a su dashboard correspondiente según su rol)
      return NextResponse.redirect(`${origin}/`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-link-failed`)
}
