/**
 * Email notifications via Resend.
 * Requires RESEND_API_KEY env var. Silently skips if not configured.
 * Setup: https://resend.com (free tier: 3,000 emails/month)
 */

type TipEmailParams = {
  to: string;
  restaurantName: string;
  amountCents: number;
  totalTodayCents: number;
};

function formatEur(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

function buildTipEmailHtml({ restaurantName, amountCents, totalTodayCents }: Omit<TipEmailParams, "to">) {
  const amount = formatEur(amountCents);
  const total = formatEur(totalTodayCents);
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nueva propina</title>
</head>
<body style="margin:0;padding:0;background:#F5FAF7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5FAF7;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#0D1B1E;padding:28px 32px;text-align:center;">
            <span style="font-size:22px;font-weight:800;color:#ffffff;">mi<span style="color:#2ECC87;">propina</span></span>
          </td>
        </tr>
        <!-- Amount -->
        <tr>
          <td style="padding:40px 32px 24px;text-align:center;">
            <div style="display:inline-block;background:#E8F5E9;border-radius:50%;width:80px;height:80px;line-height:80px;font-size:36px;margin-bottom:20px;">💸</div>
            <h1 style="margin:0 0 8px;font-size:32px;font-weight:800;color:#0D1B1E;">${amount}</h1>
            <p style="margin:0;font-size:16px;color:#6B7280;">Nueva propina recibida en <strong>${restaurantName}</strong></p>
          </td>
        </tr>
        <!-- Stats -->
        <tr>
          <td style="padding:0 32px 32px;">
            <div style="background:#F5FAF7;border-radius:16px;padding:20px 24px;">
              <p style="margin:0 0 8px;font-size:13px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Total de hoy</p>
              <p style="margin:0;font-size:24px;font-weight:800;color:#0D1B1E;">${total}</p>
            </div>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 40px;text-align:center;">
            <a href="https://mipropina.es/dashboard" style="display:inline-block;background:#2ECC87;color:#0D1B1E;font-weight:800;font-size:15px;padding:14px 32px;border-radius:14px;text-decoration:none;">
              Ver en el dashboard →
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #F3F4F6;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9CA3AF;">
              Recibes este email porque tienes las notificaciones activadas en mipropina.es<br>
              Puedes desactivarlas en <a href="https://mipropina.es/dashboard/ajustes" style="color:#2ECC87;">Ajustes</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendTipNotificationEmail(params: TipEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // Resend not configured — skip silently

  const { to, restaurantName, amountCents, totalTodayCents } = params;

  const html = buildTipEmailHtml({ restaurantName, amountCents, totalTodayCents });
  const amountStr = formatEur(amountCents);

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "mipropina.es <notificaciones@mipropina.es>",
        to: [to],
        subject: `Nueva propina: ${amountStr} en ${restaurantName}`,
        html,
      }),
    });
  } catch (err) {
    // Email delivery is non-critical — log and continue
    console.error("[email] Failed to send tip notification:", err);
  }
}

// ---------------------------------------------------------------------------
// Auth emails: verification + password reset
// ---------------------------------------------------------------------------

function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://mipropina.es").replace(/\/+$/, "");
}

async function sendRaw(to: string, subject: string, html: string, fallbackLogTag: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Resend not configured yet — log so we can recover manually.
    console.warn(`[email:${fallbackLogTag}] RESEND_API_KEY no configurado. Email para ${to} NO enviado. Asunto: ${subject}`);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "mipropina.es <hola@mipropina.es>",
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[email:${fallbackLogTag}] Resend ${res.status}: ${body}`);
    }
  } catch (err) {
    console.error(`[email:${fallbackLogTag}] Send failed:`, err);
  }
}

function authEmailShell(title: string, intro: string, ctaLabel: string, ctaUrl: string, outro: string) {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#F5FAF7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5FAF7;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:#0D1B1E;padding:28px 32px;text-align:center;">
          <span style="font-size:22px;font-weight:800;color:#ffffff;">mi<span style="color:#2ECC87;">propina</span></span>
        </td></tr>
        <tr><td style="padding:40px 32px 24px;">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#0D1B1E;">${title}</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">${intro}</p>
          <p style="text-align:center;margin:0 0 24px;">
            <a href="${ctaUrl}" style="display:inline-block;background:#2ECC87;color:#0D1B1E;font-weight:800;font-size:15px;padding:14px 32px;border-radius:14px;text-decoration:none;">${ctaLabel}</a>
          </p>
          <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">O copia este enlace en tu navegador:</p>
          <p style="margin:0 0 24px;font-size:12px;color:#9CA3AF;word-break:break-all;">${ctaUrl}</p>
          <p style="margin:0;font-size:13px;color:#9CA3AF;line-height:1.6;">${outro}</p>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #F3F4F6;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9CA3AF;">mipropina.es</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const url = `${appBaseUrl()}/verificar/${token}`;
  const html = authEmailShell(
    "Verifica tu email",
    `Hola ${name}, pulsa el botón para confirmar tu correo en mipropina. El enlace caduca en 24 horas.`,
    "Verificar email",
    url,
    "Si no te has registrado en mipropina, ignora este mensaje."
  );
  await sendRaw(to, "Verifica tu email · mipropina", html, "verify");
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const url = `${appBaseUrl()}/recuperar/${token}`;
  const html = authEmailShell(
    "Restablecer contraseña",
    `Hola ${name}, recibimos una petición para cambiar tu contraseña. Pulsa el botón para elegir una nueva. El enlace caduca en 1 hora.`,
    "Cambiar contraseña",
    url,
    "Si no has pedido cambiar la contraseña, ignora este mensaje y tu cuenta seguirá igual."
  );
  await sendRaw(to, "Restablecer contraseña · mipropina", html, "reset");
}
