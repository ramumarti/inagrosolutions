import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const { email, tenantName, logoUrl, tenantSlug } = await req.json();

    if (!email || !tenantName) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // 1. Obtener la configuración SMTP usando supabaseAdmin para saltar RLS
    const { data: smtp } = await supabaseAdmin
      .from('smtp_settings')
      .select('*')
      .single();

    if (!smtp || !smtp.is_verified) {
      console.error('SMTP no configurado o verificado');
      return NextResponse.json({ error: 'Configuración de correo no lista' }, { status: 500 });
    }

    // 2. Configurar el transportista
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: {
        user: smtp.username,
        pass: smtp.password,
      },
    });

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/signup?email=${encodeURIComponent(email)}&invite=true&role=farmer&tenant=${tenantSlug || ''}`;

    // 3. Diseño del Email White Label
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; background-color: #f4f4f4; padding: 20px; }
          .card { background: white; max-width: 500px; margin: 0 auto; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
          .logo { max-height: 60px; margin-bottom: 20px; }
          .btn { background-color: #10B981; color: white; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-top: 20px; }
          h1 { color: #1f2937; margin-bottom: 15px; }
          p { color: #4b5563; line-height: 1.6; }
          .footer { margin-top: 30px; font-size: 12px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div class="card">
          ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="${tenantName}">` : `<h2>${tenantName}</h2>`}
          <h1>¡Tu tiempo vale oro!</h1>
          <p style="font-size: 18px; font-weight: bold; color: #10B981;">Activa ya tu Cuaderno Digital en <strong>${tenantName}</strong>.</p>
          
          <p>Sabemos que el papeleo de la PAC y el SIEX te quita el sueño. Por eso, hemos creado la solución definitiva para ti. A partir de ahora, registrar tus tratamientos, abonos y labores te llevará solo unos minutos.</p>
          
          <div style="text-align: left; background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin-top: 0; font-size: 16px;"><strong>¿Por qué activar tu cuenta hoy?</strong></p>
            <ul style="padding-left: 20px; margin-bottom: 0;">
              <li style="margin-bottom: 10px;"><strong>Evitas riesgos:</strong> Proteges tus ayudas PAC frente a inspecciones.</li>
              <li style="margin-bottom: 10px;"><strong>Ahorras dinero:</strong> Optimizas tus recursos y reduces costes de gestión.</li>
              <li><strong>Ganas vida:</strong> Menos horas de oficina, más tiempo para ti.</li>
            </ul>
          </div>
          
          <p>No dejes que la burocracia te deje atrás. Es tu oportunidad de digitalizar tu explotación con el respaldo de tu cooperativa de confianza.</p>
          
          <a href="${inviteLink}" class="btn">👉 Entra y Regístrate</a>
          <div class="footer">
            Este mensaje ha sido enviado por ${tenantName} a través de la tecnología de Inagrosolutions.
          </div>
        </div>
      </body>
      </html>
    `;

    // 4. Enviar el correo
    await transporter.sendMail({
      from: `"${tenantName}" <${smtp.from_email}>`,
      to: email,
      subject: `Invitación de ${tenantName}`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending invite email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
