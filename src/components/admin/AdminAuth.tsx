'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  Shield, 
  GraduationCap, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  Info,
  KeyRound,
  Sparkles,
  Bike
} from 'lucide-react';

interface AdminAuthProps {
  onSuccess?: () => void;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ onSuccess }) => {
  const { loginStaff, currentUser } = useApp();

  const [identifier, setIdentifier] = useState('admin@ojolmengaji.id');
  const [password, setPassword] = useState('OjolMengaji_Admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e?: React.FormEvent, customId?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const loginId = customId !== undefined ? customId : identifier;
    const loginPass = customPass !== undefined ? customPass : password;

    if (!loginId.trim()) {
      setErrorMsg('Silakan masukkan email Administrator Pusat.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = loginStaff(loginId, loginPass);
      setIsSubmitting(false);

      if (res.success) {
        if (res.user?.role !== 'admin') {
          setErrorMsg('Akun ini terdaftar sebagai Guru Mengaji. Halaman ini khusus Administrator Pusat. Silakan menuju Halaman 3 (Portal Guru).');
          return;
        }
        setSuccessMsg(res.message);
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message);
      }
    }, 400);
  };

  const handleFillOfficialAdmin = () => {
    setIdentifier('admin@ojolmengaji.id');
    setPassword('OjolMengaji_Admin123');
    handleLogin(undefined, 'admin@ojolmengaji.id', 'OjolMengaji_Admin123');
  };

  return (
    <div className="max-w-xl mx-auto py-4 px-2 sm:px-4">
      {/* Top back navigation */}
      <div className="mb-4 flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Halaman Driver</span>
        </Link>

        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-100 text-purple-900 px-2.5 py-1 rounded-md border border-purple-200">
          <Shield className="w-3 h-3 text-purple-700" />
          Halaman 2: Administrator Pusat
        </span>
      </div>

      {/* Hero Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-700 via-indigo-800 to-slate-900 shadow-lg text-white p-3.5 mb-3 ring-4 ring-purple-100">
          <Shield className="w-full h-full text-purple-200" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Portal <span className="text-purple-700">Administrator Pusat</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          Masuk ke pusat kendali master data shelter, alokasi guru, verifikasi data driver, rekap kehadiran, dan audit log sistem.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Card Header Strip */}
        <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-800 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-purple-300" />
              <h2 className="font-bold text-sm sm:text-base">Login Akun Administrator Pusat</h2>
            </div>
            <span className="text-[11px] bg-purple-900/80 text-purple-200 px-2.5 py-0.5 rounded-full border border-purple-400/30">
              Akses Terbatas
            </span>
          </div>
          <p className="text-[11px] text-purple-200/90 mt-1">
            Hanya akun resmi Administrator Pusat yang memiliki wewenang mengelola data induk platform.
          </p>
        </div>

        <div className="p-5 sm:p-7 space-y-5">
          {/* Quick Admin Credential Button */}
          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 font-bold text-purple-900">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Akun Administrator Resmi:</span>
              </div>
              <button
                type="button"
                onClick={handleFillOfficialAdmin}
                className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-2xs transition"
              >
                Klik untuk Masuk Cepat
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-purple-800/90 font-mono">
              Email: <strong>admin@ojolmengaji.id</strong> | Password: <strong>OjolMengaji_Admin123</strong>
            </p>
          </div>

          {/* Current Ojol notice if logged in as ojol */}
          {currentUser && currentUser.role === 'ojol' && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Perhatian</p>
                <p>
                  Anda saat ini sedang login sebagai driver <span className="font-bold">{currentUser.name}</span>. Silakan masuk dengan akun Administrator Pusat di bawah ini untuk mengakses master data.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Gagal Masuk</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Berhasil Masuk!</p>
                <p>{successMsg}</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">Membuka portal administrator pusat...</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            {/* Identifier (Email) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Administrator Pusat <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="admin@ojolmengaji.id"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Kata Sandi (Password) <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan kata sandi admin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-800 hover:to-indigo-800 shadow-md shadow-purple-700/25 active:scale-[0.99] transition disabled:opacity-60"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Memverifikasi Akses...' : 'Masuk ke Portal Administrator'}</span>
              </button>
            </div>
          </form>

          {/* Links to Other Pages */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <Link 
              href="/guru" 
              className="inline-flex items-center gap-1.5 text-teal-700 hover:text-teal-800 font-semibold transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Ke Halaman 3: Guru Mengaji (Ustadz) &rarr;</span>
            </Link>

            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold transition-colors"
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Ke Halaman 1: User / Driver &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
