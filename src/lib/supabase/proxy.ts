import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  
  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/privacy-policy',
    '/cookie-policy',
    '/legal-notice',
    '/partner-policy',
    '/cuaderno/planes'
  ]
  const isPublicRoute = publicPaths.includes(pathname) || 
                       pathname.startsWith('/api') || 
                       pathname.startsWith('/auth') ||
                       pathname.startsWith('/c/')

  if (user && (pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password' || pathname === '/enrutar')) {
    const { data: userData } = await supabase.from('users').select('platform_role').eq('id', user.id).single();
    const role = userData?.platform_role || 'farmer';

    const url = request.nextUrl.clone()
    if (role === 'superadmin') {
      url.pathname = '/superadmin';
    } else if (role === 'tenant_admin') {
      url.pathname = '/admin/branding';
    } else {
      url.pathname = '/cuaderno';
    }
    return NextResponse.redirect(url)
  }

  // Dejar que '/' sea accesible públicamente incluso si el usuario está logueado
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // --- RBAC ROUTING ---
  if (user && (pathname.startsWith('/superadmin') || pathname.startsWith('/admin') || pathname.startsWith('/technician') || pathname.startsWith('/cuaderno'))) {
    const { data: userData } = await supabase.from('users').select('platform_role').eq('id', user.id).single();
    const role = userData?.platform_role || 'farmer';
    
    // Superadmin guard
    if (pathname.startsWith('/superadmin') && role !== 'superadmin') {
      const url = request.nextUrl.clone();
      url.pathname = '/cuaderno';
      return NextResponse.redirect(url);
    }
    
    // Admin (Tenant admin) guard
    if (pathname.startsWith('/admin') && role !== 'tenant_admin' && role !== 'superadmin') {
      const url = request.nextUrl.clone();
      url.pathname = '/cuaderno';
      return NextResponse.redirect(url);
    }
    
    // Technician guard
    if (pathname.startsWith('/technician') && role !== 'technician' && role !== 'tenant_admin' && role !== 'superadmin') {
      const url = request.nextUrl.clone();
      url.pathname = '/cuaderno';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse
}
