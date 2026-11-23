'use client';

import React, { useState } from 'react';
import { useApp, normalizePhone } from '@/context/AppContext';
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
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { compressImage } from '@/utils/imageUtils';
import { getMemberCode } from '@/utils/cardGenerator';
import { BankSelector } from '@/components/common/BankSelector';
import { BankLogo } from '@/components/common/BankLogo';

// Daftar opsi akun pencairan / insentif
const ACCOUNT_TYPE_OPTIONS: { id: PaymentAccountType; label: string; badge: string; icon: string; desc: string }[] = [
  { id: 'Bank', label: 'Akun Bank', badge: 'BSI, Mandiri, BCA, BRI, dll', icon: '🏦', desc: 'Transfer ke rekening bank' },
  { id: 'Gojek', label: 'Akun Gojek (GoPay)', badge: 'Gojek / GoPay', icon: '🟢', desc: 'Nomor HP akun Gojek' },
  { id: 'Ovo', label: 'Akun OVO', badge: 'E-Wallet OVO', icon: '🟣', desc: 'Nomor HP akun OVO' },
  { id: 'Dana', label: 'Akun DANA', badge: 'E-Wallet DANA', icon: '🔵', desc: 'Nomor HP akun DANA' },
  { id: 'ShopeePay', label: 'ShopeePay', badge: 'E-Wallet Shopee', icon: '🟠', desc: 'Nomor HP akun ShopeePay' },
  { id: 'LinkAja', label: 'LinkAja', badge: 'E-Wallet LinkAja', icon: '🔴', desc: 'Nomor HP akun LinkAja' },
];

interface DriverAuthProps {
  onSuccess?: () => void;
}

