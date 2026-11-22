import { NextRequest, NextResponse } from 'next/server';
import { canRequestOtp, createOtp } from '@/lib/otpStore';
import { sendOtpEmail } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Alamat email wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: 'Format alamat email tidak valid.' },
        { status: 400 }
      );
    }

    // Periksa cooldown request pengiriman ulang
    const cooldown = canRequestOtp(cleanEmail);
    if (!cooldown.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Harap tunggu ${cooldown.remainingSeconds} detik sebelum meminta kode OTP baru.`,
          remainingSeconds: cooldown.remainingSeconds,
        },
        { status: 429 }
      );
    }

    // Buat kode OTP baru
    const { otp, expiresAt } = createOtp(cleanEmail);

    // Kirim email via SMTP
    const mailResult = await sendOtpEmail(cleanEmail, otp);

    if (!mailResult.success) {
      return NextResponse.json(
        { success: false, message: mailResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: mailResult.simulated
        ? 'Kode OTP berhasil dibuat (Mode Simulasi Lokal).'
        : 'Kode OTP 6-digit telah dikirimkan ke email Anda. Silakan periksa Kotak Masuk atau folder Spam.',
      expiresAt,
      simulated: mailResult.simulated,
      // Kembalikan simulatedOtp hanya jika SMTP belum diisi agar developer/penguji tidak macet
      simulatedOtp: mailResult.simulatedOtp,
    });
  } catch (error: any) {
    console.error('Error in /api/auth/send-otp:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat mengirim kode OTP.' },
      { status: 500 }
    );
  }
}
