import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// In-memory OTP store (clears on server restart, good for development)
// In production, use Redis or a database
const otpStore = new Map<string, { otp: string; expires: number; attempts: number }>();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createEmailHTML(otp: string, phone: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JanSeva AI - OTP Verification</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0f1e;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0f1e;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:480px;background:linear-gradient(135deg,#0d1526 0%,#111827 100%);border-radius:20px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);padding:30px;text-align:center;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:12px;padding:10px 14px;margin-bottom:12px;">
                      <span style="font-size:24px;">🛡️</span>
                    </div>
                    <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;">JanSeva AI</h1>
                    <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px;">Smart Government Scheme Finder</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <h2 style="color:#ffffff;margin:0 0 8px;font-size:20px;font-weight:600;">Your OTP Code</h2>
              <p style="color:#94a3b8;margin:0 0 28px;font-size:14px;line-height:1.5;">
                A sign-in request was made for phone number <strong style="color:#cbd5e1;">+91 ${phone}</strong>. Use the code below to verify.
              </p>

              <!-- OTP Box -->
              <div style="background:rgba(249,115,22,0.08);border:2px solid rgba(249,115,22,0.25);border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
                <p style="color:#94a3b8;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">Verification Code</p>
                <div style="letter-spacing:12px;font-size:40px;font-weight:800;color:#f97316;font-family:'Courier New',monospace;line-height:1;">${otp}</div>
                <p style="color:#64748b;font-size:12px;margin:12px 0 0;">Valid for <strong style="color:#f97316;">5 minutes</strong> only</p>
              </div>

              <!-- Warning -->
              <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:14px 16px;margin-bottom:24px;">
                <p style="color:#fca5a5;font-size:12px;margin:0;line-height:1.5;">
                  ⚠️ <strong>Security Alert:</strong> Never share this OTP with anyone. JanSeva AI will never ask for your OTP over call or message.
                </p>
              </div>

              <!-- Info -->
              <p style="color:#475569;font-size:12px;margin:0;line-height:1.6;">
                If you did not request this code, please ignore this email. Your account is safe.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:rgba(0,0,0,0.3);padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="color:#334155;font-size:11px;margin:0;text-align:center;line-height:1.6;">
                © 2026 JanSeva AI · Government Scheme Finder for Indian Citizens<br>
                This is an automated message, please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const { phone, email } = await request.json();

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ success: false, error: 'Invalid 10-digit phone number' }, { status: 400 });
    }

    // Generate OTP
    const otp = generateOTP();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP server-side
    otpStore.set(cleanPhone, { otp, expires, attempts: 0 });

    let delivered = false;
    let deliveryMethod = 'screen';

    // ─────────────────────────────────────────────────────────────────
    // METHOD 1: Gmail SMTP (Your own Gmail — completely FREE forever)
    // How to enable: Add GMAIL_USER and GMAIL_APP_PASSWORD to .env.local
    // Get App Password: myaccount.google.com > Security > App Passwords
    // ─────────────────────────────────────────────────────────────────
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;
    const recipientEmail = email || process.env.GMAIL_USER; // Send to provided email or admin email

    if (!delivered && gmailUser && gmailPass && recipientEmail) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: gmailUser,
            pass: gmailPass, // Gmail App Password (16 chars, no spaces)
          },
        });

        await transporter.sendMail({
          from: `"JanSeva AI 🛡️" <${gmailUser}>`,
          to: recipientEmail,
          subject: `${otp} is your JanSeva AI verification code`,
          html: createEmailHTML(otp, cleanPhone),
          text: `Your JanSeva AI OTP is: ${otp}. Valid for 5 minutes. Do not share with anyone.`,
        });

        delivered = true;
        deliveryMethod = 'email';
        console.log(`[JanSeva] ✅ OTP sent via Gmail to ${recipientEmail}`);
      } catch (e) {
        console.error('[JanSeva] Gmail error:', e instanceof Error ? e.message : String(e));
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // METHOD 2: Fast2SMS (Free ₹50 credit — fast2sms.com)
    // ─────────────────────────────────────────────────────────────────
    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    if (!delivered && fast2smsKey) {
      try {
        const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: { authorization: fast2smsKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ route: 'otp', variables_values: otp, numbers: cleanPhone }),
        });
        const data = await res.json();
        if (data.return === true) {
          delivered = true;
          deliveryMethod = 'sms-fast2sms';
          console.log(`[JanSeva] ✅ OTP sent via Fast2SMS to ${cleanPhone}`);
        }
      } catch (e) {
        console.error('[JanSeva] Fast2SMS error:', e);
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // METHOD 3: 2Factor.in (Free trial — 2factor.in)
    // ─────────────────────────────────────────────────────────────────
    const twoFactorKey = process.env.TWO_FACTOR_API_KEY;
    if (!delivered && twoFactorKey) {
      try {
        const res = await fetch(`https://2factor.in/API/V1/${twoFactorKey}/SMS/${cleanPhone}/${otp}/OTP1`);
        const data = await res.json();
        if (data.Status === 'Success') {
          delivered = true;
          deliveryMethod = 'sms-2factor';
        }
      } catch (e) {
        console.error('[JanSeva] 2Factor error:', e);
      }
    }

    // Always log to server console (see terminal for OTP in dev mode)
    console.log(`\n╔══════════════════════════════════════════╗`);
    console.log(`║  🔐 JanSeva OTP Verification              ║`);
    console.log(`║  Phone  : +91 ${cleanPhone}              ║`);
    console.log(`║  OTP    : ${otp}                        ║`);
    console.log(`║  Method : ${deliveryMethod.padEnd(30)}║`);
    console.log(`╚══════════════════════════════════════════╝\n`);

    return NextResponse.json({
      success: true,
      otp, // returned for fallback display on screen
      delivered,
      deliveryMethod,
      message: delivered
        ? deliveryMethod === 'email'
          ? `✅ OTP sent to your email${recipientEmail ? ` (${recipientEmail})` : ''}. Check inbox & spam.`
          : `✅ OTP sent to your mobile +91 ${cleanPhone} via SMS.`
        : `📋 Demo mode — Your OTP is: ${otp}`,
    });

  } catch (error) {
    console.error('[JanSeva] send-otp error:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// Verify OTP endpoint
export async function PUT(request: Request) {
  try {
    const { phone, otp } = await request.json();
    const cleanPhone = phone?.replace(/\D/g, '');

    if (!cleanPhone || !otp) {
      return NextResponse.json({ success: false, error: 'Phone and OTP required' }, { status: 400 });
    }

    const stored = otpStore.get(cleanPhone);

    // Allow '123456' as universal dev bypass
    if (otp === '123456') {
      otpStore.delete(cleanPhone);
      return NextResponse.json({ success: true, message: 'Verified (dev mode)' });
    }

    if (!stored) {
      return NextResponse.json({ success: false, error: 'OTP expired or not found. Please resend.' }, { status: 400 });
    }

    if (Date.now() > stored.expires) {
      otpStore.delete(cleanPhone);
      return NextResponse.json({ success: false, error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    stored.attempts++;
    if (stored.attempts > 5) {
      otpStore.delete(cleanPhone);
      return NextResponse.json({ success: false, error: 'Too many attempts. Please request a new OTP.' }, { status: 429 });
    }

    if (stored.otp !== otp) {
      return NextResponse.json({ success: false, error: `Incorrect OTP. ${5 - stored.attempts} attempts left.` }, { status: 400 });
    }

    otpStore.delete(cleanPhone);
    return NextResponse.json({ success: true, message: 'OTP verified successfully!' });

  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
