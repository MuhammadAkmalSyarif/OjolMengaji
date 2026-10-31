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
  HelpCircle,
  X,
  MessageCircle,
  Check,
  Info
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
  const [rememberMe, setRememberMe] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);

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

  // Platform styling helper
  const platforms = [
    { id: 'Gojek', label: 'Gojek', color: 'border-emerald-500 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 ring-emerald-500' },
    { id: 'Grab', label: 'Grab', color: 'border-green-600 text-green-800 bg-green-50 hover:bg-green-100 ring-green-600' },
    { id: 'Maxim', label: 'Maxim', color: 'border-amber-500 text-amber-900 bg-amber-50 hover:bg-amber-100 ring-amber-500' },
    { id: 'InDrive', label: 'InDrive', color: 'border-cyan-600 text-cyan-800 bg-cyan-50 hover:bg-cyan-100 ring-cyan-600' },
    { id: 'ShopeeFood', label: 'ShopeeFood', color: 'border-orange-500 text-orange-800 bg-orange-50 hover:bg-orange-100 ring-orange-500' },
  ] as const;

  // Level definitions with descriptions
  const levelOptions = [
    {
      id: 'Iqro 1-3',
      title: 'Iqro 1 - 3',
      badge: 'Pemula Dasar',
      desc: 'Mengenal huruf hijaiyah tunggal & harakat dasar',
      icon: '🌱',
    },
    {
      id: 'Iqro 4-6',
      title: 'Iqro 4 - 6',
      badge: 'Menengah',
      desc: 'Menyambung huruf, tanda sukun, tasydid, & mad panjang',
      icon: '🌿',
    },
    {
      id: 'Al-Qur\'an Dasar',
      title: 'Al-Qur\'an Dasar',
      badge: 'Lancar Mushaf',
      desc: 'Mulai tilawah membaca langsung dari mushaf Al-Qur\'an',
      icon: '📖',
    },
    {
      id: 'Al-Qur\'an Mahir / Tajwid',
      title: 'Tahsin & Tajwid',
      badge: 'Tingkat Mahir',
      desc: 'Pendalaman makharijul huruf, hukum tajwid & waqaf',
      icon: '🌟',
    },
  ] as const;

  // Password Strength Calculator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: 'bg-slate-200' };
    if (pass.length < 4) return { score: 1, text: 'Terlalu pendek (min. 4)', color: 'bg-rose-500' };
    if (pass.length < 6) return { score: 2, text: 'Cukup', color: 'bg-amber-500' };
    return { score: 3, text: 'Kuat & Aman', color: 'bg-emerald-600' };
  };

  const passStrength = getPasswordStrength(regForm.password || '');

  // Handle Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!regForm.name.trim()) {
      setErrorMsg('Nama lengkap wajib diisi sesuai KTP atau akun ojol Anda.');
      return;
    }
    if (!regForm.phone.trim() || regForm.phone.trim().length < 9) {
      setErrorMsg('Nomor WhatsApp aktif wajib diisi (minimal 9 digit).');
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
      setErrorMsg('Kata sandi minimal 4 karakter demi keamanan akun Anda.');
      return;
    }
    if (regForm.password && regForm.password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Harap centang persetujuan niat dan komitmen belajar mengaji.');
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

  return (
    <div className="w-full max-w-2xl mx-auto py-2 sm:py-6 px-2 sm:px-4">
      {/* Top Partnership & Official Endorsement Banner */}
      <div className="mb-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-emerald-950/20 border border-emerald-700/40 relative overflow-hidden text-center sm:text-left">
        {/* Decorative Islamic Background Pattern Elements */}
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-10 w-40 h-40 bg-teal-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Dual Brand Logos & Title */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-inner shrink-0">
              <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm">
                <img
                  src="/logo-ojol-mengaji.png"
                  alt="Logo Ojol Mengaji"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm">
                <img
                  src="/logo-dpw.jpg"
                  alt="Logo DPW DKI Jakarta"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  Gerakan Solidaritas &amp; Dakwah Mitra Ojol
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-teal-200">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Didukung DPW DKI Jakarta
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1 text-white">
                Portal Pembinaan Al-Qur&apos;an <span className="text-emerald-400">Mitra Driver</span>
              </h1>
              <p className="text-xs text-slate-300 mt-0.5 max-w-md">
                Bimbingan Al-Qur&apos;an &amp; Presensi Berbasis Shelter Se-Jabodetabek. 100% Gratis &amp; Bersahabat.
              </p>
            </div>
          </div>

          {/* Right Action / Helpline Button */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all backdrop-blur-md active:scale-95"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-300" />
              <span>Bantuan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modern Authentication Card (Login & Register) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/60 overflow-hidden">
        {/* Elegant Tab Switcher Header */}
        <div className="p-2 sm:p-2.5 bg-slate-100/90 border-b border-slate-200">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/60 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/20 ring-1 ring-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Mitra Baru</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
                activeTab === 'register' ? 'bg-emerald-800 text-emerald-200' : 'bg-emerald-100 text-emerald-800'
              }`}>
                Gratis
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/20 ring-1 ring-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Akun</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                activeTab === 'login' ? 'bg-emerald-800 text-emerald-200' : 'bg-slate-200 text-slate-700'
              }`}>
                Mitra
              </span>
            </button>
          </div>
        </div>

        {/* Notification Messages */}
        <div className="px-5 sm:px-7 pt-5">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-rose-950">Mohon Periksa Kembali</p>
                <p className="mt-0.5 text-rose-800 leading-relaxed">{errorMsg}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setErrorMsg(null)}
                className="text-rose-400 hover:text-rose-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs sm:text-sm flex items-start gap-3 animate-fadeIn shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-emerald-900">Alhamdulillah Berhasil!</p>
                <p className="mt-0.5 text-emerald-800">{successMsg}</p>
                <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Membuka dashboard akun driver Anda...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* TAB CONTENT: FORM REGISTER */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="p-5 sm:p-7 space-y-6">
            {/* Section 1: Data Diri */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  Identitas Pribadi Driver
                </h3>
                <span className="text-[11px] text-slate-400 ml-auto">Langkah 1 dari 4</span>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Lengkap Driver <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rian Hidayat"
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3 text-slate-400 inline" />
                  Tuliskan nama lengkap sesuai KTP atau nama di aplikasi ojol Anda.
                </p>
              </div>

              {/* No WhatsApp & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nomor WhatsApp / HP Aktif <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="081234567890"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Digunakan untuk login &amp; info jadwal</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Alamat Email <span className="text-slate-400 font-normal">(Opsional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      placeholder="driver@gmail.com"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Opsional, bisa juga login dengan No. WA</p>
                </div>
              </div>
            </div>

            {/* Section 2: Platform Ojol, Plat Nomor, & Shelter */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  Armada Ojol &amp; Shelter Pilihan
                </h3>
                <span className="text-[11px] text-slate-400 ml-auto">Langkah 2 dari 4</span>
              </div>

              {/* Platform Ojol Visual Selector Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Aplikasi Mitra Ojol Anda <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {platforms.map((p) => {
                    const isSelected = regForm.ojolPlatform === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setRegForm({ ...regForm, ojolPlatform: p.id })}
                        className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-xs font-bold transition-all ${
                          isSelected
                            ? `${p.color} ring-2 shadow-xs scale-[1.02]`
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Bike className={`w-4 h-4 mb-1 ${isSelected ? 'text-current' : 'text-slate-400'}`} />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Plat Motor & Shelter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Plat Nomor Motor <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: B 3456 KKL"
                    value={regForm.vehiclePlate}
                    onChange={(e) => setRegForm({ ...regForm, vehiclePlate: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs font-mono font-bold uppercase"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Sesuai motor yang digunakan narik</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Shelter Binaan Terdekat <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <select
                      value={regForm.shelterId}
                      onChange={(e) => setRegForm({ ...regForm, shelterId: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs font-semibold text-slate-800"
                    >
                      {shelters.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.address.split(',')[1]?.trim() || s.address})
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Lokasi pangkalan presensi &amp; belajar</p>
                </div>
              </div>
            </div>

            {/* Section 3: Tingkat Kemampuan Mengaji */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  Tingkat Kemampuan Mengaji Saat Ini
                </h3>
                <span className="text-[11px] text-slate-400 ml-auto">Langkah 3 dari 4</span>
              </div>

              <p className="text-xs text-slate-600">
                Pilih perkiraan kemampuan membaca Al-Qur&apos;an Anda saat ini (tidak perlu malu, ustadz akan membimbing dari dasar):
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {levelOptions.map((lvl) => {
                  const isSelected = regForm.currentLevel === lvl.id;
                  return (
                    <div
                      key={lvl.id}
                      onClick={() => setRegForm({ ...regForm, currentLevel: lvl.id })}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/30'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{lvl.icon}</span>
                          <span className="text-xs font-extrabold text-slate-900">{lvl.title}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {lvl.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{lvl.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Buat Kata Sandi */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  Keamanan Akun &amp; Kata Sandi
                </h3>
                <span className="text-[11px] text-slate-400 ml-auto">Langkah 4 dari 4</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Buat Kata Sandi (Password) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimal 4 karakter"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {regForm.password && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${passStrength.color} transition-all duration-300`} 
                          style={{ width: `${(passStrength.score / 3) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500">{passStrength.text}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ulangi Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Ketik ulang kata sandi"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs font-medium"
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
                    <p className={`text-[10px] mt-1 font-semibold flex items-center gap-1 ${
                      confirmPassword === regForm.password ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {confirmPassword === regForm.password ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          Kata sandi cocok
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 text-rose-600" />
                          Konfirmasi kata sandi tidak cocok
                        </>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Komitmen Niat Driver */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 block mb-0.5">Komitmen &amp; Niat Ikhlas Belajar:</strong>
                  Bismillah, saya berniat ikhlas mengikuti bimbingan Al-Qur&apos;an di shelter, menjaga adab majelis ilmu, mematuhi arahan asatidz, serta berkomitmen hadir istiqamah saat jadwal mengaji.
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-800 hover:to-teal-900 shadow-lg shadow-emerald-800/25 active:scale-[0.99] transition-all disabled:opacity-60 text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mendaftarkan Akun Mitra Driver...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Daftar Sekarang Sebagai Mitra Ojol</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>

            {/* Switcher to Login */}
            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Sudah pernah mendaftar akun sebelumnya?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg(null);
                  }}
                  className="text-emerald-700 font-extrabold hover:text-emerald-800 hover:underline"
                >
                  Masuk ke akun driver di sini
                </button>
              </p>
            </div>
          </form>
        )}

        {/* TAB CONTENT: FORM LOGIN */}
        {activeTab === 'login' && (
          <div className="p-5 sm:p-7 space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* WhatsApp or Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor WhatsApp atau Alamat Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 085711223344 atau rian.gojek@gmail.com"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Masukkan nomor WhatsApp atau email yang terdaftar</p>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Kata Sandi (Password) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(true)}
                    className="text-[11px] text-emerald-700 font-bold hover:underline"
                  >
                    Lupa kata sandi?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi akun Anda"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs font-medium"
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

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600">Ingat sesi saya di perangkat ini</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-800 hover:to-teal-900 shadow-lg shadow-emerald-800/25 active:scale-[0.99] transition-all disabled:opacity-60 text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memeriksa Akun Driver...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Masuk ke Dashboard Driver</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>

              {/* Switcher to Register */}
              <div className="text-center pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Belum memiliki akun driver?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setErrorMsg(null);
                    }}
                    className="text-emerald-700 font-extrabold hover:text-emerald-800 hover:underline"
                  >
                    Daftar akun baru secara gratis
                  </button>
                </p>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Trust & Guarantee Badges Footer */}
      <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Kehadiran Terverifikasi GPS &amp; QR Shelter</span>
        </div>
        <span className="hidden sm:inline text-slate-300">•</span>
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Bimbingan Ustadz Bersanad &amp; Berpengalaman</span>
        </div>
        <span className="hidden sm:inline text-slate-300">•</span>
        <div className="flex items-center gap-2">
          <Bike className="w-4 h-4 text-emerald-600" />
          <span>Komunitas Positif &amp; Solidaritas Sesama Driver</span>
        </div>
      </div>

      {/* Interactive Modal: Bantuan & Lupa Kata Sandi */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Pusat Bantuan Akun Driver</h3>
                <p className="text-xs text-slate-500">Layanan pendampingan mitra Ojol Mengaji</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">Lupa Kata Sandi (Password)?</p>
                <p className="leading-relaxed">
                  Jika Anda lupa kata sandi akun, Anda dapat menghubungi <strong className="text-emerald-700">Koordinator Shelter</strong> atau admin pusat dengan mengirim pesan WhatsApp. Admin akan melakukan verifikasi nomor WhatsApp dan plat nomor kendaraan Anda.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">Apakah Pendaftaran Ini Berbayar?</p>
                <p className="leading-relaxed">
                  Tidak ada biaya apa pun (100% Gratis). Program ini diinisiasi untuk memfasilitasi rekan-rekan driver belajar mengaji di waktu luang tanpa membebani biaya.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <a
                href="https://wa.me/6281234567890?text=Assalamu'alaikum%20Admin%20Ojol%20Mengaji,%20saya%20butuh%20bantuan%20terkait%20akun%20driver"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition text-xs shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hubungi Admin WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="py-2.5 px-4 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
