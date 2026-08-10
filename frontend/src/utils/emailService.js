const EMAILJS_SERVICE_ID = 'service_qlj9f2a'
const EMAILJS_TEMPLATE_ID = 'template_bj79797'
const EMAILJS_PUBLIC_KEY = '8m53lTyoSDA_t-UTd'

function buildEmailHtml(orderData) {
  const {
    orderNumber,
    customerName,
    customerEmail,
    items,
    subtotal,
    shipping,
    couponDiscount,
    total,
    deliveryAddress,
    deliveryCity,
    deliveryCounty,
    paymentMethod,
  } = orderData

  const orderDate = new Date().toLocaleDateString('ro-RO', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const itemsHtml = items.map(i => {
    const itemTotal = (i.finalPrice * i.quantity).toFixed(2)
    const imgUrl = i.images?.[0] || ''
    const hasImg = imgUrl && !imgUrl.includes('placehold')

    return `
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #2a2a2a; vertical-align: middle;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              ${hasImg ? `
              <td width="64" style="vertical-align: middle; padding-right: 14px;">
                <img src="${imgUrl}"
                  width="64" height="64"
                  style="border-radius: 8px; object-fit: cover; display: block; border: 1px solid #333;"
                  alt="${i.name}" />
              </td>` : ''}
              <td style="vertical-align: middle;">
                <div style="color: #ef4444; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">${i.artist || ''}</div>
                <div style="color: #ffffff; font-size: 14px; font-weight: 700; margin-bottom: 4px;">${i.name}</div>
                <div style="color: #888; font-size: 12px;">${i.format} &nbsp;·&nbsp; ${i.year || ''}</div>
              </td>
              <td style="vertical-align: middle; text-align: right; white-space: nowrap; padding-left: 12px;">
                <div style="color: #aaa; font-size: 12px; margin-bottom: 4px;">x${i.quantity}</div>
                <div style="color: #ffffff; font-size: 14px; font-weight: 700;">${itemTotal} RON</div>
                ${i.quantity > 1 ? `<div style="color: #555; font-size: 11px;">${i.finalPrice} RON / buc.</div>` : ''}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
  }).join('')

  const couponRowHtml = couponDiscount > 0 ? `
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #4ade80;">Reducere cupon</td>
      <td style="padding: 6px 0; font-size: 14px; color: #4ade80; text-align: right;">-${couponDiscount} RON</td>
    </tr>` : ''

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background:#0f0f0f; font-family: Arial, Helvetica, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0f0f0f; padding: 32px 16px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px; background:#1a1a1a; border-radius:12px; overflow:hidden;">

        <!-- HEADER -->
        <tr>
          <td style="background:#ef4444; padding: 32px 40px; text-align:center;">
            <div style="font-size: 28px; margin-bottom: 8px;">🎵</div>
            <h1 style="margin:0; color:#fff; font-size:22px; font-weight:900; letter-spacing:-0.5px;">VinylVault</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size:14px;">Comanda ta a fost plasată cu succes!</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding: 32px 40px;">

            <!-- Salut -->
            <p style="margin: 0 0 24px; font-size:16px; color:#e5e5e5; line-height:1.6;">
              Bună <strong style="color:#fff;">${customerName}</strong>,<br>
              Îți mulțumim pentru comandă! O vom procesa în cel mai scurt timp.
            </p>

            <!-- Info comandă -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%"
              style="background:#111; border:1px solid #2a2a2a; border-radius:8px; margin-bottom:24px;">
              <tr>
                <td style="padding: 16px 20px;">
                  <p style="margin:5px 0; font-size:13px; color:#aaa;">📦 Număr comandă: <strong style="color:#fff;">${orderNumber}</strong></p>
                  <p style="margin:5px 0; font-size:13px; color:#aaa;">📅 Data: <strong style="color:#fff;">${orderDate}</strong></p>
                  <p style="margin:5px 0; font-size:13px; color:#aaa;">💳 Metodă plată: <strong style="color:#fff;">${paymentMethod}</strong></p>
                </td>
              </tr>
            </table>

            <!-- Titlu produse -->
            <p style="font-size:11px; text-transform:uppercase; letter-spacing:2px; color:#555; margin: 0 0 12px;">🎶 Produse comandate</p>

            <!-- Produse -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%"
              style="background:#111; border:1px solid #2a2a2a; border-radius:8px; margin-bottom:24px; overflow:hidden;">
              ${itemsHtml}
            </table>

            <!-- Totaluri -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%"
              style="background:#111; border:1px solid #2a2a2a; border-radius:8px; margin-bottom:24px;">
              <tr><td style="padding: 16px 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 6px 0; font-size:14px; color:#aaa;">Subtotal</td>
                    <td style="padding: 6px 0; font-size:14px; color:#aaa; text-align:right;">${subtotal} RON</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size:14px; color:#aaa;">Transport</td>
                    <td style="padding: 6px 0; font-size:14px; color:${shipping === 0 ? '#4ade80' : '#aaa'}; text-align:right;">${shipping === 0 ? 'GRATUIT' : shipping + ' RON'}</td>
                  </tr>
                  ${couponRowHtml}
                  <tr>
                    <td colspan="2" style="border-top:1px solid #2a2a2a; padding-top: 12px; padding-bottom: 0;"></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0 0; font-size:18px; font-weight:900; color:#fff;">TOTAL</td>
                    <td style="padding: 8px 0 0; font-size:18px; font-weight:900; color:#ef4444; text-align:right;">${total} RON</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <!-- Adresă -->
            <p style="font-size:11px; text-transform:uppercase; letter-spacing:2px; color:#555; margin: 0 0 12px;">📍 Adresă livrare</p>
            <table cellpadding="0" cellspacing="0" border="0" width="100%"
              style="background:#111; border:1px solid #2a2a2a; border-radius:8px; margin-bottom:24px;">
              <tr><td style="padding: 16px 20px; font-size:14px; color:#ccc; line-height:1.9;">
                <strong style="color:#fff;">${customerName}</strong><br>
                ${deliveryAddress}<br>
                ${deliveryCity}, ${deliveryCounty}
              </td></tr>
            </table>

            <!-- Estimare livrare -->
            <p style="font-size:13px; color:#888; text-align:center; margin:0;">
              Estimăm livrarea în <strong style="color:#fff;">1-3 zile lucrătoare</strong>.<br>
              Vei primi un email când comanda este expediată.
            </p>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding: 24px 40px; text-align:center; border-top:1px solid #222;">
            <p style="margin:4px 0; font-size:13px; color:#666;">Cu drag, <strong style="color:#ef4444;">Echipa VinylVault</strong> 🎵</p>
            <p style="margin:4px 0; font-size:11px; color:#444;">Acest email a fost trimis la ${customerEmail} deoarece ai plasat o comandă.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendOrderConfirmationEmail(orderData) {
  const templateParams = {
    to_email:   orderData.customerEmail,
    email_body: buildEmailHtml(orderData),
  }

  try {
    const emailjsModule = await import('@emailjs/browser')
    const emailjs = emailjsModule.default
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    )
    return { success: true, response }
  } catch (error) {
    console.error('Eroare trimitere email:', error)
    return { success: false, error }
  }
}
// ── EMAIL EXPEDIERE ──────────────────────────────────────────────────────────
function buildShippingEmailHtml({ orderNumber, customerName, customerEmail, awb, courier, trackingUrl, items, deliveryAddress, deliveryCity, deliveryCounty }) {
  const courierLogos = {
    'Fan Courier': '🟡',
    'DPD': '🔴',
    'Sameday': '🔵',
    'DHL': '🟡',
    'Cargus': '🟠',
  }
  const icon = courierLogos[courier] || '📦'

  const itemsHtml = items.map(i => `
    <tr>
      <td style="padding:10px 20px; border-bottom:1px solid #2a2a2a; font-size:13px; color:#ccc;">
        <strong style="color:#fff;">${i.name}</strong>
        <span style="color:#666;"> ×${i.quantity}</span>
      </td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:Arial,Helvetica,sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0f0f0f;padding:32px 16px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#1a1a1a;border-radius:12px;overflow:hidden;">

        <tr>
          <td style="background:#7c3aed;padding:32px 40px;text-align:center;">
            <div style="font-size:36px;margin-bottom:8px;">🚚</div>
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:900;">Comanda ta este în drum!</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">VinylVault · #${orderNumber}</p>
          </td>
        </tr>

        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 24px;font-size:16px;color:#e5e5e5;line-height:1.6;">
              Bună <strong style="color:#fff;">${customerName}</strong>,<br>
              Comanda ta a fost predată curierului și este în drum spre tine! 🎵
            </p>

            <!-- AWB Info -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%"
              style="background:#111;border:1px solid #7c3aed44;border-radius:8px;margin-bottom:24px;">
              <tr><td style="padding:20px;">
                <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">📋 Detalii expediere</div>
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#888;width:140px;">Curier</td>
                    <td style="padding:6px 0;font-size:13px;color:#fff;font-weight:700;">${icon} ${courier}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#888;">Număr AWB</td>
                    <td style="padding:6px 0;font-size:16px;color:#a78bfa;font-weight:900;font-family:monospace;">${awb}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#888;">Livrare estimată</td>
                    <td style="padding:6px 0;font-size:13px;color:#4ade80;font-weight:600;">1-2 zile lucrătoare</td>
                  </tr>
                </table>
                ${trackingUrl ? `
                <div style="margin-top:16px;">
                  <a href="${trackingUrl}" style="display:inline-block;background:#7c3aed;color:#fff;font-size:13px;font-weight:700;padding:10px 20px;border-radius:8px;text-decoration:none;">
                    🔍 Urmărește coletul →
                  </a>
                </div>` : ''}
              </td></tr>
            </table>

            <!-- Produse -->
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#555;margin-bottom:12px;">🎶 Produse expediate</div>
            <table cellpadding="0" cellspacing="0" border="0" width="100%"
              style="background:#111;border:1px solid #2a2a2a;border-radius:8px;margin-bottom:24px;overflow:hidden;">
              ${itemsHtml}
            </table>

            <!-- Adresă -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%"
              style="background:#111;border:1px solid #2a2a2a;border-radius:8px;">
              <tr><td style="padding:16px 20px;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#555;margin-bottom:8px;">📍 Adresă livrare</div>
                <p style="margin:0;font-size:13px;color:#ccc;line-height:1.8;">
                  <strong style="color:#fff;">${customerName}</strong><br>
                  ${deliveryAddress}<br>
                  ${deliveryCity}, ${deliveryCounty}
                </p>
              </td></tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 40px;text-align:center;border-top:1px solid #222;">
            <p style="margin:4px 0;font-size:13px;color:#666;">Cu drag, <strong style="color:#7c3aed;">Echipa VinylVault</strong> 🎵</p>
            <p style="margin:4px 0;font-size:11px;color:#444;">Email trimis la ${customerEmail}</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendShippingEmail(orderData) {
  const templateParams = {
    to_email: orderData.customerEmail,
    email_body: buildShippingEmailHtml(orderData),
  }
  try {
    const emailjsModule = await import('@emailjs/browser')
    const emailjs = emailjsModule.default
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    )
    return { success: true, response }
  } catch (error) {
    console.error('Eroare email expediere:', error)
    return { success: false, error }
  }
}