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
  ChevronDown,
  ShieldCheck, 
  HelpCircle, 
  X, 
  MessageCircle, 
  Check, 
  Info,
  CreditCard,
  Search,
  Camera,
  Upload,
  Trash2,
  RotateCw,
  Printer,
  QrCode
} from 'lucide-react';
import { RegisterDriverData, PaymentAccountType, BANK_OPTIONS } from '@/types';
import { MemberCardModal } from './MemberCardModal';
import { compressImage } from '@/utils/imageUtils';
import { getMemberCode } from '@/utils/cardGenerator';

// Daftar opsi akun pencairan / insentif
const ACCOUNT_TYPE_OPTIONS: { id: PaymentAccountType; label: string; badge: string; icon: string; desc: string }[] = [
  { id: 'Bank', label: 'Akun Bank', badge: 'BSI, Mandiri, BCA, BRI, dll', icon: '🏦', desc: 'Transfer ke rekening bank' },
  { id: 'Gojek', label: 'Akun Gojek (GoPay)', badge: 'Gojek / GoPay', icon: '🟢', desc: 'Nomor HP akun Gojek' },
  { id: 'Ovo', label: 'Akun OVO', badge: 'E-Wallet OVO', icon: '🟣', desc: 'Nomor HP akun OVO' },
  { id: 'Dana', label: 'Akun DANA', badge: 'E-Wallet DANA', icon: '🔵', desc: 'Nomor HP akun DANA' },
];

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
  const [isAccountTypeDropdownOpen, setIsAccountTypeDropdownOpen] = useState(false);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [customBankInput, setCustomBankInput] = useState('');
  const [isShelterDropdownOpen, setIsShelterDropdownOpen] = useState(false);
  const [shelterSearch, setShelterSearch] = useState('');

  // Registration Form State
  const [regForm, setRegForm] = useState<RegisterDriverData>({
    name: '',
    phone: '',
    email: '',
    password: '',
    ojolPlatform: 'Gojek',
    nik: '',
    vehiclePlate: '',
    shelterId: shelters[0]?.id || '',
    currentLevel: 'Belum Dinilai',
    accountType: undefined,
    bankName: '',
    bankAccount: '',
    selfiePhoto: '',
  });

  // Selfie Camera & KTA Preview States
  const [showKtaPreviewModal, setShowKtaPreviewModal] = useState(false);
  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraMobileInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Handle opening live webcam or camera
  const startWebcam = async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Fallback to mobile input with capture="user"
        if (cameraMobileInputRef.current) {
          cameraMobileInputRef.current.click();
          return;
        }
        throw new Error('Kamera tidak didukung');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      setWebcamStream(stream);
      setShowWebcamModal(true);
    } catch (err: any) {
      console.warn('Webcam direct stream error, fallback to file/camera picker:', err);
      if (cameraMobileInputRef.current) {
        cameraMobileInputRef.current.click();
      } else if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
    }
    setShowWebcamModal(false);
  };

  React.useEffect(() => {
    if (showWebcamModal && videoRef.current && webcamStream) {
      videoRef.current.srcObject = webcamStream;
      videoRef.current.play().catch(e => console.warn(e));
    }
  }, [showWebcamModal, webcamStream]);

  const captureWebcamPhoto = async () => {
    if (!videoRef.current) return;
    try {
      setIsProcessingPhoto(true);
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 640;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror the image horizontally if front camera
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        const compressed = await compressImage(dataUrl, 480, 480, 0.82);
        setRegForm(prev => ({ ...prev, selfiePhoto: compressed }));
      }
      stopWebcam();
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal mengambil foto dari kamera. Silakan pilih dari galeri.');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Harap pilih file foto dengan format JPG, PNG, atau WEBP.');
      return;
    }

    try {
      setIsProcessingPhoto(true);
      const compressed = await compressImage(file, 480, 480, 0.82);
      setRegForm(prev => ({ ...prev, selfiePhoto: compressed }));
      setErrorMsg(null);
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal memproses gambar foto selfie. Harap gunakan foto lain.');
    } finally {
      setIsProcessingPhoto(false);
      e.target.value = '';
    }
  };

  // Pastikan shelterId selalu valid & tersinkronisasi saat shelters dimuat / bertambah dari Admin
  React.useEffect(() => {
    if (shelters.length > 0) {
      if (!regForm.shelterId || !shelters.some(s => s.id === regForm.shelterId)) {
        setRegForm(prev => ({
          ...prev,
          shelterId: shelters[0].id
        }));
      }
    }
  }, [shelters, regForm.shelterId]);
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
    const cleanNik = (regForm.nik || regForm.vehiclePlate || '').replace(/\D/g, '');
    if (!cleanNik) {
      setErrorMsg('NIK (Nomor Induk Kependudukan) wajib diisi sesuai KTP.');
      return;
    }
    if (cleanNik.length !== 16) {
      setErrorMsg('NIK harus terdiri dari 16 digit angka sesuai KTP.');
      return;
    }
    if (!regForm.shelterId) {
      setErrorMsg('Silakan pilih shelter pembinaan terdekat.');
      return;
    }
    if (regForm.accountType === 'Bank' && regForm.bankAccount && !regForm.bankName) {
      setErrorMsg('Harap pilih nama bank dari dropdown daftar bank untuk nomor rekening Anda.');
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
        // Alihkan ke tab login dan isi otomatis nomor telepon / email untuk mempermudah login
        setActiveTab('login');
        setLoginIdentifier(regForm.phone || regForm.email);
        setLoginPassword('');
        // Reset formulir pendaftaran
        setRegForm({
          name: '',
          phone: '',
          email: '',
          password: '',
          ojolPlatform: 'Gojek',
          nik: '',
          vehiclePlate: '',
          shelterId: shelters[0]?.id || '',
          currentLevel: 'Belum Dinilai',
          accountType: undefined,
          bankName: '',
          bankAccount: '',
          selfiePhoto: '',
        });
        setConfirmPassword('');
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
                <p className="mt-0.5 text-emerald-800 leading-relaxed">{successMsg}</p>
                {activeTab === 'login' && !isSubmitting && (
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Silakan masukkan kata sandi Anda di bawah ini untuk masuk ke dashboard driver.
                  </p>
                )}
                {isSubmitting && (
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Membuka dashboard akun driver Anda...
                  </p>
                )}
              </div>
              <button 
                type="button" 
                onClick={() => setSuccessMsg(null)}
                className="text-emerald-600 hover:text-emerald-800 transition p-0.5"
                title="Tutup pesan"
              >
                <X className="w-4 h-4" />
              </button>
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

            {/* Section 2: Upload Foto Selfie untuk Pembuatan Kartu Anggota (KTA) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                    Foto Selfie Mitra Driver
                  </h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    Untuk Kartu Anggota (KTA)
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 ml-auto">Langkah 2 dari 4</span>
              </div>

              {/* Informative description banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/90 text-xs text-slate-700 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5 flex-wrap">
                    <span>Foto Resmi untuk Pembuatan Kartu Anggota Ojol Mengaji</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Foto selfie wajah Anda akan dicetak secara otomatis pada <strong>Kartu Tanda Anggota (KTA) Digital &amp; Fisik</strong> resmi Ojol Mengaji yang didukung DPW DKI Jakarta.
                  </p>
                </div>
              </div>

              {/* Hidden File Inputs */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />
              <input
                type="file"
                ref={cameraMobileInputRef}
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={handleFileUpload}
              />

              {/* Upload Box / Photo Preview Container */}
              {!regForm.selfiePhoto ? (
                <div className="border-2 border-dashed border-emerald-300/80 hover:border-emerald-500 rounded-2xl p-5 bg-emerald-50/30 transition-all text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <Camera className="w-8 h-8 text-emerald-700" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                    Ambil Foto Selfie atau Unggah dari Galeri
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    Posisikan wajah tampak jelas dari depan, disarankan mengenakan jaket/atribut mitra ojol atau pakaian rapi &amp; sopan.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto">
                    <button
                      type="button"
                      onClick={startWebcam}
                      disabled={isProcessingPhoto}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm active:scale-95 transition"
                    >
                      <Camera className="w-4 h-4 text-emerald-200" />
                      <span>{isProcessingPhoto ? 'Memproses Foto...' : 'Ambil Foto Selfie (Kamera)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessingPhoto}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs active:scale-95 transition"
                    >
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span>Pilih dari Galeri / File</span>
                    </button>
                  </div>

                  {/* Checklist Guidelines */}
                  <div className="mt-4 pt-3 border-t border-emerald-200/60 flex flex-wrap items-center justify-center gap-3 text-[10px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1 text-emerald-800">
                      <Check className="w-3 h-3 text-emerald-600" /> Wajah tampak depan jelas
                    </span>
                    <span className="flex items-center gap-1 text-emerald-800">
                      <Check className="w-3 h-3 text-emerald-600" /> Atribut ojol / pakaian sopan
                    </span>
                    <span className="flex items-center gap-1 text-emerald-800">
                      <Check className="w-3 h-3 text-emerald-600" /> Tanpa masker / kacamata hitam
                    </span>
                  </div>
                </div>
              ) : (
                /* When Selfie Photo IS Uploaded */
                <div className="p-4 rounded-2xl border border-emerald-300 bg-emerald-50/50 space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <div className="w-20 h-24 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md ring-2 ring-emerald-400/30 bg-slate-800">
                          <img
                            src={regForm.selfiePhoto}
                            alt="Foto Selfie Driver"
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3" />
                        </span>
                      </div>

                      <div>
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 mb-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Foto Selfie Kartu Anggota Siap ✓</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {regForm.name || 'Foto Mitra Driver'}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Foto siap dipasang pada Kartu Tanda Anggota (KTA) Ojol Mengaji.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={startWebcam}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition shadow-2xs"
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Ganti Foto</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegForm(prev => ({ ...prev, selfiePhoto: '' }))}
                        className="p-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition"
                        title="Hapus foto selfie"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Member Card (KTA) Real-time Interactive Mini Preview Box */}
                  <div className="pt-3 border-t border-emerald-200/70">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Preview Tampilan Kartu Anggota (KTA)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowKtaPreviewModal(true)}
                        className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 hover:underline flex items-center gap-1"
                      >
                        <span>Perbesar Kartu</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Compact Card Visual */}
                    <div 
                      onClick={() => setShowKtaPreviewModal(true)}
                      className="cursor-pointer rounded-2xl p-3 text-white border border-emerald-700/50 shadow-md relative overflow-hidden transition hover:scale-[1.01]"
                      style={{
                        background: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%)',
                      }}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded bg-white p-0.5 flex items-center justify-center">
                            <img src="/logo-ojol-mengaji.png" alt="Logo" className="w-full h-full object-contain" />
                          </div>
                          <span className="text-[10px] font-black uppercase text-amber-300">
                            KARTU MEMBER • OJOL MENGAJI
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-amber-300 font-bold bg-black/40 px-2 py-0.5 rounded border border-amber-400/30">
                          {getMemberCode(
                            {
                              name: regForm.name,
                              ojolPlatform: regForm.ojolPlatform,
                              shelterId: regForm.shelterId,
                              joinedDate: new Date().toISOString().split('T')[0],
                            },
                            shelters.find(s => s.id === regForm.shelterId),
                            shelters
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 pt-2.5">
                        <div className="w-12 h-14 rounded-lg overflow-hidden border border-amber-300/60 bg-slate-900 shrink-0 shadow">
                          <img src={regForm.selfiePhoto} alt="Selfie" className="w-full h-full object-cover object-top" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-black uppercase text-white truncate">
                            {regForm.name || 'NAMA DRIVER'}
                          </div>
                          <div className="text-[9px] font-mono text-slate-300 truncate mt-0.5">
                            {regForm.nik ? `NIK: ${regForm.nik}` : 'NIK: 317XXXXXXXXXXXXX'}
                          </div>
                          <div className="text-[9px] text-emerald-300 truncate mt-0.5">
                            {shelters.find(s => s.id === regForm.shelterId)?.name || 'Shelter Binaan'}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-[9px] px-2.5 py-1 rounded-md bg-amber-400 text-slate-950 font-extrabold block shadow-xs">
                            Lihat &amp; Download KTA 📥
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Platform Ojol, Plat Nomor, & Shelter */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  Armada Ojol &amp; Shelter Pilihan
                </h3>
                <span className="text-[11px] text-slate-400 ml-auto">Langkah 3 dari 4</span>
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

              {/* NIK KTP & Shelter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    NIK (Nomor Induk Kependudukan) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={16}
                    required
                    placeholder="CONTOH: 3171012345670001"
                    value={regForm.nik || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                      setRegForm({ ...regForm, nik: val, vehiclePlate: val });
                    }}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs font-mono font-bold"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Sesuai NIK pada KTP (16 digit)</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Shelter Binaan Terdekat <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsShelterDropdownOpen(!isShelterDropdownOpen);
                        setIsBankDropdownOpen(false);
                      }}
                      className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border transition shadow-2xs font-semibold text-left flex items-center justify-between bg-white ${
                        isShelterDropdownOpen
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20 text-slate-900'
                          : 'border-slate-300 hover:border-slate-400 text-slate-800'
                      }`}
                    >
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="truncate pr-2">
                        {shelters.find(s => s.id === regForm.shelterId)?.name || 'Pilih Shelter'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isShelterDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                    </button>

                    {isShelterDropdownOpen && (
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setIsShelterDropdownOpen(false)} 
                      />
                    )}

                    {/* Menu Pilihan Shelter Selalu Membuka ke Bawah */}
                    {isShelterDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-72 overflow-hidden flex flex-col animate-fadeIn">
                        {/* Search Bar Shelter */}
                        <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Cari shelter (misal: Poltangan, Tebet)..."
                              value={shelterSearch}
                              onChange={(e) => setShelterSearch(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                            />
                          </div>
                        </div>

                        {/* List Shelter */}
                        <div className="overflow-y-auto divide-y divide-slate-100 py-1 flex-1">
                          {(() => {
                            const activeSheltersList = shelters.filter(s => s.isActive !== false);
                            const filtered = activeSheltersList.filter(s => 
                              s.name.toLowerCase().includes(shelterSearch.toLowerCase()) ||
                              s.address.toLowerCase().includes(shelterSearch.toLowerCase()) ||
                              (s.notes && s.notes.toLowerCase().includes(shelterSearch.toLowerCase()))
                            );

                            if (filtered.length === 0) {
                              return (
                                <div className="p-4 text-center text-xs text-slate-500">
                                  Shelter &quot;{shelterSearch}&quot; tidak ditemukan.
                                </div>
                              );
                            }

                            return filtered.map((s) => {
                              const isSelected = regForm.shelterId === s.id;
                              const isPoltanganOrNew = s.name.toLowerCase().includes('poltangan') || s.name.toLowerCase().includes('baru');
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => {
                                    setRegForm({ ...regForm, shelterId: s.id });
                                    setIsShelterDropdownOpen(false);
                                    setShelterSearch('');
                                  }}
                                  className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm transition-colors flex items-center justify-between ${
                                    isSelected
                                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                                      : 'text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="truncate pr-2">
                                    <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                                      <span>{s.name}</span>
                                      {isPoltanganOrNew && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300">
                                          Baru
                                        </span>
                                      )}
                                      <span className="text-[10px] text-slate-400 font-normal">
                                        (Radius {s.radiusMeters}m)
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{s.address}</div>
                                    {s.notes && (
                                      <div className="text-[10px] text-emerald-700 truncate">{s.notes}</div>
                                    )}
                                  </div>
                                  {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                                </button>
                              );
                            });
                          })()}
                        </div>

                        {/* Footer Info Realtime Sync */}
                        <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                          <span>{shelters.filter(s => s.isActive !== false).length} Shelter Aktif</span>
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Terkoneksi Admin Realtime
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Lokasi pangkalan presensi &amp; belajar</p>
                </div>
              </div>

              {/* Permintaan: "Nomor Akun Bank/Gojek/Ovo/Dana" (Dropdown) */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">Nomor Akun Bank / Gojek / OVO / DANA</span>
                    <p className="text-[10px] text-slate-500">Penyaluran insentif kafalah, bantuan kuota &amp; beasiswa mengaji mitra ojol</p>
                  </div>
                </div>

                {/* Dropdown 1: "Nomor Akun Bank/Gojek/Ovo/Dana" */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nomor Akun Bank/Gojek/Ovo/Dana <span className="text-slate-400 font-normal">(Opsional)</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountTypeDropdownOpen(!isAccountTypeDropdownOpen);
                        setIsBankDropdownOpen(false);
                        setIsShelterDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border transition shadow-2xs font-semibold text-left flex items-center justify-between bg-white ${
                        isAccountTypeDropdownOpen
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20 text-slate-900'
                          : 'border-slate-300 hover:border-slate-400 text-slate-800'
                      }`}
                    >
                      <span className={`truncate pr-2 ${regForm.accountType ? 'text-slate-900 font-bold' : 'text-slate-400 font-normal'}`}>
                        {regForm.accountType 
                          ? ACCOUNT_TYPE_OPTIONS.find(a => a.id === regForm.accountType)?.icon + ' ' + ACCOUNT_TYPE_OPTIONS.find(a => a.id === regForm.accountType)?.label
                          : '-- Pilih Akun Bank / Gojek / Ovo / Dana --'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isAccountTypeDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                    </button>

                    {isAccountTypeDropdownOpen && (
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setIsAccountTypeDropdownOpen(false)} 
                      />
                    )}

                    {isAccountTypeDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100 py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setRegForm({ ...regForm, accountType: undefined, bankName: '', bankAccount: '' });
                            setIsAccountTypeDropdownOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs text-slate-400 hover:bg-slate-50 transition-colors italic"
                        >
                          -- Kosongkan / Belum Memiliki --
                        </button>
                        {ACCOUNT_TYPE_OPTIONS.map((opt) => {
                          const isSelected = regForm.accountType === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setRegForm({ 
                                  ...regForm, 
                                  accountType: opt.id,
                                  bankName: opt.id === 'Bank' ? regForm.bankName : opt.id,
                                });
                                setIsAccountTypeDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm transition-colors flex items-center justify-between ${
                                isSelected
                                  ? 'bg-emerald-50 text-emerald-900 font-bold'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">{opt.icon}</span>
                                <div>
                                  <div className="font-bold text-slate-900">{opt.label}</div>
                                  <div className="text-[10px] text-slate-400">{opt.desc}</div>
                                </div>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Pilih jenis akun penerima pencairan atau insentif</p>
                </div>

                {/* Conditional: Kalau pilihnya akun bank, maka disusul dengan field baru yaitu dropdown "daftar bank" & nomor rekening */}
                {regForm.accountType === 'Bank' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/80 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Daftar Bank <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setIsBankDropdownOpen(!isBankDropdownOpen);
                            setIsAccountTypeDropdownOpen(false);
                            setIsShelterDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border transition shadow-2xs font-semibold text-left flex items-center justify-between bg-white ${
                            isBankDropdownOpen
                              ? 'border-emerald-600 ring-2 ring-emerald-500/20 text-slate-900'
                              : 'border-slate-300 hover:border-slate-400 text-slate-800'
                          }`}
                        >
                          <span className={`truncate pr-2 ${regForm.bankName ? 'text-slate-900 font-bold' : 'text-slate-400 font-normal'}`}>
                            {regForm.bankName || '-- Pilih dari Daftar Bank --'}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isBankDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                        </button>

                        {isBankDropdownOpen && (
                          <div 
                            className="fixed inset-0 z-30" 
                            onClick={() => setIsBankDropdownOpen(false)} 
                          />
                        )}

                        {isBankDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-64 overflow-hidden flex flex-col py-1 animate-fadeIn">
                            {/* Search Filter for Complete Bank List */}
                            <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
                              <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                <input
                                  type="text"
                                  placeholder="Cari nama bank (BSI, BCA, Mandiri, Jago, dll)..."
                                  value={bankSearch}
                                  onChange={(e) => setBankSearch(e.target.value)}
                                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                                  autoFocus
                                />
                              </div>
                            </div>

                            <div className="overflow-y-auto divide-y divide-slate-100 flex-1 max-h-52">
                              <button
                                type="button"
                                onClick={() => {
                                  setRegForm({ ...regForm, bankName: '' });
                                  setIsBankDropdownOpen(false);
                                  setBankSearch('');
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs text-slate-400 hover:bg-slate-50 transition-colors italic"
                              >
                                -- Pilih Nama Bank --
                              </button>
                              {BANK_OPTIONS
                                .filter((b) => b.toLowerCase().includes(bankSearch.toLowerCase()))
                                .map((bank) => {
                                  const isSelected = regForm.bankName === bank;
                                  return (
                                    <button
                                      key={bank}
                                      type="button"
                                      onClick={() => {
                                        setRegForm({ ...regForm, bankName: bank });
                                        setIsBankDropdownOpen(false);
                                        setBankSearch('');
                                      }}
                                      className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm transition-colors flex items-center justify-between ${
                                        isSelected
                                          ? 'bg-emerald-50 text-emerald-900 font-bold'
                                          : 'text-slate-700 hover:bg-slate-50'
                                      }`}
                                    >
                                      <span>{bank}</span>
                                      {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                                    </button>
                                  );
                                })}
                              {BANK_OPTIONS.filter((b) => b.toLowerCase().includes(bankSearch.toLowerCase())).length === 0 && (
                                <div className="p-4 text-center text-xs text-slate-500">
                                  Bank &quot;{bankSearch}&quot; tidak ditemukan. Anda dapat memilih opsi &quot;Bank Lainnya&quot;.
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {regForm.bankName === 'Bank Lainnya' && (
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder="Ketikkan nama bank Anda..."
                            value={customBankInput}
                            onChange={(e) => {
                              setCustomBankInput(e.target.value);
                              setRegForm(prev => ({ ...prev, bankName: e.target.value || 'Bank Lainnya' }));
                            }}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                          />
                        </div>
                      )}
                      <p className="text-[11px] text-slate-400 mt-1">Pilih bank dari daftar lengkap di atas untuk rekening Anda</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nomor Rekening Bank <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Contoh: 1234567890"
                          value={regForm.bankAccount || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9-]/g, '');
                            setRegForm({ ...regForm, bankAccount: val });
                          }}
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs font-mono font-bold"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Sesuai buku tabungan / m-banking aktif</p>
                    </div>
                  </div>
                )}

                {/* Conditional: Kalau pilihnya Gojek, Ovo, atau Dana */}
                {(regForm.accountType === 'Gojek' || regForm.accountType === 'Ovo' || regForm.accountType === 'Dana') && (
                  <div className="pt-2 border-t border-slate-200/80 animate-fadeIn">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Nomor Akun {regForm.accountType === 'Gojek' ? 'Gojek / GoPay' : regForm.accountType.toUpperCase()} <span className="text-rose-500">*</span>
                      </label>
                      {regForm.phone && (
                        <button
                          type="button"
                          onClick={() => setRegForm({ ...regForm, bankAccount: regForm.phone })}
                          className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition"
                        >
                          Gunakan No. WhatsApp ({regForm.phone})
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="Contoh: 081234567890"
                        value={regForm.bankAccount || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9-]/g, '');
                          setRegForm({ ...regForm, bankAccount: val });
                        }}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs font-mono font-bold"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Nomor ponsel yang terdaftar aktif pada aplikasi {regForm.accountType === 'Gojek' ? 'Gojek / GoPay' : regForm.accountType.toUpperCase()} Anda
                    </p>
                  </div>
                )}
              </div>

              {/* Informative Note: Kemampuan Mengaji Dinilai Ustadz */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Penilaian Kemampuan oleh Ustadz:</span> Anda tidak perlu khawatir menentukan tingkat membaca Al-Qur&apos;an saat mendaftar. Ustadz pembimbing di shelter akan melakukan talaqqi &amp; tes bacaan santai untuk menilai kemampuan mengaji Anda secara objektif.
                </div>
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
                  Jika Anda lupa kata sandi akun, Anda dapat menghubungi <strong className="text-emerald-700">Koordinator Shelter</strong> atau admin pusat dengan mengirim pesan WhatsApp. Admin akan melakukan verifikasi nomor WhatsApp dan NIK KTP Anda.
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
                href="https://wa.me/6281247475178?text=Assalamu'alaikum%20Admin%20Ojol%20Mengaji,%20saya%20butuh%20bantuan%20terkait%20akun%20driver"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition text-xs shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Call Center (0812-4747-5178)</span>
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

      {/* Interactive In-Browser Webcam Capture Modal */}
      {showWebcamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 relative text-center">
            <button
              type="button"
              onClick={stopWebcam}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Ambil Foto Selfie KTA</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Posisikan wajah Anda tepat di dalam bingkai oval di bawah ini, lalu klik tombol Ambil Foto.
            </p>

            {/* Video Viewport with Oval Selfie Frame Overlay */}
            <div className="relative w-full aspect-square max-w-[320px] mx-auto rounded-2xl overflow-hidden bg-slate-950 shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />

              {/* Oval Face Guide Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-44 h-56 border-2 border-dashed border-emerald-400 rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
              </div>

              <div className="absolute bottom-2.5 inset-x-0 text-center">
                <span className="text-[10px] font-semibold text-white/90 bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                  Pastikan Wajah Jelas &amp; Terang
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={stopWebcam}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={captureWebcamPhoto}
                disabled={isProcessingPhoto}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md shadow-emerald-700/30 active:scale-95 transition"
              >
                <Camera className="w-4 h-4 text-emerald-200" />
                <span>{isProcessingPhoto ? 'Memproses...' : 'Ambil Foto Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Card (KTA) Preview Modal during Registration */}
      <MemberCardModal
        isOpen={showKtaPreviewModal}
        onClose={() => setShowKtaPreviewModal(false)}
        participant={{
          name: regForm.name || 'Nama Driver Peserta',
          ojolPlatform: regForm.ojolPlatform,
          nik: regForm.nik || regForm.vehiclePlate || '317XXXXXXXXXXXXX',
          selfiePhoto: regForm.selfiePhoto,
          avatar: regForm.selfiePhoto,
        }}
        shelter={shelters.find(s => s.id === regForm.shelterId)}
        isRegistrationPreview={true}
      />
    </div>
  );
};
