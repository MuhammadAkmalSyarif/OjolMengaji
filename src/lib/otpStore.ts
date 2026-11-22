// In-memory OTP storage for server environment

interface OtpEntry {
  otp: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

// Global declaration to maintain map across Next.js hot reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var __ojolOtpStore: Map<string, OtpEntry> | undefined;
}

const otpStore: Map<string, OtpEntry> = global.__ojolOtpStore || new Map();
if (process.env.NODE_ENV !== 'production') {
  global.__ojolOtpStore = otpStore;
}

const OTP_TTL_MS = 5 * 60 * 1000; // 5 menit
const COOLDOWN_MS = 60 * 1000; // 60 detik cooldown pengiriman ulang
const MAX_ATTEMPTS = 5; // Maksimal 5 kali salah masukkan kode

export function canRequestOtp(email: string): { allowed: boolean; remainingSeconds: number } {
  const cleanEmail = email.trim().toLowerCase();
  const existing = otpStore.get(cleanEmail);
  if (!existing) {
    return { allowed: true, remainingSeconds: 0 };
  }

  const elapsed = Date.now() - existing.createdAt;
  if (elapsed < COOLDOWN_MS) {
    const remaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
    return { allowed: false, remainingSeconds: remaining };
  }

  return { allowed: true, remainingSeconds: 0 };
}

export function createOtp(email: string): { otp: string; expiresAt: number } {
  const cleanEmail = email.trim().toLowerCase();
  // Generate 6-digit random code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();
  const expiresAt = now + OTP_TTL_MS;

  otpStore.set(cleanEmail, {
    otp: code,
    expiresAt,
    attempts: 0,
    createdAt: now,
  });

  return { otp: code, expiresAt };
}

export function verifyOtp(email: string, otp: string): { valid: boolean; message: string } {
  const cleanEmail = email.trim().toLowerCase();
  const entry = otpStore.get(cleanEmail);

  if (!entry) {
    return {
      valid: false,
      message: 'Kode OTP tidak ditemukan atau belum diminta. Silakan kirim ulang kode baru.',
    };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(cleanEmail);
    return {
      valid: false,
      message: 'Kode OTP sudah kadaluarsa (melewati batas 5 menit). Silakan minta kode baru.',
    };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(cleanEmail);
    return {
      valid: false,
      message: 'Terlalu banyak percobaan salah. Demi keamanan, kode OTP telah dibatalkan. Silakan minta kode baru.',
    };
  }

  if (entry.otp !== otp.trim()) {
    entry.attempts += 1;
    const sisa = MAX_ATTEMPTS - entry.attempts;
    return {
      valid: false,
      message: `Kode OTP salah. Sisa kesempatan: ${sisa} kali.`,
    };
  }

  // Kode cocok & valid! Hapus OTP agar tidak dapat digunakan ulang (single use)
  otpStore.delete(cleanEmail);
  return {
    valid: true,
    message: 'Kode OTP berhasil diverifikasi.',
  };
}
