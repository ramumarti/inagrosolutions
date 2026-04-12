import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase admin environment variables are missing');
  }
  return createClient(url, key);
}

export async function getSmtpTransport() {
  const supabaseAdmin = getAdminClient();
  const { data, error } = await supabaseAdmin
    .from('smtp_settings')
    .select('*')
    .single();


  if (error || !data || !data.is_verified) {
    return null;
  }

  return nodemailer.createTransport({
    host: data.host,
    port: data.port,
    auth: {
      user: data.username,
      pass: data.password,
    },
  });
}

export function buildEmailTemplate(options: {
  title: string;
  greeting: string;
  bodyLines: string[];
  ctaText?: string;
  ctaUrl?: string;
  footerText?: string;
}): string {
  const { title, greeting, bodyLines, ctaText, ctaUrl, footerText } = options;
  
  const bodyHtml = bodyLines.map(line => `<p style="margin: 0 0 16px 0; color: #cbd5e1; font-size: 16px; line-height: 1.5;">${line}</p>`).join('');

  const ctaHtml = ctaText && ctaUrl ? `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 32px auto;">
      <tr>
        <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #EF4444, #DC2626, #F472B6);">
          <a href="${ctaUrl}" target="_blank" style="font-size: 16px; font-weight: bold; font-family: sans-serif; color: #ffffff; text-decoration: none; border-radius: 8px; padding: 12px 24px; border: 1px solid transparent; display: inline-block;">
            ${ctaText}
          </a>
        </td>
      </tr>
    </table>
  ` : '';

  const footerHtml = footerText ? `
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #334155; text-align: center;">
      <p style="margin: 0; color: #64748b; font-size: 12px;">${footerText}</p>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #0f0a1e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; -webkit-font-smoothing: antialiased;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto;">
        <tr>
            <td align="center" style="padding-bottom: 24px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #EF4444, #DC2626, #F472B6); border-radius: 12px; padding: 8px 20px;">
                    <span style="color: #ffffff; font-weight: 800; font-size: 16px; letter-spacing: 0.05em;">âœ¦ INAGROSOLUTIONS</span>
                </div>
            </td>
        </tr>
        <tr>
            <td style="background-color: #1a1a2e; border: 1px solid #2d2a45; border-radius: 16px; padding: 32px;">
                <h1 style="margin: 0 0 24px 0; color: #ffffff; font-size: 24px; font-weight: 700; text-align: center;">${title}</h1>
                
                <p style="margin: 0 0 24px 0; color: #f8fafc; font-size: 18px; font-weight: 500;">${greeting}</p>
                
                ${bodyHtml}
                
                ${ctaHtml}
                
                ${footerHtml}
            </td>
        </tr>
    </table>
</body>
</html>
  `.trim();
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const transport = await getSmtpTransport();
    
    if (!transport) {
      return { success: false, message: 'SMTP not configured or unverified' };
    }

    const supabaseAdmin = getAdminClient();
    const { data: settings } = await supabaseAdmin
      .from('smtp_settings')
      .select('from_email, from_name')
      .single();


    const fromAddress = settings?.from_name 
      ? `"${settings.from_name}" <${settings.from_email}>` 
      : settings?.from_email;

    const info = await transport.sendMail({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    return { success: true, message: `Email sent: ${info.messageId}` };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: err.message || 'Unknown SMTP error' };
  }
}

export async function sendWelcomeEmail(options: {
  to: string;
  firstName: string;
  planName: string;
  password?: string;
  loginUrl: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const bodyLines = [
      `Tu plan <strong>${options.planName}</strong> ha sido activado exitosamente.`,
    ];

    if (options.password) {
      bodyLines.push(`Tus credenciales de acceso son:<br/>Email: <strong>${options.to}</strong><br/>ContraseÃ±a: <strong>${options.password}</strong>`);
    }

    bodyLines.push('Ya puedes acceder a todas las herramientas de IA incluidas en tu plan.');

    const html = buildEmailTemplate({
      title: 'Â¡Bienvenido a INAGROSOLUTIONS!',
      greeting: `Hola ${options.firstName},`,
      bodyLines,
      ctaText: 'Acceder al Portal',
      ctaUrl: options.loginUrl,
      footerText: 'Este email fue enviado automÃ¡ticamente. Si tienes preguntas, contacta al administrador.'
    });

    return await sendEmail({
      to: options.to,
      subject: 'Â¡Bienvenido a INAGROSOLUTIONS! Tu acceso estÃ¡ listo',
      html
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Failed to send welcome email:', err);
    return { success: false, message: err.message || 'Welcome email failed' };
  }
}
