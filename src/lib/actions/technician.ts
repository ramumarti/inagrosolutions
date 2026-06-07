'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {}
      }
    }
  );
}

export async function getAssignedFarmers() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: userData } = await supabase.from('users').select('tenant_id, platform_role').eq('id', user.id).single();
  const tenantId = userData?.tenant_id;
  const role = userData?.platform_role;
  if (!tenantId) throw new Error('No tenant associated');

  let farmersList: any[] = [];

  if (role === 'tenant_admin' || role === 'superadmin') {
    // Los administradores de la cooperativa ven a TODOS los agricultores de su tenant
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, email, first_name, last_name, phone,
        explotaciones:explotaciones(count),
        validaciones:cuaderno_validaciones(estado, validated_at, campana_id)
      `)
      .eq('tenant_id', tenantId)
      .eq('platform_role', 'farmer');
    
    if (error) throw error;
    farmersList = data || [];
  } else {
    // Los técnicos rasos solo ven a los que tienen asignados
    const { data, error } = await supabase
      .from('technician_assignments')
      .select(`
        farmer:users!technician_assignments_farmer_id_fkey(
          id, email, first_name, last_name, phone,
          explotaciones:explotaciones(count),
          validaciones:cuaderno_validaciones(estado, validated_at, campana_id)
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('technician_id', user.id)
      .eq('is_active', true);

    if (error) throw error;
    farmersList = data.map((d: any) => d.farmer).filter(Boolean);
  }

  return farmersList;
}

export async function getTechnicianDashboardData() {
  const supabase = await getSupabase();
  const farmers = await getAssignedFarmers();
  const totalFarmers = farmers.length;
  const totalExplotaciones = farmers.reduce((acc: number, f: any) => acc + (f.explotaciones?.[0]?.count || 0), 0);
  
  if (totalFarmers === 0) {
    return { totalFarmers: 0, totalExplotaciones: 0, cuadernosPendientes: 0, recentActivity: [] };
  }

  const farmerIds = farmers.map((f: any) => f.id);

  // Fetch recent activities across all assigned farmers
  // Using parallel requests for performance
  const [tratamientosRes, fertilizacionesRes, cosechasRes] = await Promise.all([
    supabase
      .from('tratamientos_fitosanitarios')
      .select('id, fecha, nombre_producto, user_id, created_at')
      .in('user_id', farmerIds)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('fertilizaciones')
      .select('id, fecha, tipo_abono, user_id, created_at')
      .in('user_id', farmerIds)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('cosechas')
      .select('id, fecha, producto, user_id, created_at')
      .in('user_id', farmerIds)
      .order('created_at', { ascending: false })
      .limit(10)
  ]);

  let allActivities: any[] = [];

  const trats = tratamientosRes.data || [];
  trats.forEach((t: any) => {
    const farmer = farmers.find((f: any) => f.id === t.user_id);
    allActivities.push({
      type: 'Tratamiento',
      farmer: farmer ? `${farmer.first_name} ${farmer.last_name}` : 'Desconocido',
      item: t.nombre_producto || 'Fitosanitario',
      time: t.created_at,
      icon: 'Bug',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    });
  });

  const ferts = fertilizacionesRes.data || [];
  ferts.forEach((f: any) => {
    const farmer = farmers.find((fa: any) => fa.id === f.user_id);
    allActivities.push({
      type: 'Abonado',
      farmer: farmer ? `${farmer.first_name} ${farmer.last_name}` : 'Desconocido',
      item: f.tipo_abono || 'Fertilizante',
      time: f.created_at,
      icon: 'Droplets',
      color: 'text-violet-400',
      bg: 'bg-violet-500/10'
    });
  });

  const cos = cosechasRes.data || [];
  cos.forEach((c: any) => {
    const farmer = farmers.find((fa: any) => fa.id === c.user_id);
    allActivities.push({
      type: 'Cosecha',
      farmer: farmer ? `${farmer.first_name} ${farmer.last_name}` : 'Desconocido',
      item: c.producto || 'Recolección',
      time: c.created_at,
      icon: 'Leaf',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    });
  });

  // Sort combined by created_at desc
  allActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  const recentActivity = allActivities.slice(0, 5).map(act => {
    // Format "Hace X horas"
    const diffMs = new Date().getTime() - new Date(act.time).getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);
    
    let timeStr = 'Hace un momento';
    if (diffDays > 0) timeStr = `Hace ${diffDays} días`;
    else if (diffHrs > 0) timeStr = `Hace ${diffHrs} horas`;
    else if (diffMs > 60000) timeStr = `Hace ${Math.floor(diffMs / 60000)} min`;
    
    return { ...act, time: timeStr };
  });

  // Cálculo de cuadernos pendientes reales (ej: fincas sin actividad reciente)
  // Como aproximación real para la v1.0, calculamos cuántos farmers NO han tenido actividad
  const activeFarmerIds = new Set([
    ...trats.map((t: any) => t.user_id),
    ...ferts.map((f: any) => f.user_id),
    ...cos.map((c: any) => c.user_id)
  ]);
  
  const cuadernosPendientes = totalFarmers - activeFarmerIds.size;

  return {
    totalFarmers,
    totalExplotaciones,
    cuadernosPendientes: cuadernosPendientes > 0 ? cuadernosPendientes : 0,
    recentActivity
  };
}

export async function validateFarmerNotebook(farmerId: string, campanaId: string, estado: string, observaciones: string) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('cuaderno_validaciones')
    .insert({
      farmer_id: farmerId,
      technician_id: user.id,
      campana_id: campanaId,
      estado,
      observaciones,
      validated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return { success: true, data };
}

export async function getFarmerValidations(farmerId: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('cuaderno_validaciones')
    .select(`
      *,
      technician:users!cuaderno_validaciones_technician_id_fkey(first_name, last_name, email)
    `)
    .eq('farmer_id', farmerId)
    .order('validated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
