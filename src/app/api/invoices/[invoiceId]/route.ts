import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Genera el HTML de la factura en formato A4
function generateInvoiceHTML(invoice: any): string {
  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
  const formatCurrency = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);

  const statusMap: Record<string, { label: string; color: string }> = {
    draft: { label: 'BORRADOR', color: '#6B7280' },
    issued: { label: 'EMITIDA', color: '#3B82F6' },
    paid: { label: 'PAGADA', color: '#10B981' },
    overdue: { label: 'VENCIDA', color: '#EF4444' },
    cancelled: { label: 'CANCELADA', color: '#6B7280' },
  };
  const statusInfo = statusMap[invoice.status] || statusMap.issued;

  const lineItemsHTML = (invoice.line_items || []).map((item: any) => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-size: 13px;">${item.description}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; text-align: center; font-size: 13px;">${item.quantity}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; text-align: right; font-size: 13px;">${formatCurrency(item.unit_price || 0)}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; text-align: right; font-size: 13px; font-weight: 700;">${formatCurrency(item.amount || 0)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factura ${invoice.invoice_number} — InagroSolutions</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; color: #111827; font-size: 14px; line-height: 1.5; }
    .page { max-width: 794px; margin: 0 auto; padding: 48px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 32px; border-bottom: 3px solid #10B981; }
    .logo { font-size: 28px; font-weight: 900; color: #10B981; letter-spacing: -1px; }
    .logo span { color: #111827; }
    .invoice-badge { text-align: right; }
    .invoice-num { font-size: 22px; font-weight: 900; color: #111827; }
    .status-badge { display: inline-block; margin-top: 6px; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 1px; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 36px; }
    .party-block h3 { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #10B981; margin-bottom: 10px; }
    .party-block p { font-size: 13px; color: #374151; line-height: 1.7; }
    .party-block .name { font-weight: 800; font-size: 15px; color: #111827; }
    .period-bar { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 10px; padding: 16px 20px; margin-bottom: 28px; display: flex; gap: 40px; }
    .period-item { font-size: 12px; }
    .period-item .label { color: #9CA3AF; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-size: 10px; }
    .period-item .value { font-weight: 800; color: #111827; font-size: 14px; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #111827; }
    thead th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #D1FAE5; }
    thead th:last-child, thead th:nth-child(3), thead th:nth-child(2) { text-align: right; }
    thead th:nth-child(2) { text-align: center; }
    .totals { margin-left: auto; width: 280px; border: 1px solid #E5E7EB; border-radius: 10px; overflow: hidden; margin-bottom: 36px; }
    .total-row { display: flex; justify-content: space-between; padding: 10px 16px; font-size: 13px; }
    .total-row:not(:last-child) { border-bottom: 1px solid #F3F4F6; }
    .total-row.grand { background: #111827; color: #fff; font-weight: 900; font-size: 16px; padding: 14px 16px; }
    .total-row.grand .label { color: #D1FAE5; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
    .notes { background: #F9FAFB; border-left: 4px solid #10B981; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 32px; font-size: 12px; color: #4B5563; line-height: 1.7; }
    .footer { padding-top: 24px; border-top: 2px solid #F3F4F6; display: flex; justify-content: space-between; align-items: flex-end; }
    .footer-legal { font-size: 11px; color: #9CA3AF; line-height: 1.6; max-width: 380px; }
    .footer-stamp { text-align: right; font-size: 11px; color: #9CA3AF; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
<div class="page">
  <!-- CABECERA -->
  <div class="header">
    <div>
      <div class="logo">Inagro<span>Solutions</span></div>
      <p style="font-size: 12px; color: #6B7280; margin-top: 4px;">Tecnología Agrícola Profesional</p>
      <p style="font-size: 12px; color: #374151; margin-top: 8px;">${invoice.issuer_name}</p>
      <p style="font-size: 12px; color: #6B7280;">CIF: ${invoice.issuer_cif}</p>
      <p style="font-size: 12px; color: #6B7280;">${invoice.issuer_address}</p>
    </div>
    <div class="invoice-badge">
      <div class="invoice-num">${invoice.invoice_number}</div>
      <div>
        <span class="status-badge" style="background-color: ${statusInfo.color}20; color: ${statusInfo.color}; border: 1px solid ${statusInfo.color}40;">
          ${statusInfo.label}
        </span>
      </div>
      <p style="font-size: 12px; color: #6B7280; margin-top: 8px;">Emitida: ${formatDate(invoice.issued_at)}</p>
      <p style="font-size: 12px; color: #6B7280;">Vence: ${formatDate(invoice.due_at)}</p>
    </div>
  </div>

  <!-- PARTES -->
  <div class="parties">
    <div class="party-block">
      <h3>Emisor (Licenciante)</h3>
      <p class="name">${invoice.issuer_name}</p>
      <p>CIF: ${invoice.issuer_cif}</p>
      <p>${invoice.issuer_address}</p>
    </div>
    <div class="party-block">
      <h3>Receptor (Licenciatario / Partner)</h3>
      <p class="name">${invoice.recipient_name || invoice.tenants?.fiscal_name || invoice.tenants?.name || '—'}</p>
      <p>CIF: ${invoice.recipient_cif || '—'}</p>
      <p>${invoice.recipient_address || '—'}</p>
      <p>${invoice.recipient_email || invoice.tenants?.fiscal_email || invoice.tenants?.contact_email || ''}</p>
    </div>
  </div>

  <!-- PERÍODO -->
  <div class="period-bar">
    <div class="period-item">
      <div class="label">Período Facturado</div>
      <div class="value">${formatDate(invoice.period_start)} — ${formatDate(invoice.period_end)}</div>
    </div>
    <div class="period-item">
      <div class="label">Agricultores Activos</div>
      <div class="value">${invoice.active_subscriptions}</div>
    </div>
    <div class="period-item">
      <div class="label">Revenue Total Generado</div>
      <div class="value">${formatCurrency(invoice.gross_revenue_eur)}</div>
    </div>
    <div class="period-item">
      <div class="label">Concepto</div>
      <div class="value">Licencia SaaS — 50%</div>
    </div>
  </div>

  <!-- LÍNEAS DE FACTURA -->
  <table>
    <thead>
      <tr>
        <th>Descripción</th>
        <th style="text-align:center;">Unidades</th>
        <th style="text-align:right;">Precio Unit.</th>
        <th style="text-align:right;">Importe</th>
      </tr>
    </thead>
    <tbody>
      ${lineItemsHTML || `<tr><td colspan="4" style="padding: 16px; text-align:center; color: #9CA3AF;">Licencia de plataforma — período ${formatDate(invoice.period_start)} a ${formatDate(invoice.period_end)}</td></tr>`}
    </tbody>
  </table>

  <!-- TOTALES -->
  <div class="totals">
    <div class="total-row">
      <span>Base Imponible</span>
      <span style="font-weight:700;">${formatCurrency(invoice.subtotal_eur)}</span>
    </div>
    <div class="total-row">
      <span>IVA (${invoice.tax_rate}%)</span>
      <span style="font-weight:700;">${formatCurrency(invoice.tax_amount_eur)}</span>
    </div>
    <div class="total-row grand">
      <div>
        <div class="label">Total Factura</div>
      </div>
      <span>${formatCurrency(invoice.total_eur)}</span>
    </div>
  </div>

  <!-- NOTAS -->
  ${invoice.notes ? `<div class="notes"><strong style="color:#111827;">Notas / Observaciones:</strong><br>${invoice.notes}</div>` : ''}

  <!-- PIE -->
  <div class="footer">
    <div class="footer-legal">
      <strong style="color:#374151;">Justificación legal:</strong> El presente documento acredita la contraprestación económica por la licencia de uso de la plataforma tecnológica InagroSolutions, conforme a la cláusula 3 del Contrato de Licencia de Software y Servicios Tecnológicos suscrito entre las partes. Base legal: Art. 1255 CC, Ley 37/1992 (IVA), RDL 1/1996 (TRLPI), Ley 34/2002 (LSSI-CE).
      <br><br>
      El mecanismo técnico de distribución se realiza mediante Stripe Connect Express (application fee), siendo esta factura el justificante fiscal oficial ante la Agencia Tributaria española.
    </div>
    <div class="footer-stamp">
      <p>Generado por InagroSolutions</p>
      <p>${new Date().toLocaleDateString('es-ES')}</p>
    </div>
  </div>
</div>
</body>
</html>`;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;

  // Verificar sesión
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { data: profile } = await supabase
    .from('users')
    .select('platform_role, tenant_id')
    .eq('id', user.id)
    .single();

  const admin = getAdminSupabase();
  const { data: invoice, error } = await admin
    .from('platform_invoices')
    .select(`*, tenants(id, name, fiscal_name, fiscal_cif, fiscal_email, contact_email)`)
    .eq('id', invoiceId)
    .single();

  if (error || !invoice) return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });

  // Verificar acceso: superadmin o el tenant que corresponde
  const isSuperadmin = profile?.platform_role === 'superadmin';
  const isOwnTenant = profile?.tenant_id === invoice.tenant_id;
  if (!isSuperadmin && !isOwnTenant) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  const format = new URL(req.url).searchParams.get('format') || 'html';

  const html = generateInvoiceHTML(invoice);

  if (format === 'html') {
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${invoice.invoice_number}.html"`,
      },
    });
  }

  // Para PDF devolvemos el HTML con cabeceras de descarga
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="${invoice.invoice_number}.html"`,
      'X-Invoice-Number': invoice.invoice_number,
    },
  });
}
