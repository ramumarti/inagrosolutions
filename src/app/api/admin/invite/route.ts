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
        <div className="card">
          ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="${tenantName}">` : `<h2>${tenantName}</h2>`}
          <h1>Tu Cuaderno Digital está listo</h1>
          <p>La cooperativa <strong>${tenantName}</strong> te invita a unirte a su plataforma de gestión agrícola digital.</p>
          <p>A partir de ahora, podrás registrar tus tratamientos, abonos y labores de forma rápida y cumplir con la normativa SIEX/PAC.</p>
          <a href="${inviteLink}" class="btn">Confirmar y Registrarme</a>
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
