'use server';

import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function assertSuperadmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');
  const { data: profile } = await supabase.from('users').select('platform_role').eq('id', user.id).single();
  if (profile?.platform_role !== 'superadmin') throw new Error('Sin permisos de superadmin');
  return user;
}

// Genera el próximo número de factura: INV-2026-001
async function generateInvoiceNumber(admin: ReturnType<typeof getAdminSupabase>): Promise<string> {
  const year = new Date().getFullYear();
  const { data } = await admin
    .from('platform_invoices')
    .select('invoice_number')
    .like('invoice_number', `INV-${year}-%`)
    .order('invoice_number', { ascending: false })
    .limit(1);

  let seq = 1;
  if (data && data.length > 0) {
    const last = data[0].invoice_number; // INV-2026-042
    const parts = last.split('-');
    seq = parseInt(parts[2] || '0', 10) + 1;
  }
  return `INV-${year}-${String(seq).padStart(3, '0')}`;
}

// ──────────────────────────────────────────────
// GENERAR FACTURA MENSUAL para un tenant
// ──────────────────────────────────────────────
export async function generateInvoiceForTenant(params: {
  tenantId: string;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string;   // YYYY-MM-DD
}) {
  await assertSuperadmin();
  const admin = getAdminSupabase();

  // Obtener datos del tenant
  const { data: tenant, error: tenantErr } = await admin
    .from('tenants')
    .select('id, name, fiscal_name, fiscal_cif, fiscal_address, fiscal_email, contact_email')
    .eq('id', params.tenantId)
    .single();
  if (tenantErr || !tenant) throw new Error('Tenant no encontrado');

  // Calcular suscripciones activas y revenue en el período
  const { data: transactions } = await admin
    .from('payment_transactions')
    .select('amount_total, platform_fee, tenant_fee, status')
    .eq('tenant_id', params.tenantId)
    .eq('status', 'succeeded')
    .gte('created_at', params.periodStart)
    .lte('created_at', params.periodEnd + 'T23:59:59Z');

  const grossRevenue = (transactions || []).reduce((sum, t) => sum + (t.amount_total || 0), 0) / 100;
  const tenantRevenue = (transactions || []).reduce((sum, t) => sum + (t.tenant_fee || 0), 0) / 100;
  const subtotal = Math.round(grossRevenue * 50) / 100; // 50% = licencia InagroSolutions
  const taxAmount = Math.round(subtotal * 21) / 100;
  const total = subtotal + taxAmount;

  // Contar agricultores activos únicos
  const { data: activeFarmers } = await admin
    .from('users')
    .select('id', { count: 'exact' })
    .eq('tenant_id', params.tenantId)
    .eq('platform_role', 'farmer')
    .eq('subscription_status', 'active');

  const activeCount = (activeFarmers as any)?.length || 0;

  const invoiceNumber = await generateInvoiceNumber(admin);
  const issuedAt = new Date().toISOString();
  const dueAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // +30 días

  const lineItems = [
    {
      description: `Licencia plataforma InagroSolutions — ${activeCount} agricultores activos`,
      quantity: activeCount,
      unit_price: activeCount > 0 ? Math.round((subtotal / activeCount) * 100) / 100 : subtotal,
      amount: subtotal,
    },
  ];

  const { data: invoice, error } = await admin
    .from('platform_invoices')
    .insert({
      tenant_id: params.tenantId,
      invoice_number: invoiceNumber,
      period_start: params.periodStart,
      period_end: params.periodEnd,
      subtotal_eur: subtotal,
      tax_rate: 21.0,
      tax_amount_eur: taxAmount,
      total_eur: total,
      active_subscriptions: activeCount,
      gross_revenue_eur: grossRevenue,
      status: 'issued',
      issuer_name: 'INAGROSOLUTIONS S.L.',
      issuer_cif: process.env.INAGROSOLUTIONS_CIF || 'B-PENDIENTE',
      issuer_address: process.env.INAGROSOLUTIONS_ADDRESS || 'Calle Ejemplo 1, 28001 Madrid',
      recipient_name: tenant.fiscal_name || tenant.name,
      recipient_cif: tenant.fiscal_cif || '',
      recipient_address: tenant.fiscal_address || '',
      recipient_email: tenant.fiscal_email || tenant.contact_email || '',
      line_items: lineItems,
      notes: `Factura correspondiente al período ${params.periodStart} — ${params.periodEnd}. Contrato de Licencia de Software según cláusula 3 de los Términos y Condiciones para Partners de InagroSolutions.`,
      issued_at: issuedAt,
      due_at: dueAt,
    })
    .select()
    .single();

  if (error) throw new Error(`Error creando factura: ${error.message}`);

  revalidatePath('/superadmin');
  revalidatePath('/admin/billing');
  return { success: true, invoice };
}

