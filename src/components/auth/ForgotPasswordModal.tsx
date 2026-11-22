'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  onSuccessReset?: (email: string) => void;
}

type Step = 'email' | 'otp' | 'password' | 'success';

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
  onSuccessReset,
}) => {
  const { users, resetPassword } = useApp();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cooldown countdown
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Dev mode simulated OTP hint
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Reset state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setEmail(defaultEmail);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg(null);
      setSuccessMsg(null);
      setDevOtpHint(null);
    }
  }, [isOpen, defaultEmail]);

  // Handle countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setTimeout(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cooldown]);

  if (!isOpen) return null;

  // Step 1: Request OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setDevOtpHint(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Harap masukkan alamat email Anda.');
      return;
    }

    // Periksa apakah email terdaftar di data aplikasi
    const userFound = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!userFound) {
      setErrorMsg('Alamat email ini tidak terdaftar dalam sistem Ojol Mengaji. Pastikan Anda memasukkan email yang terdaftar saat registrasi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Gagal mengirim kode OTP.');
        if (data.remainingSeconds) {
          setCooldown(data.remainingSeconds);
        }
        return;
      }

      setSuccessMsg(data.message);
      setCooldown(60); // 60 detik cooldown
      if (data.simulated && data.simulatedOtp) {
        setDevOtpHint(data.simulatedOtp);
      }
      setStep('otp');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg('Terjadi kesalahan koneksi server saat mengirim OTP.');
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setErrorMsg('Harap masukkan 6 digit kode OTP lengkap.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: cleanOtp }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Kode OTP tidak valid.');
        return;
      }

      setSuccessMsg('Kode OTP berhasil diverifikasi! Silakan tentukan kata sandi baru Anda.');
      setStep('password');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg('Terjadi kesalahan koneksi server saat memverifikasi OTP.');
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newPassword || newPassword.length < 4) {
      setErrorMsg('Kata sandi baru minimal 4 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = resetPassword(email.trim().toLowerCase(), newPassword);
      setIsLoading(false);

      if (res.success) {
        setStep('success');
      } else {
        setErrorMsg(res.message);
      }
    }, 400);
  };

  const handleFinish = () => {
    onClose();
    if (onSuccessReset) {
      onSuccessReset(email.trim().toLowerCase());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-scaleUp">
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 px-5 sm:px-6 py-4 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                Reset Kata Sandi Akun
              </h2>
              <p className="text-[11px] text-emerald-200/90">
                Verifikasi Kode OTP via Email (SMTP)
              </p>
            </div>
          </div>

          {/* Stepper Wizard Indicator */}
          {step !== 'success' && (
            <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] font-semibold text-emerald-200/80">
              <span className={`flex items-center gap-1 ${step === 'email' ? 'text-white font-bold' : ''}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${step === 'email' ? 'bg-emerald-400 text-slate-950 font-black' : 'bg-white/20 text-white'}`}>1</span>
                <span>Email</span>
              </span>
              <span className="text-white/30">→</span>
              <span className={`flex items-center gap-1 ${step === 'otp' ? 'text-white font-bold' : ''}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${step === 'otp' ? 'bg-emerald-400 text-slate-950 font-black' : 'bg-white/20 text-white'}`}>2</span>
                <span>Kode OTP</span>
              </span>
              <span className="text-white/30">→</span>
              <span className={`flex items-center gap-1 ${step === 'password' ? 'text-white font-bold' : ''}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${step === 'password' ? 'bg-emerald-400 text-slate-950 font-black' : 'bg-white/20 text-white'}`}>3</span>
                <span>Sandi Baru</span>
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Alert Error */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-rose-950">Perhatian</p>
                <p className="mt-0.5 text-rose-800 leading-relaxed">{errorMsg}</p>
              </div>
              <button type="button" onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Alert Success */}
          {successMsg && step !== 'success' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-emerald-900">Alhamdulillah</p>
                <p className="mt-0.5 text-emerald-800 leading-relaxed">{successMsg}</p>
              </div>
              <button type="button" onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-800">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Dev Hint Callout (If SMTP is not yet set in .env.local, show simulated OTP so developer won't get stuck) */}
          {devOtpHint && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Mode Simulasi Pengujian (Developer Helper):</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Kredensial SMTP di <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env.local</code> belum diisi akun Gmail. Kode OTP Anda adalah:
              </p>
              <div className="bg-white p-2 rounded-xl border border-amber-300 text-center">
                <span className="font-mono text-xl font-black text-amber-950 tracking-widest">{devOtpHint}</span>
                <button
                  type="button"
                  onClick={() => setOtp(devOtpHint)}
                  className="block mx-auto mt-1 text-[10px] text-amber-700 underline font-bold hover:text-amber-900"
                >
                  Klik untuk otomatis tempel kode ini
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 1: INPUT EMAIL ================= */}
          {step === 'email' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="text-xs text-slate-600 leading-relaxed">
                Masukkan alamat email yang terdaftar pada akun Ojol Mengaji Anda. Sistem akan mengirimkan <strong>6 digit kode OTP verifikasi</strong> melalui email.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alamat Email Terdaftar <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Contoh: rian.gojek@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 shadow-md shadow-emerald-800/20 active:scale-[0.99] transition disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menghubungi Server SMTP...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Kirim Kode OTP ke Email</span>
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Kembali ke Halaman Masuk
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 2: INPUT OTP ================= */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Tujuan Email:</span>
                  <span className="font-bold text-slate-800">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setErrorMsg(null);
                  }}
                  className="text-[11px] font-bold text-emerald-700 hover:underline"
                >
                  Ganti Email
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                  Masukkan 6 Digit Kode OTP
                </label>
                <div className="relative max-w-xs mx-auto">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full py-3 text-center text-2xl font-mono font-extrabold tracking-[10px] rounded-xl border border-slate-300 bg-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 text-center mt-1.5 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Kode berlaku selama 5 menit
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 shadow-md shadow-emerald-800/20 active:scale-[0.99] transition disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Kode...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verifikasi Kode OTP</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                {cooldown > 0 ? (
                  <p className="text-xs text-slate-400 font-medium">
                    Kirim ulang kode dalam <span className="font-bold text-emerald-700">{cooldown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRequestOtp()}
                    disabled={isLoading}
                    className="text-xs text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Kirim Ulang Kode OTP</span>
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ================= STEP 3: BUAT PASSWORD BARU ================= */}
          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-xs text-slate-600 leading-relaxed">
                Kode OTP cocok! Silakan buat kata sandi baru untuk akun <strong>{email}</strong>.
              </div>

              {/* Password Baru */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimal 4 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password Baru */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ulangi Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Ketik ulang kata sandi baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <p className={`text-[10px] mt-1 font-semibold ${
                    confirmPassword === newPassword ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {confirmPassword === newPassword ? '✓ Konfirmasi kata sandi cocok' : '✗ Konfirmasi kata sandi belum sama'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !newPassword || newPassword !== confirmPassword}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 shadow-md shadow-emerald-800/20 active:scale-[0.99] transition disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Perubahan...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Simpan Kata Sandi Baru</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= STEP 4: SELESAI & SUKSES ================= */}
          {step === 'success' && (
            <div className="py-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto shadow-inner animate-scaleUp">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Kata Sandi Berhasil Diperbarui!
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                  Alhamdulillah, kata sandi akun Anda telah berhasil direset. Silakan masuk menggunakan kata sandi baru Anda.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-700 hover:bg-emerald-800 shadow-md shadow-emerald-800/20 active:scale-[0.99] transition"
                >
                  <span>Masuk ke Akun Sekarang</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-400">
          <span>Ojol Mengaji Security • Protokol Perlindungan Akun &amp; Presensi</span>
        </div>
      </div>
    </div>
  );
};
