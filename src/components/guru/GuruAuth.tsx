'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  GraduationCap, 
  Shield, 
  Bike, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  Info,
  BookOpen,
  Sparkles,
  UserCheck
} from 'lucide-react';

interface GuruAuthProps {
  onSuccess?: () => void;
}

export const GuruAuth: React.FC<GuruAuthProps> = ({ onSuccess }) => {
  const { loginStaff, currentUser, users } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter guru accounts for quick login help
  const guruUsers = users.filter(u => u.role === 'guru');

  const handleLogin = (e?: React.FormEvent, customId?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const loginId = customId !== undefined ? customId : identifier;
    const loginPass = customPass !== undefined ? customPass : password;

    if (!loginId.trim()) {
      setErrorMsg('Silakan masukkan email atau nomor WhatsApp Ustadz.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = loginStaff(loginId, loginPass);
      setIsSubmitting(false);

      if (res.success) {
        if (res.user?.role !== 'guru' && res.user?.role !== 'admin') {
          setErrorMsg('Akun ini bukan akun Dewan Guru (Ustadz). Silakan gunakan akun Guru.');
          return;
        }
        setSuccessMsg(res.message);
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message);
      }
    }, 400);
  };

  const handleQuickGuruLogin = (email: string) => {
    setIdentifier(email);
    setPassword('guru');
    handleLogin(undefined, email, 'guru');
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

        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-teal-100 text-teal-900 px-2.5 py-1 rounded-md border border-teal-200">
          <GraduationCap className="w-3.5 h-3.5 text-teal-700" />
          Halaman 3: Portal Guru Mengaji
        </span>
      </div>

      {/* Hero Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-700 via-emerald-800 to-slate-900 shadow-lg text-white p-3.5 mb-3 ring-4 ring-teal-100">
          <GraduationCap className="w-full h-full text-teal-200" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Portal <span className="text-teal-700">Dewan Guru Mengaji</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          Masuk untuk mengelola kelas halaqah binaan, verifikasi presensi mandiri driver, dan pengisian rubrik evaluasi tahsin 6 aspek.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Card Header Strip */}
        <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-800 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-300" />
              <h2 className="font-bold text-sm sm:text-base">Login Akun Ustadz / Pembina</h2>
            </div>
            <span className="text-[11px] bg-teal-900/80 text-teal-200 px-2.5 py-0.5 rounded-full border border-teal-400/30">
              Khusus Dewan Guru
            </span>
          </div>
          <p className="text-[11px] text-teal-200/90 mt-1">
            Gunakan akun resmi Ustadz yang telah didaftarkan oleh Administrator Pusat.
          </p>
        </div>

        <div className="p-5 sm:p-7 space-y-5">
          {/* Quick 1-Click Guru Demo Buttons */}
          <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200 text-teal-950 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-teal-900 mb-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Pilih Cepat Akun Ustadz (Demo / Simulasi):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {guruUsers.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleQuickGuruLogin(g.email)}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-white hover:bg-teal-100/60 border border-teal-200 text-left transition shadow-2xs group"
                >
                  <img
                    src={g.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                    alt={g.name}
                    className="w-8 h-8 rounded-full object-cover border border-teal-300"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 text-[11px] truncate group-hover:text-teal-900">
                      {g.name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{g.email}</p>
                  </div>
                  <UserCheck className="w-3.5 h-3.5 text-teal-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          {/* Current Ojol notice if logged in as ojol */}
          {currentUser && currentUser.role === 'ojol' && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Perhatian</p>
                <p>
                  Anda saat ini sedang login sebagai driver <span className="font-bold">{currentUser.name}</span>. Silakan masuk menggunakan akun Ustadz untuk mengakses modul penilaian dan kelas bimbingan.
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
            <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-300 text-teal-900 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Berhasil Masuk!</p>
                <p>{successMsg}</p>
                <p className="text-[11px] text-teal-700 mt-0.5">Membuka portal dewan guru...</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            {/* Identifier (Email / WhatsApp) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email atau No. WhatsApp Ustadz <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contoh: ahmad.fauzi@ojolmengaji.id"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Kata Sandi (Password) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">Default: <span className="font-mono font-bold text-teal-700">guru</span></span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan kata sandi guru"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
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
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 hover:from-teal-800 hover:to-emerald-800 shadow-md shadow-teal-700/25 active:scale-[0.99] transition disabled:opacity-60"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Memverifikasi Akses...' : 'Masuk ke Portal Guru Mengaji'}</span>
              </button>
            </div>
          </form>

          {/* Links to Other Pages */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-1.5 text-purple-700 hover:text-purple-800 font-semibold transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Ke Halaman 2: Admin Pusat &rarr;</span>
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

