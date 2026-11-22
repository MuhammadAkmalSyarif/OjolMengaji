import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/otpStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Alamat email wajib diisi.' },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Kode OTP wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const verification = verifyOtp(cleanEmail, cleanOtp);

    if (!verification.valid) {
      return NextResponse.json(
        { success: false, message: verification.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kode OTP berhasil diverifikasi. Silakan masukkan kata sandi baru Anda.',
    });
  } catch (error: any) {
    console.error('Error in /api/auth/verify-otp:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server saat memverifikasi OTP.' },
      { status: 500 }
    );
  }
}