export const DriverAuth: React.FC<DriverAuthProps> = ({ onSuccess }) => {
  const { shelters, users, registerDriver, loginDriver, setCurrentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [isShelterDropdownOpen, setIsShelterDropdownOpen] = useState(false);
  const [shelterSearch, setShelterSearch] = useState('');

  // Field-level error messages & validation error list
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [validationErrorList, setValidationErrorList] = useState<string[]>([]);

  // Registration Form State
  const [regForm, setRegForm] = useState<RegisterDriverData>({
    name: '',
    phone: '',
    address: '',
    email: '',
    password: '',
    ojolPlatform: 'Gojek',
    nik: '',
    vehiclePlate: '',
    shelterId: '', // Wajib dipilih manual oleh peserta, tidak otomatis pre-select
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

  // Verifikasi jika shelter yang dipilih sebelumnya masih ada di daftar shelters aktif
  React.useEffect(() => {
    if (shelters.length > 0 && regForm.shelterId) {
      if (!shelters.some(s => s.id === regForm.shelterId)) {
        setRegForm(prev => ({
          ...prev,
          shelterId: ''
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

    const errs: Record<string, string> = {};
    const errList: string[] = [];

    // 1. Nama Lengkap
    if (!regForm.name.trim()) {
      errs.name = 'Nama lengkap wajib diisi sesuai KTP atau aplikasi ojol Anda.';
      errList.push('Nama Lengkap: Wajib diisi');
    } else if (regForm.name.trim().length < 3) {
      errs.name = 'Nama lengkap minimal 3 karakter.';
      errList.push('Nama Lengkap: Minimal 3 karakter');
    }

    // 2. Nomor WhatsApp / HP Aktif
    const cleanPhone = normalizePhone(regForm.phone);
    if (!regForm.phone.trim()) {
      errs.phone = 'Nomor WhatsApp / HP aktif wajib diisi.';
      errList.push('Nomor WhatsApp / HP: Wajib diisi');
    } else if (cleanPhone.length < 9) {
      errs.phone = 'Nomor WhatsApp minimal 9 digit angka (contoh: 081234567890).';
      errList.push('Nomor WhatsApp: Minimal 9 digit angka aktif');
    }

    // 3. Alamat Tempat Tinggal / Domisili
    if (!regForm.address || !regForm.address.trim()) {
      errs.address = 'Alamat tempat tinggal / domisili wajib diisi.';
      errList.push('Alamat Tempat Tinggal: Wajib diisi');
    } else if (regForm.address.trim().length < 5) {
      errs.address = 'Alamat terlalu pendek, tuliskan alamat dengan lebih lengkap (minimal 5 karakter).';
      errList.push('Alamat Tempat Tinggal: Minimal 5 karakter');
    }

    // 4. NIK KTP (16 digit)
    const cleanNik = (regForm.nik || regForm.vehiclePlate || '').replace(/\D/g, '');
    if (!cleanNik) {
      errs.nik = 'NIK (Nomor Induk Kependudukan) wajib diisi 16 digit sesuai KTP.';
      errList.push('NIK KTP: Wajib diisi 16 digit angka');
    } else if (cleanNik.length !== 16) {
      errs.nik = `NIK harus terdiri dari 16 digit angka sesuai KTP (saat ini ${cleanNik.length} digit).`;
      errList.push(`NIK KTP: Harus tepat 16 digit angka (saat ini ${cleanNik.length}/16 digit)`);
    }

    // 5. Shelter Pilihan (Wajib dipilih terlebih dahulu)
    if (!regForm.shelterId || !regForm.shelterId.trim()) {
      errs.shelterId = 'Peringatan: Peserta yang daftar wajib memilih shelter terlebih dahulu. Pendaftaran tidak dapat dilanjutkan sebelum memilih lokasi shelter mengaji.';
      errList.push('Shelter Binaan: Wajib memilih shelter pembinaan mengaji terdekat terlebih dahulu');
    }

    // 6. Rekening Bank & Nomor Rekening (Jika salah satu diisi, wajib keduanya lengkap)
    if (regForm.bankName && !regForm.bankAccount?.trim()) {
      errs.bankAccount = 'Nomor rekening wajib diisi karena Anda telah memilih nama bank / e-wallet.';
      errList.push('Nomor Rekening: Wajib diisi');
    } else if (regForm.bankAccount?.trim() && !regForm.bankName) {
      errs.bankName = 'Nama bank wajib dipilih.';
      errList.push('Nama Bank: Wajib dipilih');
    }

    // 7. Kata Sandi
    if (!regForm.password) {
      errs.password = 'Kata sandi wajib diisi (minimal 4 karakter).';
      errList.push('Kata Sandi: Wajib diisi minimal 4 karakter');
    } else if (regForm.password.length < 4) {
      errs.password = 'Kata sandi minimal 4 karakter demi keamanan akun Anda.';
      errList.push('Kata Sandi: Terlalu pendek (minimal 4 karakter)');
    }

    // 7. Konfirmasi Kata Sandi
    if (!confirmPassword) {
      errs.confirmPassword = 'Ulangi kata sandi wajib diisi.';
      errList.push('Konfirmasi Kata Sandi: Wajib diisi ulang');
    } else if (regForm.password && regForm.password !== confirmPassword) {
      errs.confirmPassword = 'Konfirmasi kata sandi tidak cocok. Harap periksa kembali.';
      errList.push('Konfirmasi Kata Sandi: Tidak cocok dengan kata sandi di atas');
    }

    // 8. Komitmen Niat
    if (!agreeTerms) {
      errs.agreeTerms = 'Harap centang persetujuan niat dan komitmen belajar mengaji.';
      errList.push('Komitmen Belajar: Harap centang persetujuan ikhlas belajar mengaji');
    }

    // Jika formulir belum lengkap, tampilkan rincian peringatan & scroll ke field pertama
    if (errList.length > 0) {
      setFieldErrors(errs);
      setValidationErrorList(errList);
      setErrorMsg(`Formulir pendaftaran belum lengkap (${errList.length} data perlu dilengkapi). Harap periksa kolom yang bertanda merah di bawah.`);

      const firstKey = Object.keys(errs)[0];
      const targetElement = document.getElementById(`reg-field-${firstKey}`) || document.getElementById('reg-error-banner-top');
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const inputToFocus = targetElement.querySelector('input, select, button') as HTMLElement;
        if (inputToFocus && typeof inputToFocus.focus === 'function') {
          inputToFocus.focus();
        }
      }
      return;
    }

    setFieldErrors({});
    setValidationErrorList([]);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = registerDriver(regForm);
      setIsSubmitting(false);
      if (res.success) {
        // Setelah daftar, tidak langsung login, melainkan langsung beralih ke tab 'login' (Masuk Akun) di sebelahnya
        setActiveTab('login');
        setLoginIdentifier(regForm.phone);
        setLoginPassword('');
        setSuccessMsg(res.message);

        // Reset form pendaftaran
        setRegForm({
          name: '',
          phone: '',
          address: '',
          email: '',
          password: '',
          ojolPlatform: 'Gojek',
          nik: '',
          vehiclePlate: '',
          shelterId: '',
          currentLevel: 'Belum Dinilai',
          accountType: undefined,
          bankName: '',
          bankAccount: '',
          selfiePhoto: '',
        });
        setConfirmPassword('');

        // Scroll ke atas agar pengguna melihat pesan sukses dan formulir Masuk Akun
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        setErrorMsg(res.message);
        const banner = document.getElementById('reg-error-banner-top');
        if (banner) banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        if (res.user) {
          setCurrentUser(res.user);
        }
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
              <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm overflow-hidden" style={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px' }}>
                <img
                  src="/logo-ojol-mengaji.png"
                  alt="Logo Ojol Mengaji"
                  width={48}
                  height={48}
                  style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm overflow-hidden" style={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px' }}>
                <img
                  src="/logo-dpw.png"
                  alt="Logo Resmi Hidayatullah"
                  width={48}
                  height={48}
                  style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo-dpw.jpg';
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
                  Didukung DPW Hidayatullah DKI Jakarta
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
                setFieldErrors({});
                setValidationErrorList([]);
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
                setFieldErrors({});
                setValidationErrorList([]);
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
          {(errorMsg || validationErrorList.length > 0) && (
            <div 
              id="reg-error-banner-top"
              className="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 text-xs sm:text-sm space-y-2.5 animate-fadeIn shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 font-bold text-rose-900 text-sm sm:text-base">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>Peringatan: Formulir Pendaftaran Belum Lengkap!</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    setErrorMsg(null);
                    setValidationErrorList([]);
                  }}
                  className="text-rose-400 hover:text-rose-700 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {errorMsg && (
                <p className="text-xs sm:text-sm text-rose-800 leading-relaxed font-medium">
                  {errorMsg}
                </p>
              )}

              {validationErrorList.length > 0 && (
                <div className="bg-white/85 rounded-xl p-3 border border-rose-200 space-y-1.5 mt-2">
                  <p className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">
                    Rincian data yang wajib dilengkapi ({validationErrorList.length}):
                  </p>
                  <ul className="space-y-1 text-xs text-rose-800">
                    {validationErrorList.map((err, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold shrink-0">•</span>
                        <span>{err}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {errorMsg && errorMsg.includes('sudah terdaftar') && (
                <div className="pt-2 border-t border-rose-200">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setLoginIdentifier(regForm.phone || regForm.email || '');
                      setErrorMsg(null);
                      setValidationErrorList([]);
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Langsung Masuk ke Akun Anda di Sini →</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs sm:text-sm flex items-start gap-3 animate-fadeIn shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-emerald-900">Alhamdulillah Berhasil!</p>
                <p className="mt-0.5 text-emerald-800 leading-relaxed">{successMsg}</p>
                {isSubmitting ? (
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Mengalihkan ke dashboard akun driver Anda...
                  </p>
                ) : activeTab === 'login' ? (
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Silakan masukkan kata sandi Anda di bawah untuk masuk ke akun.
                  </p>
                ) : null}
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
          <form noValidate onSubmit={handleRegister} className="p-5 sm:p-7 space-y-6">
            {/* Section 1: Data Diri */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  Identitas Pribadi Driver
                </h3>
                <span className="text-[11px] text-slate-400 ml-auto">Langkah 1 dari 5</span>
              </div>

              {/* Nama Lengkap */}
              <div id="reg-field-name">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Lengkap Driver <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Contoh: Rian Hidayat"
                    value={regForm.name}
                    onChange={(e) => {
                      setRegForm({ ...regForm, name: e.target.value });
                      if (fieldErrors.name) {
                        setFieldErrors(prev => { const n = { ...prev }; delete n.name; return n; });
                      }
                    }}
                    className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white placeholder-slate-400 focus:outline-none transition shadow-2xs font-medium ${
                      fieldErrors.name 
                        ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20' 
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600'
                    }`}
                  />
                </div>
                {fieldErrors.name ? (
                  <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1 animate-fadeIn">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{fieldErrors.name}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3 text-slate-400 inline" />
                    Tuliskan nama lengkap sesuai KTP atau nama di aplikasi ojol Anda.
                  </p>
                )}
              </div>

              {/* No WhatsApp */}
              <div id="reg-field-phone">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor WhatsApp / HP Aktif <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    placeholder="Contoh: 081234567890"
                    value={regForm.phone}
                    onChange={(e) => {
                      setRegForm({ ...regForm, phone: e.target.value });
                      if (fieldErrors.phone) {
                        setFieldErrors(prev => { const n = { ...prev }; delete n.phone; return n; });
                      }
                    }}
                    className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white placeholder-slate-400 focus:outline-none transition shadow-2xs font-medium ${
                      fieldErrors.phone 
                        ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20' 
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600'
                    }`}
                  />
                </div>
                {fieldErrors.phone ? (
                  <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1 animate-fadeIn">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{fieldErrors.phone}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">Digunakan untuk masuk akun &amp; informasi jadwal</p>
                )}
              </div>

              {/* Alamat Tempat Tinggal / Domisili */}
              <div id="reg-field-address">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alamat Tempat Tinggal / Domisili <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Jl. Tebet Barat Dalam No. 12, RT 05 / RW 03, Jakarta Selatan"
                    value={regForm.address || ''}
                    onChange={(e) => {
                      setRegForm({ ...regForm, address: e.target.value });
                      if (fieldErrors.address) {
                        setFieldErrors(prev => { const n = { ...prev }; delete n.address; return n; });
                      }
                    }}
                    className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white placeholder-slate-400 focus:outline-none transition shadow-2xs font-medium resize-none ${
                      fieldErrors.address 
                        ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20' 
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600'
                    }`}
                  />
                </div>
                {fieldErrors.address ? (
                  <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1 animate-fadeIn">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{fieldErrors.address}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3 text-slate-400 inline" />
                    Alamat tempat tinggal / domisili saat ini untuk pemetaan shelter terdekat
                  </p>
                )}
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
                <span className="text-[11px] text-slate-400 ml-auto">Langkah 2 dari 5</span>
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
                          <div className="w-5 h-5 rounded bg-white p-0.5 flex items-center justify-center overflow-hidden" style={{ width: '20px', height: '20px', minWidth: '20px', minHeight: '20px' }}>
                            <img src="/logo-ojol-mengaji.png" alt="Logo" width={20} height={20} style={{ width: '100%', height: '100%', objectFit: 'contain' }} className="w-full h-full object-contain" />
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
                            {shelters.find(s => s.id === regForm.shelterId)?.name || 'Pilih Shelter Dahulu (Wajib)'}
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
                <span className="text-[11px] text-slate-400 ml-auto">Langkah 3 dari 5</span>
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
                <div id="reg-field-nik">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      NIK (Nomor Induk Kependudukan) <span className="text-rose-500">*</span>
                    </label>
                    <span className={`text-[10px] font-mono font-bold ${
                      (regForm.nik || '').length === 16 ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      {(regForm.nik || '').length}/16 digit
                    </span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={16}
                    placeholder="Contoh: 3171012345670001"
                    value={regForm.nik || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                      setRegForm({ ...regForm, nik: val, vehiclePlate: val });
                      if (fieldErrors.nik) {
                        setFieldErrors(prev => { const n = { ...prev }; delete n.nik; return n; });
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white placeholder-slate-400 focus:outline-none transition shadow-2xs font-mono font-bold ${
                      fieldErrors.nik
                        ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20'
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600'
                    }`}
                  />
                  {fieldErrors.nik ? (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1 animate-fadeIn">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{fieldErrors.nik}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1">Sesuai NIK pada KTP (16 digit angka)</p>
                  )}
                </div>

                <div id="reg-field-shelterId">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Shelter Binaan Terdekat <span className="text-rose-500">* (Wajib Pilih)</span>
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      Wajib Sebelum Daftar
                    </span>
                  </div>

                  {/* Notice Box Pengingat Shelter Wajib Dipilih */}
                  <div className={`p-3 rounded-xl mb-2 text-xs flex items-start gap-2.5 transition-all ${
                    fieldErrors.shelterId 
                      ? 'bg-rose-50 border-2 border-rose-300 text-rose-900 ring-2 ring-rose-200' 
                      : !regForm.shelterId 
                        ? 'bg-amber-50 border border-amber-300 text-amber-900' 
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  }`}>
                    {fieldErrors.shelterId ? (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    ) : !regForm.shelterId ? (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <div className="leading-relaxed">
                      <div className="font-bold flex items-center gap-1">
                        <span>Pemberitahuan Wajib Pilih Shelter:</span>
                      </div>
                      <p className="text-[11px] mt-0.5 opacity-90">
                        {regForm.shelterId ? (
                          <>Shelter binaan aktif terpilih: <strong>{shelters.find(s => s.id === regForm.shelterId)?.name}</strong>. Jadwal bimbingan &amp; presensi Anda akan mengacu pada shelter ini.</>
                        ) : (
                          <>Peserta yang mendaftar <strong>wajib memilih shelter terlebih dahulu</strong>. Pendaftaran tidak dapat dilanjutkan sebelum memilih lokasi shelter mengaji terdekat.</>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsShelterDropdownOpen(!isShelterDropdownOpen);
                      }}
                      className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border transition shadow-2xs font-semibold text-left flex items-center justify-between bg-white ${
                        fieldErrors.shelterId
                          ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20 text-slate-900'
                          : !regForm.shelterId
                            ? 'border-amber-400 bg-amber-50/20 text-slate-700 hover:border-amber-500'
                            : isShelterDropdownOpen
                              ? 'border-emerald-600 ring-2 ring-emerald-500/20 text-slate-900'
                              : 'border-slate-300 hover:border-slate-400 text-slate-800'
                      }`}
                    >
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className={`truncate pr-2 ${!regForm.shelterId ? 'text-amber-800 font-bold' : 'text-slate-900'}`}>
                        {shelters.find(s => s.id === regForm.shelterId)?.name || '-- Silakan Pilih Shelter Binaan Dahulu (Wajib) --'}
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
                                    if (fieldErrors.shelterId) {
                                      setFieldErrors(prev => { const n = { ...prev }; delete n.shelterId; return n; });
                                    }
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
                  {fieldErrors.shelterId ? (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1 animate-fadeIn">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{fieldErrors.shelterId}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1">Lokasi pangkalan presensi &amp; belajar</p>
                  )}
                </div>
              </div>

              {/* Informative Note: Kemampuan Mengaji Dinilai Ustadz */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Penilaian Kemampuan oleh Ustadz:</span> Anda tidak perlu khawatir menentukan tingkat membaca Al-Qur&apos;an saat mendaftar. Ustadz pembimbing di shelter akan melakukan talaqqi &amp; tes bacaan santai untuk menilai kemampuan mengaji Anda secara objektif.
                </div>
              </div>
            </div>

            {/* Section 4: Rekening Bank / Insentif Driver */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                    Rekening Bank &amp; Insentif Driver
                  </h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Lengkap dengan Logo Bank
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 ml-auto">Langkah 4 dari 5</span>
              </div>

              {/* Informative Note Rekening */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/90 text-xs text-slate-700 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <CreditCard className="w-4 h-4 text-emerald-200" />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5 flex-wrap">
                    <span>Penyaluran Insentif &amp; Bantuan Operasional Mitra Driver</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Digunakan untuk pencairan insentif kehadiran, bantuan dana operasional mengaji, atau santunan kebaikan dari program Ojol Mengaji. Silakan pilih <strong>rekening Bank</strong> (BSI, Mandiri, BCA, BRI, BNI, dll.) atau <strong>E-Wallet</strong> (GoPay, OVO, DANA, ShopeePay).
                  </p>
                </div>
              </div>

              {/* Quick Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Jenis Rekening Penyaluran
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ACCOUNT_TYPE_OPTIONS.slice(0, 4).map((typeOpt) => {
                    const isSelected = (regForm.accountType || 'Bank') === typeOpt.id;
                    return (
                      <button
                        key={typeOpt.id}
                        type="button"
                        onClick={() => {
                          setRegForm(prev => ({
                            ...prev,
                            accountType: typeOpt.id,
                            bankName: typeOpt.id === 'Bank' 
                              ? (prev.bankName || 'BSI (Bank Syariah Indonesia)') 
                              : (typeOpt.id === 'Gojek' ? 'Gojek (GoPay)' : typeOpt.label)
                          }));
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="text-base">{typeOpt.icon}</span>
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate">{typeOpt.label}</span>
                          <span className="text-[9px] text-slate-400 block truncate">{typeOpt.badge}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bank Selector with Logos & Account Number Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div id="reg-field-bankName">
                  <BankSelector
                    label="Nama Bank / E-Wallet Resmi"
                    value={regForm.bankName}
                    accountType={regForm.accountType}
                    onChange={(bankName, resolvedType) => {
                      setRegForm(prev => ({
                        ...prev,
                        bankName,
                        accountType: resolvedType || prev.accountType || 'Bank',
                      }));
                      if (fieldErrors.bankName) {
                        setFieldErrors(prev => { const n = { ...prev }; delete n.bankName; return n; });
                      }
                    }}
                    error={fieldErrors.bankName}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tersedia 50+ bank resmi (Syariah, BUMN, Swasta, Digital, BPD) &amp; E-Wallet
                  </p>
                </div>

                <div id="reg-field-bankAccount">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {(regForm.accountType || 'Bank') === 'Bank' 
                      ? 'Nomor Rekening Bank' 
                      : `Nomor Akun ${(regForm.accountType || 'E-Wallet') === 'Gojek' ? 'GoPay' : regForm.accountType}`}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder={(regForm.accountType || 'Bank') === 'Bank' ? 'Contoh: 7234567890' : 'Contoh: 081234567890'}
                      value={regForm.bankAccount || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9-]/g, '');
                        setRegForm(prev => ({ ...prev, bankAccount: val }));
                        if (fieldErrors.bankAccount) {
                          setFieldErrors(prev => { const n = { ...prev }; delete n.bankAccount; return n; });
                        }
                      }}
                      className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white placeholder-slate-400 focus:outline-none transition shadow-2xs font-mono font-bold ${
                        fieldErrors.bankAccount
                          ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20'
                          : 'border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600'
                      }`}
                    />
                  </div>
                  {fieldErrors.bankAccount ? (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1 animate-fadeIn">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{fieldErrors.bankAccount}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Hanya angka tanpa spasi. Rekening atas nama Anda sendiri.
                    </p>
                  )}
                </div>
              </div>

              {/* Realtime Bank & Account Preview Banner */}
              {regForm.bankName && regForm.bankAccount && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-2.5">
                    <BankLogo bankName={regForm.bankName} size="sm" />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {regForm.bankName}
                      </span>
                      <span className="font-mono text-emerald-800 font-bold text-[11px]">
                        No. Rekening: {regForm.bankAccount}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 shrink-0">
                    Siap Tersimpan ✓
                  </span>
                </div>
              )}
            </div>

            {/* Section 5: Buat Kata Sandi */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                  5
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  Keamanan Akun &amp; Kata Sandi
                </h3>
                <span className="text-[11px] text-slate-400 ml-auto">Langkah 5 dari 5</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div id="reg-field-password">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Buat Kata Sandi (Password) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimal 4 karakter"
                      value={regForm.password}
                      onChange={(e) => {
                        setRegForm({ ...regForm, password: e.target.value });
                        if (fieldErrors.password) {
                          setFieldErrors(prev => { const n = { ...prev }; delete n.password; return n; });
                        }
                      }}
                      className={`w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border bg-white placeholder-slate-400 focus:outline-none transition shadow-2xs font-medium ${
                        fieldErrors.password
                          ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20'
                          : 'border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1 animate-fadeIn">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{fieldErrors.password}</span>
                    </p>
                  )}

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

                <div id="reg-field-confirmPassword">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ulangi Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Ketik ulang kata sandi"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (fieldErrors.confirmPassword) {
                          setFieldErrors(prev => { const n = { ...prev }; delete n.confirmPassword; return n; });
                        }
                      }}
                      className={`w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border bg-white placeholder-slate-400 focus:outline-none transition shadow-2xs font-medium ${
                        fieldErrors.confirmPassword
                          ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20'
                          : 'border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1 animate-fadeIn">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{fieldErrors.confirmPassword}</span>
                    </p>
                  )}

                  {!fieldErrors.confirmPassword && confirmPassword && (
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
            <div id="reg-field-agreeTerms" className={`p-4 rounded-2xl border transition ${
              fieldErrors.agreeTerms 
                ? 'bg-rose-50/60 border-2 border-rose-300 ring-2 ring-rose-200' 
                : 'bg-emerald-50/70 border-emerald-200'
            }`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (fieldErrors.agreeTerms) {
                      setFieldErrors(prev => { const n = { ...prev }; delete n.agreeTerms; return n; });
                    }
                  }}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 block mb-0.5">Komitmen &amp; Niat Ikhlas Belajar:</strong>
                  Bismillah, saya berniat ikhlas mengikuti bimbingan Al-Qur&apos;an di shelter, menjaga adab majelis ilmu, mematuhi arahan asatidz, serta berkomitmen hadir istiqamah saat jadwal mengaji.
                </div>
              </label>
              {fieldErrors.agreeTerms && (
                <p className="text-[11px] text-rose-600 font-bold mt-2 flex items-center gap-1 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.agreeTerms}</span>
                </p>
              )}
            </div>

            {/* Peringatan / Notifikasi Tambahan Di Atas Tombol Daftar Jika Belum Lengkap */}
            {validationErrorList.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-xs text-rose-950 space-y-2.5 animate-fadeIn shadow-sm">
                <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>Peringatan: Ada {validationErrorList.length} Kolom Data Belum Lengkap!</span>
                </div>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  Mohon lengkapi isian bertanda merah di atas agar pendaftaran akun Anda dapat diproses:
                </p>
                <ul className="space-y-1 text-[11px] text-rose-800 list-disc list-inside bg-white/80 p-3 rounded-xl border border-rose-200">
                  {validationErrorList.map((err, idx) => (
                    <li key={idx} className="leading-tight">{err}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    const firstKey = Object.keys(fieldErrors)[0];
                    const el = document.getElementById(`reg-field-${firstKey}`) || document.getElementById('reg-error-banner-top');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      const inp = el.querySelector('input, select, button') as HTMLElement;
                      if (inp && typeof inp.focus === 'function') inp.focus();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-900 underline"
                >
                  <span>↑ Klik di sini untuk lompat ke kolom pertama yang perlu dilengkapi</span>
                </button>
              </div>
            )}

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
                    onClick={() => setShowForgotPasswordModal(true)}
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

      {/* Modal Lupa Password via Email OTP (SMTP) */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        defaultEmail={loginIdentifier.includes('@') ? loginIdentifier : ''}
        onSuccessReset={(resetEmail) => {
          setActiveTab('login');
          setLoginIdentifier(resetEmail);
          setSuccessMsg('Kata sandi berhasil diatur ulang! Silakan masuk menggunakan kata sandi baru Anda.');
        }}
      />
    </div>
  );
};