// ──────────────────────────────────────────────
// LISTAR FACTURAS (Superadmin — todas)
// ──────────────────────────────────────────────
export async function listAllInvoices(filters?: {
  tenantId?: string;
  status?: string;
  year?: number;
}) {
  await assertSuperadmin();
  const admin = getAdminSupabase();

  let query = admin
    .from('platform_invoices')
    .select(`
      *,
      tenants!inner(id, name, slug, fiscal_name, fiscal_cif, contact_email)
    `)
    .order('created_at', { ascending: false });

  if (filters?.tenantId) query = query.eq('tenant_id', filters.tenantId);
  if (filters?.status)   query = query.eq('status', filters.status);
  if (filters?.year) {
    query = query
      .gte('period_start', `${filters.year}-01-01`)
      .lte('period_end', `${filters.year}-12-31`);
  }

  const { data, error } = await query.limit(200);
  if (error) throw new Error(error.message);
  return data || [];
}

// ──────────────────────────────────────────────
// LISTAR FACTURAS (Tenant Admin — las suyas)
// ──────────────────────────────────────────────
export async function listMyInvoices() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data: profile } = await supabase
    .from('users')
    .select('tenant_id, platform_role')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) return [];

  const { data, error } = await supabase
    .from('platform_invoices')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

// ──────────────────────────────────────────────
// MARCAR COMO PAGADA
// ──────────────────────────────────────────────
export async function markInvoiceAsPaid(invoiceId: string) {
  await assertSuperadmin();
  const admin = getAdminSupabase();
  const { error } = await admin
    .from('platform_invoices')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', invoiceId);
  if (error) throw new Error(error.message);
  revalidatePath('/superadmin');
  revalidatePath('/admin/billing');
  return { success: true };
}

// ──────────────────────────────────────────────
// MARCAR COMO CANCELADA
// ──────────────────────────────────────────────
export async function cancelInvoice(invoiceId: string) {
  await assertSuperadmin();
  const admin = getAdminSupabase();
  const { error } = await admin
    .from('platform_invoices')
    .update({ status: 'cancelled' })
    .eq('id', invoiceId);
  if (error) throw new Error(error.message);
  revalidatePath('/superadmin');
  return { success: true };
}

// ──────────────────────────────────────────────
// STATS GLOBALES (Superadmin dashboard)
// ──────────────────────────────────────────────
export async function getInvoicingStats() {
  await assertSuperadmin();
  const admin = getAdminSupabase();
  const year = new Date().getFullYear();

  const { data } = await admin
    .from('platform_invoices')
    .select('status, total_eur, subtotal_eur, tax_amount_eur, tenant_id')
    .gte('period_start', `${year}-01-01`);

  const all = data || [];
  return {
    totalIssued: all.length,
    totalRevenue: all.reduce((s, i) => s + (i.subtotal_eur || 0), 0),
    totalVat: all.reduce((s, i) => s + (i.tax_amount_eur || 0), 0),
    totalGross: all.reduce((s, i) => s + (i.total_eur || 0), 0),
    pending: all.filter(i => i.status === 'issued' || i.status === 'overdue').length,
    paid: all.filter(i => i.status === 'paid').length,
    overdue: all.filter(i => i.status === 'overdue').length,
    uniqueTenants: new Set(all.map(i => i.tenant_id)).size,
  };
}

// ──────────────────────────────────────────────
// OBTENER UNA FACTURA por ID
// ──────────────────────────────────────────────
export async function getInvoiceById(invoiceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const admin = getAdminSupabase();
  const { data, error } = await admin
    .from('platform_invoices')
    .select(`*, tenants(id, name, slug, fiscal_name, fiscal_cif, contact_email, fiscal_email)`)
    .eq('id', invoiceId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ──────────────────────────────────────────────
// GENERAR FACTURAS EN LOTE para todos los tenants activos
// ──────────────────────────────────────────────
export async function generateBulkInvoices(params: {
  periodStart: string;
  periodEnd: string;
}) {
  await assertSuperadmin();
  const admin = getAdminSupabase();

  // Obtener todos los tenants activos con stripe connect
  const { data: tenants } = await admin
    .from('tenants')
    .select('id, name')
    .eq('is_active', true);

  const results = [];
  for (const tenant of tenants || []) {
    try {
      const result = await generateInvoiceForTenant({
        tenantId: tenant.id,
        periodStart: params.periodStart,
        periodEnd: params.periodEnd,
      });
      results.push({ tenantId: tenant.id, name: tenant.name, success: true, invoice: result.invoice });
    } catch (err: any) {
      results.push({ tenantId: tenant.id, name: tenant.name, success: false, error: err.message });
    }
  }

  revalidatePath('/superadmin');
  return results;
}
