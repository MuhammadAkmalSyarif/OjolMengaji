import nodemailer from 'nodemailer';

interface SendOtpResult {
  success: boolean;
  message: string;
  simulated?: boolean;
  simulatedOtp?: string;
}

export async function sendOtpEmail(email: string, otp: string): Promise<SendOtpResult> {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE !== 'false';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'Ojol Mengaji <noreply@ojolmengaji.id>';

  // Mode simulasi jika kredensial SMTP belum dikonfigurasi di .env.local
  if (!user || !pass) {
    console.log('\n======================================================');
    console.log(' [OJOL MENGAJI - SIMULASI SMTP EMAIL]');
    console.log(` Tujuan: ${email}`);
    console.log(` KODE OTP RESET PASSWORD: ${otp}`);
    console.log(' Masa berlaku: 5 Menit');
    console.log(' Catatan: Isi SMTP_USER dan SMTP_PASS di .env.local untuk mengirim email nyata.');
    console.log('======================================================\n');

    return {
      success: true,
      simulated: true,
      simulatedOtp: otp,
      message: 'Kode OTP berhasil dibuat (Mode Simulasi Pengembangan).',
    };
  }

  // Jika kredensial terisi, kirim email via Nodemailer
  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kode OTP Reset Kata Sandi - Ojol Mengaji</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="560px" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;" cellpadding="0" cellspacing="0">
                
                <!-- Header Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f172a 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                      PORTAL OJOL MENGAJI
                    </h1>
                    <p style="margin: 6px 0 0 0; font-size: 12px; color: #a7f3d0; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">
                      Gerakan Solidaritas &amp; Dakwah Mitra Ojol • DPW Hidayatullah DKI Jakarta
                    </p>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 32px 28px;">
                    <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #0f172a;">
                      Permintaan Reset Kata Sandi
                    </h2>
                    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                      Assalamu&apos;alaikum Warahmatullahi Wabarakatuh,<br>
                      Kami menerima permintaan untuk mengatur ulang kata sandi akun Ojol Mengaji Anda untuk alamat email <strong>${email}</strong>.
                    </p>

                    <!-- OTP Code Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                      <tr>
                        <td align="center" style="background-color: #ecfdf5; border: 2px dashed #059669; border-radius: 16px; padding: 24px 16px; text-align: center;">
                          <span style="display: block; font-size: 12px; font-weight: 700; color: #047857; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                            Kode Verifikasi (OTP) Anda
                          </span>
                          <span style="display: inline-block; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #064e3b; font-family: 'Courier New', Courier, monospace;">
                            ${otp}
                          </span>
                          <span style="display: block; font-size: 12px; color: #059669; margin-top: 8px; font-weight: 600;">
                            ⏰ Berlaku selama 5 menit
                          </span>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.6; color: #64748b;">
                      Masukkan 6 digit angka di atas pada halaman verifikasi lupa kata sandi. Demi keamanan akun, <strong>jangan bagikan kode ini kepada siapa pun</strong>, termasuk pengurus shelter atau relawan.
                    </p>

                    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 14px; border-radius: 8px; margin-top: 20px;">
                      <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.5;">
                        <strong>Bukan Anda yang meminta?</strong> Abaikan email ini. Kata sandi akun Anda tidak akan berubah selama kode ini tidak dimasukkan.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                    <p style="margin: 0 0 4px 0; font-weight: 600; color: #64748b;">
                      Layanan Bantuan &amp; Pendampingan Mitra Ojol Mengaji
                    </p>
                    <p style="margin: 0;">
                      WhatsApp Call Center: <a href="https://wa.me/6281247475178" style="color: #059669; text-decoration: none; font-weight: 700;">0812-4747-5178</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from,
      to: email,
      subject: `${otp} adalah Kode Verifikasi Reset Kata Sandi - Ojol Mengaji`,
      text: `Assalamu'alaikum. Kode OTP reset kata sandi akun Ojol Mengaji Anda adalah: ${otp}. Kode ini berlaku selama 5 menit. Jangan bagikan kode ini kepada siapapun.`,
      html: htmlContent,
    });

    console.log(`[SMTP SUCCESS] Email OTP terkirim ke ${email}. MessageId: ${info.messageId}`);

    return {
      success: true,
      simulated: false,
      message: 'Kode OTP telah berhasil dikirim ke alamat email Anda.',
    };
  } catch (error: any) {
    console.error('[SMTP ERROR] Gagal mengirim email OTP:', error);
    return {
      success: false,
      message: `Gagal mengirim email OTP: ${error?.message || 'Periksa konfigurasi SMTP Anda.'}`,
    };
  }
}
