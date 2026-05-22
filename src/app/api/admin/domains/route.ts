import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Regex básica para validar dominios y subdominios
const DOMAIN_REGEX = /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;

export async function POST(req: Request) {
  try {
    const { action, tenantId, domain } = await req.json();

    // 1. Validar parámetros de entrada
    if (!action || !tenantId) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios (action, tenantId).' }, { status: 400 });
    }

    if (action !== 'add' && action !== 'remove') {
      return NextResponse.json({ error: "La acción debe ser 'add' o 'remove'." }, { status: 400 });
    }

    // 2. Autenticación del usuario
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado. Debes iniciar sesión.' }, { status: 401 });
    }

    // 3. Control de Acceso y Aislamiento por Tenant (RLS lógico en API)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('tenant_id, platform_role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Error al verificar el perfil de usuario.' }, { status: 500 });
    }

    const isSuperAdmin = profile.platform_role === 'superadmin';
    const isOwnTenant = profile.tenant_id === tenantId;

    if (!isSuperAdmin && !isOwnTenant) {
      return NextResponse.json({ error: 'Acceso denegado. No tienes permisos para gestionar dominios de este tenant.' }, { status: 403 });
    }

    const vercelToken = process.env.VERCEL_TOKEN;
    const vercelProjectId = process.env.VERCEL_PROJECT_ID;
    const vercelTeamId = process.env.VERCEL_TEAM_ID;
    const isVercelConfigured = !!(vercelToken && vercelProjectId);

    // --- ACCIÓN: ELIMINAR DOMINIO ---
    if (action === 'remove') {
      let vercelSuccess = false;
      let vercelErrorDetails = null;

      // Obtener el dominio actual para poder eliminarlo en Vercel
      const { data: tenantData } = await supabaseAdmin
        .from('tenants')
        .select('custom_domain')
        .eq('id', tenantId)
        .single();

      const domainToRemove = domain || tenantData?.custom_domain;

      if (domainToRemove) {
        if (isVercelConfigured) {
          try {
            const teamParam = vercelTeamId ? `?teamId=${vercelTeamId}` : '';
            const vercelRes = await fetch(
              `https://api.vercel.com/v9/projects/${vercelProjectId}/domains/${domainToRemove}${teamParam}`,
              {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${vercelToken}`,
                },
              }
            );

            if (vercelRes.ok || vercelRes.status === 404) {
              // 404 significa que el dominio ya no estaba en Vercel, lo cual es exitoso para nosotros
              vercelSuccess = true;
            } else {
              const errData = await vercelRes.json();
              vercelErrorDetails = errData?.error?.message || 'Error desconocido en Vercel.';
            }
          } catch (e: any) {
            console.error('Error de red al llamar a la API de Vercel:', e);
            vercelErrorDetails = e.message;
          }
        } else {
          // Si no está configurado Vercel (desarrollo local), marcamos éxito simulado
          vercelSuccess = true;
        }
      } else {
        vercelSuccess = true;
      }

      // Actualizar en base de datos de Supabase
      const { error: dbError } = await supabaseAdmin
        .from('tenants')
        .update({ custom_domain: null, updated_at: new Date().toISOString() })
        .eq('id', tenantId);

      if (dbError) {
        return NextResponse.json({ error: `Error al actualizar base de datos: ${dbError.message}` }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        vercel_configured: isVercelConfigured,
        vercel_sync: vercelSuccess,
        warning: vercelErrorDetails
      });
    }

    // --- ACCIÓN: AGREGAR DOMINIO ---
    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Debe especificarse un dominio válido.' }, { status: 400 });
    }

    // Normalizar el dominio (quitar protocolo, espacios, barras y pasar a minúsculas)
    let cleanDomain = domain.trim().toLowerCase();
    cleanDomain = cleanDomain.replace(/^(https?:\/\/)?(www\.)?/, ''); // Quita http://, https:// y www.
    cleanDomain = cleanDomain.split('/')[0]; // Quita rutas del final

    if (!DOMAIN_REGEX.test(cleanDomain)) {
      return NextResponse.json({ error: 'El formato del dominio no es válido. Ejemplos válidos: "cuaderno.cooperativa.com" o "miportal.es".' }, { status: 400 });
    }

    // Comprobar que no sea un dominio reservado del sistema
    if (
      cleanDomain === 'inagrosolutions.com' ||
      cleanDomain.endsWith('.vercel.app') ||
      cleanDomain.includes('localhost')
    ) {
      return NextResponse.json({ error: 'No está permitido usar el dominio raíz del sistema o de desarrollo local.' }, { status: 400 });
    }

    let vercelSuccess = false;
    let vercelErrorDetails = null;

    if (isVercelConfigured) {
      try {
        const teamParam = vercelTeamId ? `?teamId=${vercelTeamId}` : '';
        const vercelRes = await fetch(
          `https://api.vercel.com/v9/projects/${vercelProjectId}/domains${teamParam}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${vercelToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: cleanDomain }),
          }
        );

        const vercelData = await vercelRes.json();

        if (vercelRes.ok) {
          vercelSuccess = true;
        } else if (vercelRes.status === 409 || vercelData?.error?.code === 'domain_already_in_use') {
          // El dominio ya está registrado en este o en otro proyecto.
          // Si está en este proyecto, es correcto para nosotros.
          vercelSuccess = true;
          console.warn('El dominio ya está registrado en Vercel:', cleanDomain);
        } else {
          vercelErrorDetails = vercelData?.error?.message || 'Error desconocido al registrar el dominio en Vercel.';
        }
      } catch (e: any) {
        console.error('Error al conectar con la API de Vercel:', e);
        vercelErrorDetails = e.message;
      }
    } else {
      // Simulación local exitosa
      vercelSuccess = true;
    }

    // Si falló Vercel y está configurado en producción, bloqueamos el registro para evitar desajustes
    if (isVercelConfigured && !vercelSuccess) {
      return NextResponse.json({
        error: `Error de integración de Hosting: ${vercelErrorDetails || 'No se pudo registrar el dominio en la infraestructura.'}`
      }, { status: 500 });
    }

    // Actualizar la base de datos de Supabase con el dominio limpio
    const { error: dbError } = await supabaseAdmin
      .from('tenants')
      .update({ custom_domain: cleanDomain, updated_at: new Date().toISOString() })
      .eq('id', tenantId);

    if (dbError) {
      // Intentar revertir en Vercel en caso de fallo crítico en BD (para consistencia)
      if (isVercelConfigured && vercelSuccess) {
        const teamParam = vercelTeamId ? `?teamId=${vercelTeamId}` : '';
        await fetch(
          `https://api.vercel.com/v9/projects/${vercelProjectId}/domains/${cleanDomain}${teamParam}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${vercelToken}`,
            },
          }
        ).catch(e => console.error('Error al revertir dominio en Vercel:', e));
      }

      return NextResponse.json({ error: `Error al guardar en la base de datos: ${dbError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      vercel_configured: isVercelConfigured,
      vercel_sync: vercelSuccess,
      warning: vercelErrorDetails
    });

  } catch (error: any) {
    console.error('API Domains error:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor.' }, { status: 500 });
  }
}
