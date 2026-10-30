'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Bike, 
  BookOpen, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { RegisterDriverData } from '@/types';

interface DriverAuthProps {
  onSuccess?: () => void;
}

export const DriverAuth: React.FC<DriverAuthProps> = ({ onSuccess }) => {
  const { shelters, users, registerDriver, loginDriver } = useApp();

  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Registration Form State
  const [regForm, setRegForm] = useState<RegisterDriverData>({
    name: '',
    phone: '',
    email: '',
    password: '',
    ojolPlatform: 'Gojek',
    vehiclePlate: '',
    shelterId: shelters[0]?.id || '',
    currentLevel: 'Iqro 1-3',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // List of existing ojol drivers for quick simulation login
  const existingDrivers = users.filter(u => u.role === 'ojol');

  // Handle Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!regForm.name.trim()) {
      setErrorMsg('Nama lengkap wajib diisi sesuai KTP/akun ojol.');
      return;
    }
    if (!regForm.phone.trim() || regForm.phone.trim().length < 9) {
      setErrorMsg('Nomor WhatsApp / HP aktif wajib diisi (minimal 9 digit).');
      return;
    }
    if (!regForm.vehiclePlate.trim()) {
      setErrorMsg('Nomor plat kendaraan wajib diisi (contoh: B 3456 KKL).');
      return;
    }
    if (!regForm.shelterId) {
      setErrorMsg('Silakan pilih shelter pembinaan terdekat.');
      return;
    }
    if (regForm.password && regForm.password.length < 4) {
      setErrorMsg('Kata sandi minimal 4 karakter.');
      return;
    }
    if (regForm.password && regForm.password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Harap setujui komitmen pembinaan mengaji di shelter.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = registerDriver(regForm);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg(res.message);
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message);
      }
    }, 600);
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginIdentifier.trim()) {
      setErrorMsg('Silakan masukkan nomor WhatsApp atau email Anda.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = loginDriver(loginIdentifier, loginPassword);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg(res.message);
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message);
      }
    }, 500);
  };

  // Handle Quick Login for testing
  const handleQuickLogin = (driverUser: (typeof users)[0]) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoginIdentifier(driverUser.phone || driverUser.email);
    setLoginPassword(driverUser.password || '123');
    const res = loginDriver(driverUser.email, driverUser.password || '123');
    if (res.success) {
      setSuccessMsg(res.message);
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 px-2 sm:px-4">
      {/* Hero Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-md border border-emerald-200 p-2 mb-3">
          <img
            src="/logo-ojol-mengaji.png"
            alt="Logo Ojol Mengaji"
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Portal Santri <span className="text-emerald-700">Ojol Mengaji</span>
        </h1>
        <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">
          Program Pembinaan Al-Qur&apos;an &amp; Presensi Kehadiran Khusus Mitra Driver Ojol Berbasis Shelter Se-Jabodetabek
        </p>
      </div>

      {/* Main Card with Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg shadow-slate-200/50 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'register'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Daftar Santri Driver Baru</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'login'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk / Login Akun</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-7">
          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Mohon Maaf</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm flex items-start gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Alhamdulillah Berhasil!</p>
                <p>{successMsg}</p>
                <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                  Anda sedang dialihkan ke Dashboard Santri Driver...
                </p>
              </div>
            </div>
          )}

          {/* TAB 1: REGISTRATION */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-800">
                  Formulir Pendaftaran Santri Ojol
                </h2>
                <span className="text-[11px] text-emerald-600 ml-auto font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Gratis 100%
                </span>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rian Hidayat"
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Sesuai KTP / Nama di aplikasi driver</p>
              </div>

              {/* No WhatsApp & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. WhatsApp / HP <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="081234567890"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alamat Email (Opsional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      placeholder="driver@gmail.com"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Platform Ojol & Plat Motor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mitra Ojol <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Bike className="w-4 h-4" />
                    </div>
                    <select
                      value={regForm.ojolPlatform}
                      onChange={(e) => setRegForm({ ...regForm, ojolPlatform: e.target.value as any })}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                    >
                      <option value="Gojek">Gojek</option>
                      <option value="Grab">Grab</option>
                      <option value="Maxim">Maxim</option>
                      <option value="InDrive">InDrive</option>
                      <option value="ShopeeFood">ShopeeFood</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Plat Nomor Motor <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: B 3456 KKL"
                    value={regForm.vehiclePlate}
                    onChange={(e) => setRegForm({ ...regForm, vehiclePlate: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition uppercase"
                  />
                </div>
              </div>

              {/* Pilihan Shelter Mengaji */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilihan Shelter Mengaji Terdekat <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  </div>
                  <select
                    value={regForm.shelterId}
                    onChange={(e) => setRegForm({ ...regForm, shelterId: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition font-medium"
                  >
                    {shelters.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.address.split(',')[1]?.trim() || s.address})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Lokasi pangkalan / shelter di mana Anda akan hadir mengaji dan presensi GPS.
                </p>
              </div>

              {/* Tingkat Kemampuan Mengaji */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tingkat Kemampuan Mengaji Awal <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                  </div>
                  <select
                    value={regForm.currentLevel}
                    onChange={(e) => setRegForm({ ...regForm, currentLevel: e.target.value as any })}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  >
                    <option value="Iqro 1-3">Iqro 1 - 3 (Pemula / Belajar Huruf Hijaiyah Dasar)</option>
                    <option value="Iqro 4-6">Iqro 4 - 6 (Menengah / Lancar Menyambung Huruf)</option>
                    <option value="Al-Qur'an Dasar">Al-Qur&apos;an Dasar (Mulai Membaca Mushaf Al-Qur&apos;an)</option>
                    <option value="Al-Qur'an Mahir / Tajwid">Al-Qur&apos;an Mahir / Tajwid (Pendalaman Hukum Bacaan &amp; Makhraj)</option>
                  </select>
                </div>
              </div>

              {/* Kata Sandi & Konfirmasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Buat Kata Sandi (Password) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimal 4 karakter"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ulangi Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Konfirmasi kata sandi"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Komitmen Santri */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    Bismillah, saya berniat ikhlas mengikuti bimbingan mengaji bersama ustadz di shelter, mematuhi adab majelis, dan menjaga keistiqamahan belajar Al-Qur&apos;an.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 shadow-md shadow-emerald-700/20 active:scale-[0.99] transition disabled:opacity-60"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Mendaftarkan Akun Driver...' : 'Daftar Sekarang Sebagai Santri Driver'}</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              {/* Switch to login */}
              <p className="text-center text-xs text-slate-500 pt-2">
                Sudah pernah mendaftar sebelumnya?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg(null);
                  }}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Masuk ke akun Anda di sini
                </button>
              </p>
            </form>
          )}

          {/* TAB 2: LOGIN */}
          {activeTab === 'login' && (
            <div className="space-y-5">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <LogIn className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-800">
                    Masuk ke Akun Santri Driver
                  </h2>
                </div>

                {/* Email or WhatsApp */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp atau Email Terdaftar <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 085711223344 atau rian.gojek@gmail.com"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                    />
                  </div>
                </div>

                {/* Kata Sandi */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Kata Sandi <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Masukkan kata sandi akun Anda"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Tombol Masuk */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 shadow-md shadow-emerald-700/20 active:scale-[0.99] transition disabled:opacity-60"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isSubmitting ? 'Memeriksa Kredensial...' : 'Masuk ke Dashboard Driver'}</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>

                {/* Switch to register */}
                <p className="text-center text-xs text-slate-500 pt-1">
                  Belum punya akun santri?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setErrorMsg(null);
                    }}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    Daftar akun baru di sini
                  </button>
                </p>
              </form>

              {/* Quick Simulation / Demo Driver Accounts */}
              {existingDrivers.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2.5">
                    <Bike className="w-3.5 h-3.5 text-amber-600" />
                    <span>Uji Coba Cepat dengan Akun Driver Terdaftar:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {existingDrivers.map((driver) => {
                      return (
                        <button
                          key={driver.id}
                          type="button"
                          onClick={() => handleQuickLogin(driver)}
                          className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50 hover:bg-emerald-50/50 transition-all flex items-center gap-2.5 group"
                        >
                          <img
                            src={driver.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={driver.name}
                            className="w-8 h-8 rounded-full border border-emerald-400 object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 truncate">
                              {driver.name}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {driver.phone || driver.email}
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Kehadiran Terverifikasi GPS &amp; QR Shelter</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Bimbingan Ustadz Bersanad</span>
        </div>
      </div>
    </div>
  );
};

