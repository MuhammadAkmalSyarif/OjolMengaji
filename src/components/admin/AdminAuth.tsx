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
  KeyRound
} from 'lucide-react';

interface AdminAuthProps {
  onSuccess?: () => void;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ onSuccess }) => {
  const { loginStaff, currentUser } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!identifier.trim()) {
      setErrorMsg('Silakan masukkan email atau nomor HP pengelola.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = loginStaff(identifier, password);
      setIsSubmitting(false);

      if (res.success) {
        setSuccessMsg(res.message);
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message);
      }
    }, 450);
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
          Akses Terbatas
        </span>
      </div>

      {/* Hero Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-700 via-indigo-800 to-slate-900 shadow-lg text-white p-3.5 mb-3 ring-4 ring-purple-100">
          <Shield className="w-full h-full text-purple-200" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Portal <span className="text-purple-700">Pengelola &amp; Ustadz</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          Masuk ke pusat administrasi shelter, jadwal, presensi GPS, dan evaluasi tahsin mitra driver Ojol Mengaji.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Card Header Strip */}
        <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-800 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-purple-300" />
              <h2 className="font-bold text-sm sm:text-base">Login Akun Pengelola</h2>
            </div>
            <span className="text-[11px] bg-purple-900/80 text-purple-200 px-2.5 py-0.5 rounded-full border border-purple-400/30">
              Admin &amp; Dewan Guru
            </span>
          </div>
          <p className="text-[11px] text-purple-200/90 mt-1">
            Akun diberikan resmi oleh Sekretariat Ojol Mengaji (tidak dibuka pendaftaran mandiri).
          </p>
        </div>

        <div className="p-5 sm:p-7 space-y-5">
          {/* Notice: No registration info */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-slate-800">Tanpa Registrasi / Pendaftaran Mandiri:</span> Akun Administrator dan Dewan Guru telah didaftarkan dalam sistem. Masukkan kredensial yang telah diberikan.
            </div>
          </div>

          {/* Current Ojol notice if logged in as ojol */}
          {currentUser && currentUser.role === 'ojol' && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Perhatian</p>
                <p>
                  Anda saat ini sedang login sebagai driver <span className="font-bold">{currentUser.name}</span>. Silakan login dengan akun Administrator atau Guru di bawah ini untuk mengakses portal manajemen.
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
                <p className="text-[11px] text-emerald-700 mt-0.5">Membuka portal manajemen...</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            {/* Identifier (Email / WhatsApp) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email atau No. WhatsApp Pengelola <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Masukkan email atau no. WhatsApp"
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
                  placeholder="Masukkan kata sandi pengelola"
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
                <span>{isSubmitting ? 'Memverifikasi Akses...' : 'Masuk ke Portal Pengelola'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

