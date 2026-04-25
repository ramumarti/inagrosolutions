import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
      if (metadata?.is_partner_reg === false || metadata?.is_business === false) {
        let updateData: any = {};
        
        // Asignar el rol siempre a tenant_member (o el que venga en el auth)
        updateData.platform_role = metadata?.platform_role || 'tenant_member';
        
        // Asignar plan_id si existe
        if (metadata?.plan_id) {
          updateData.agri_tier = metadata.plan_id;
        }

        // Si viene desde un tenant, obtenemos el tenant_id
        if (metadata?.tenant_slug) {
          const { data: targetTenant } = await supabase
            .from('tenants')
            .select('id')
            .eq('slug', metadata.tenant_slug)
            .single();
            
          if (targetTenant) {
            updateData.tenant_id = targetTenant.id;
          }
        }

        // Ejecutar actualización si hay algo que actualizar
        if (Object.keys(updateData).length > 0) {
          await supabase.from('users').update(updateData).eq('id', authData.user.id);
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
      return NextResponse.redirect(`${safeOrigin}/enrutar`)
    }
  }

  // Si llegamos aquí es que algo falló (link caducado o inválido)
  // Intentamos redirigir al login con un mensaje claro
  return NextResponse.redirect(`${safeOrigin}/login?error=auth-link-failed&details=otp-expired-or-invalid`)
}
