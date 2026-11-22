'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp, normalizePhone } from '@/context/AppContext';
import { 
  Bike, 
  MapPin, 
  CheckCircle2, 
  BookOpen, 
  Award, 
  AlertCircle, 
  Calendar, 
  Navigation, 
  ChevronRight, 
  Sparkles, 
  TrendingUp,
  ShieldCheck,
  Send,
  UserCheck,
  LogOut,
  Search,
  Check,
  X,
  CreditCard,
  Camera,
  Upload,
  Printer,
  Download,
  Layers,
  Loader2,
  Share2,
  Clock,
  Info,
  Edit,
  User,
  Phone,
  Trash2
} from 'lucide-react';
import { MemberCardModal } from './MemberCardModal';
import { compressImage } from '@/utils/imageUtils';
import { downloadCardImage, getMemberCode } from '@/utils/cardGenerator';
import { BANK_OPTIONS, PaymentAccountType, Participant } from '@/types';

export const OjolPortal: React.FC = () => {
  const { 
    currentUser, 
    logout,
    participants, 
    shelters, 
    schedules, 
    attendance, 
    assessments, 
    announcements,
    recordAttendance,
    getParticipantAttendanceStats,
    updateParticipant,
    requestShelterTransfer,
    cancelShelterTransferRequest
  } = useApp();

  // Find participant profile corresponding strictly to current logged in driver.
  // Never falls back to Rian Hidayat if another driver is logged in!
  const participant: Participant = React.useMemo(() => {
    if (!currentUser) return participants[0];

    // 1. Match by userId
    let found = participants.find(p => p.userId === currentUser.id);
    if (found) return found;

    // 2. Match by normalized phone
    if (currentUser.phone) {
      const cleanPhone = normalizePhone(currentUser.phone);
      found = participants.find(p => p.phone && normalizePhone(p.phone) === cleanPhone);
      if (found) return found;
    }

    // 3. Match by email
    if (currentUser.email) {
      const cleanEmail = currentUser.email.trim().toLowerCase();
      found = participants.find(p => p.email && p.email.trim().toLowerCase() === cleanEmail);
      if (found) return found;
    }

    // 4. Match by exact name
    if (currentUser.name) {
      const cleanName = currentUser.name.trim().toLowerCase();
      found = participants.find(p => p.name && p.name.trim().toLowerCase() === cleanName);
      if (found) return found;
    }

    // 5. Fallback constructed from currentUser
    const defaultSh = shelters[0] || { id: 'shelter-1', name: 'Shelter Tebet Barat' };
    const avatarVal = currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name)}`;
    return {
      id: 'part-' + (currentUser.id.replace('user-ojol-', '') || Date.now()),
      userId: currentUser.id,
      name: currentUser.name,
      phone: currentUser.phone || '',
      email: currentUser.email || '',
      avatar: avatarVal,
      selfiePhoto: avatarVal,
      ojolPlatform: 'Gojek' as const,
      nik: currentUser.nik || '',
      vehiclePlate: currentUser.nik || '-',
      shelterId: defaultSh.id,
      currentLevel: 'Belum Dinilai' as const,
      joinedDate: new Date().toISOString().split('T')[0],
      isActive: true,
      memberNumber: participants.length + 1,
    };
  }, [currentUser, participants, shelters]);

  const shelter = shelters.find(s => s.id === participant.shelterId) || shelters[0];
  const participantSchedules = schedules.filter(s => s.shelterId === shelter.id);
  const memberCode = getMemberCode(participant, shelter, shelters);
  const pendingShelter = shelters.find(s => s.id === participant.pendingShelterId);

  // States
  const [activeTab, setActiveTab] = useState<'beranda' | 'presensi' | 'progres' | 'pengumuman' | 'profil'>('beranda');
  const [showChangeShelterModal, setShowChangeShelterModal] = useState(false);
  const [shelterModalSearch, setShelterModalSearch] = useState('');
  const [shelterTransferFeedback, setShelterTransferFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [showKtaModal, setShowKtaModal] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const portalFileInputRef = useRef<HTMLInputElement>(null);
  
  // Interactive GPS & Presensi State
  const [gpsSimulatedDistance] = useState<number>(18);
  const [isSimulatingGps, setIsSimulatingGps] = useState(false);
  const [presensiFeedback, setPresensiFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // KTA Download State & Feedback
  const [downloadingKta, setDownloadingKta] = useState<string | null>(null);
  const [ktaDownloadAlert, setKtaDownloadAlert] = useState<string | null>(null);

  // Edit Profile Modal States
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(participant.name);
  const [editPhone, setEditPhone] = useState(participant.phone);
  const [editPlatform, setEditPlatform] = useState(participant.ojolPlatform);
  const [editNik, setEditNik] = useState(participant.nik || participant.vehiclePlate || '');
  const [editPhoto, setEditPhoto] = useState(participant.selfiePhoto || participant.avatar || '');
  const [editAccountType, setEditAccountType] = useState<PaymentAccountType | undefined>(participant.accountType);
  const [editBankName, setEditBankName] = useState(participant.bankName || '');
  const [editBankAccount, setEditBankAccount] = useState(participant.bankAccount || '');
  const [editFeedback, setEditFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Sync edit form state when participant updates
  useEffect(() => {
    setEditName(participant.name);
    setEditPhone(participant.phone);
    setEditPlatform(participant.ojolPlatform);
    setEditNik(participant.nik || participant.vehiclePlate || '');
    setEditPhoto(participant.selfiePhoto || participant.avatar || '');
    setEditAccountType(participant.accountType);
    setEditBankName(participant.bankName || '');
    setEditBankAccount(participant.bankAccount || '');
  }, [participant]);

  const handleDownloadKtaDirect = async (side: 'front' | 'both' = 'front') => {
    try {
      setDownloadingKta(side);
      const sideName = side === 'front' ? 'Tampak Depan (HD)' : 'Lembar Lengkap (Depan & Belakang)';
      const fileName = await downloadCardImage(participant, shelter, side);
      setKtaDownloadAlert(`✓ Kartu Member Ojol Mengaji (${sideName}) berhasil diunduh: ${fileName}. Siap disimpan atau dicetak!`);
      setTimeout(() => setKtaDownloadAlert(null), 5000);
    } catch (err) {
      console.error(err);
      alert('Gagal mendownload kartu langsung. Membuka jendela pratinjau kartu...');
      setShowKtaModal(true);
    } finally {
      setDownloadingKta(null);
    }
  };

  const handlePhotoUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUpdatingPhoto(true);
      const compressed = await compressImage(file, 480, 480, 0.82);
      updateParticipant({
        ...participant,
        avatar: compressed,
        selfiePhoto: compressed,
      });
      setKtaDownloadAlert('✓ Foto selfie driver berhasil diperbarui dan tersinkronisasi ke Admin & Guru!');
      setTimeout(() => setKtaDownloadAlert(null), 4000);
    } catch (err) {
      console.error(err);
      alert('Gagal memproses foto baru.');
    } finally {
      setIsUpdatingPhoto(false);
      e.target.value = '';
    }
  };

  const handleSaveEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      alert('Nama lengkap tidak boleh kosong.');
      return;
    }
    setIsSavingProfile(true);

    const bestPhoto = editPhoto || participant.selfiePhoto || participant.avatar;
    const cleanNik = editNik.trim();

    updateParticipant({
      ...participant,
      name: editName.trim(),
      phone: editPhone.trim(),
      ojolPlatform: editPlatform,
      nik: cleanNik,
      vehiclePlate: cleanNik || participant.vehiclePlate,
      avatar: bestPhoto,
      selfiePhoto: bestPhoto,
      accountType: editAccountType,
      bankName: editAccountType === 'Bank' ? editBankName.trim() : (editAccountType || undefined),
      bankAccount: editBankAccount.trim() || undefined,
    });

    setIsSavingProfile(false);
    setShowEditProfileModal(false);
    setEditFeedback({
      success: true,
      message: 'Alhamdulillah! Profil driver berhasil diperbarui. Data langsung tersinkronisasi ke Admin & Guru.',
    });
    setTimeout(() => setEditFeedback(null), 6000);
  };

  // Filtered data for this participant
  const myAttendance = attendance.filter(a => a.participantId === participant.id);
  const myAssessments = assessments.filter(a => a.participantId === participant.id && a.isPublished);
  const latestAssessment = myAssessments[0];

  // Stats
  const { totalSessions, attendedSessions, rate } = getParticipantAttendanceStats(participant.id);

  // Handle GPS Check-in
  const handleGpsCheckIn = () => {
    setIsSimulatingGps(true);
    setPresensiFeedback(null);

    setTimeout(() => {
      setIsSimulatingGps(false);
      if (gpsSimulatedDistance <= shelter.radiusMeters) {
        const result = recordAttendance(
          participant.id, 
          shelter.id, 
          'gps', 
          'hadir', 
          gpsSimulatedDistance,
          `Presensi mandiri berhasil (GPS akurat, jarak ${gpsSimulatedDistance}m)`
        );
        setPresensiFeedback(result);
      } else {
        setPresensiFeedback({
          success: false,
          message: `Gagal: Posisi Anda (${gpsSimulatedDistance}m) di luar batas radius shelter (${shelter.radiusMeters}m). Harap mendekat ke shelter atau hubungi ustadz.`
        });
      }
    }, 900);
  };

  const renderRubricScore = (score: number, label: string) => {
    const colors = [
      '',
      'bg-rose-50 text-rose-700 border-rose-200',
      'bg-amber-50 text-amber-700 border-amber-200',
      'bg-blue-50 text-blue-700 border-blue-200',
      'bg-emerald-50 text-emerald-700 border-emerald-200'
    ];
    const textLevels = ['', 'Perlu Bimbingan', 'Mulai Berkembang', 'Baik', 'Sangat Baik'];

    return (
      <div className={`p-3 rounded-xl border ${colors[score] || 'bg-slate-50 border-slate-200'}`}>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-slate-700">{label}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white shadow-xs">
            {score}/4
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full ${score === 4 ? 'bg-emerald-500' : score === 3 ? 'bg-blue-500' : score === 2 ? 'bg-amber-500' : 'bg-rose-500'}`}
            style={{ width: `${(score / 4) * 100}%` }}
          />
        </div>
        <div className="mt-1 text-[11px] font-semibold">
          {textLevels[score]}
        </div>
      </div>
    );
  };

  const displayAvatar = participant.selfiePhoto || participant.avatar || currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
  const displayName = participant.name || currentUser?.name || 'Driver Ojol';

  return (
    <div className="max-w-md mx-auto sm:max-w-4xl pb-24">
      {/* Mobile Driver Profile Hero Card */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl mb-6 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-emerald-600/30 blur-xl pointer-events-none" />
        <div className="absolute right-6 top-6 text-emerald-400/20 pointer-events-none">
          <BookOpen className="w-24 h-24" />
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/60 shadow-md ring-4 ring-emerald-600/40"
            />
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs">
              {participant.ojolPlatform}
            </span>
          </div>

          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 mb-1">
              <Bike className="w-3 h-3 text-emerald-300" />
              <span>{participant.nik ? `NIK: ${participant.nik}` : participant.vehiclePlate}</span>
              <span className="text-emerald-400">•</span>
              <span>{participant.currentLevel === 'Belum Dinilai' ? 'Level: Menunggu Penilaian Guru' : participant.currentLevel}</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight">{displayName}</h1>
            <p className="text-xs sm:text-sm text-emerald-100 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">{shelter.name}</span>
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowKtaModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shadow-md transition active:scale-95"
              >
                <CreditCard className="w-3.5 h-3.5 text-slate-950" />
                <span>Buka Kartu Member</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadKtaDirect('front')}
                disabled={!!downloadingKta}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold transition active:scale-95 disabled:opacity-50"
                title="Download Kartu Member (PNG HD)"
              >
                {downloadingKta === 'front' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>Download Kartu Member</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditFeedback(null);
                  setShowEditProfileModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/70 hover:bg-emerald-600 border border-emerald-400/50 text-white text-xs font-bold transition active:scale-95"
                title="Edit Nama, Foto, &amp; Data Driver"
              >
                <Edit className="w-3.5 h-3.5 text-emerald-200" />
                <span>Edit Profil</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Highlights / Mini Stats */}
        <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-emerald-600/50">
          <div className="bg-emerald-900/50 backdrop-blur-xs rounded-xl p-2.5 text-center">
            <span className="text-[10px] uppercase font-semibold text-emerald-200">Kehadiran</span>
            <div className="text-lg sm:text-xl font-extrabold text-amber-300 mt-0.5">{rate}%</div>
            <span className="text-[10px] text-emerald-300">{attendedSessions}/{totalSessions} Sesi</span>
          </div>

          <div className="bg-emerald-900/50 backdrop-blur-xs rounded-xl p-2.5 text-center">
            <span className="text-[10px] uppercase font-semibold text-emerald-200">Capaian</span>
            <div className="text-xs sm:text-sm font-bold text-white mt-1 truncate">
              {latestAssessment ? latestAssessment.material.split(' ')[0] + ' ' + (latestAssessment.material.split(' ')[1] || '') : 'Iqro'}
            </div>
            <span className="text-[10px] text-emerald-300">Terverifikasi</span>
          </div>
        </div>
      </div>

      {/* Global KTA Download / Update Alert Banner */}
      {(ktaDownloadAlert || editFeedback) && (
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{ktaDownloadAlert || editFeedback?.message}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setKtaDownloadAlert(null);
              setEditFeedback(null);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-emerald-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile Nav Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-none border-b border-slate-200 sm:border-0">
        {[
          { id: 'beranda', label: 'Beranda' },
          { id: 'presensi', label: 'Presensi GPS' },
          { id: 'progres', label: 'Progres Al-Qur\'an' },
          { id: 'pengumuman', label: 'Pengumuman' },
          { id: 'profil', label: 'Profil Saya' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: BERANDA */}
      {activeTab === 'beranda' && (
        <div className="space-y-5">
          {/* Official KTA Digital Card Banner on Beranda */}
          <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 rounded-2xl p-4 sm:p-5 text-white border border-emerald-700/60 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-15 rounded-xl overflow-hidden border-2 border-amber-400 bg-slate-900 shrink-0 shadow-md ring-2 ring-emerald-500/40">
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-amber-400 text-amber-300 shadow-xs">
                      {memberCode}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Aktif Binaan
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white mt-1">
                    Kartu Tanda Anggota Ojol Mengaji
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {(() => {
                      const parts = memberCode.split('-');
                      if (parts.length === 4) {
                        return `No. Urut: ${parts[0]} • Kode Shelter: ${parts[1]} • Periode: ${parts[2]}/${parts[3]}`;
                      }
                      if (parts.length === 3) {
                        return `No. Urut: ${parts[0]} • Periode: ${parts[1]}/${parts[2]}`;
                      }
                      return `No. Anggota: ${memberCode}`;
                    })()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowKtaModal(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 transition shadow-sm active:scale-95"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Lihat Kartu</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadKtaDirect('front')}
                  disabled={!!downloadingKta}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition active:scale-95 disabled:opacity-50"
                  title="Unduh Kartu Tampak Depan (PNG HD)"
                >
                  {downloadingKta === 'front' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-emerald-300" />
                  )}
                  <span>Download Depan</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadKtaDirect('both')}
                  disabled={!!downloadingKta}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-sm active:scale-95 disabled:opacity-50"
                  title="Unduh Lembar Lengkap Depan & Belakang Siap Cetak"
                >
                  {downloadingKta === 'both' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Layers className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>Lembar Lengkap</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Quick Action: Presensi Button */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <Navigation className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Presensi Sesi Shelter Hari Ini</h2>
                  <p className="text-xs text-slate-500">Cek lokasi Anda dan catat kehadiran di shelter</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                Radius {shelter.radiusMeters}m
              </span>
            </div>

            {/* Alert Status Pengajuan Pindah Shelter */}
            {participant.shelterTransferStatus === 'pending' && (
              <div className="mb-4 p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-amber-950 block">Pengajuan Pindah Shelter Sedang Diverifikasi Admin</span>
                    <span className="text-amber-800 text-[11px]">
                      Anda mengajukan perpindahan ke <strong>{pendingShelter?.name || 'Shelter Tujuan'}</strong>. Menunggu persetujuan Admin Pusat.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    cancelShelterTransferRequest(participant.id);
                    setShelterTransferFeedback({ success: true, message: 'Pengajuan pindah shelter berhasil dibatalkan.' });
                  }}
                  className="px-3 py-1 rounded-xl text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 transition shrink-0 self-start sm:self-auto"
                >
                  Batalkan Pengajuan
                </button>
              </div>
            )}

            {shelterTransferFeedback && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-2 text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{shelterTransferFeedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShelterTransferFeedback(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-4 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Shelter Tujuan:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{shelter.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShelterModalSearch('');
                      setShowChangeShelterModal(true);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition text-left flex flex-col leading-tight ${
                      participant.shelterTransferStatus === 'pending'
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
                    }`}
                    title="Pindah ke shelter lain (perlu verifikasi Admin Pusat)"
                  >
                    <span className="flex items-center gap-1 font-extrabold">
                      {participant.shelterTransferStatus === 'pending' && <Clock className="w-3 h-3 text-amber-700" />}
                      <span>{participant.shelterTransferStatus === 'pending' ? 'Status Pindah' : 'Pindah Shelter'}</span>
                    </span>
                    <span className="text-[8px] font-normal opacity-85">
                      {participant.shelterTransferStatus === 'pending' ? '(Menunggu Verifikasi Admin)' : '(Perlu Verifikasi Admin)'}
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Perkiraan Jarak GPS:</span>
                <span className={`font-bold ${gpsSimulatedDistance <= shelter.radiusMeters ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {gpsSimulatedDistance} meter dari titik shelter ({gpsSimulatedDistance <= shelter.radiusMeters ? 'Valid' : 'Terlalu Jauh'})
                </span>
              </div>
            </div>

            {presensiFeedback && (
              <div className={`p-3.5 rounded-xl text-xs mb-4 flex items-start gap-2.5 ${
                presensiFeedback.success 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {presensiFeedback.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">{presensiFeedback.success ? 'Presensi Berhasil!' : 'Presensi Ditolak'}</div>
                  <div>{presensiFeedback.message}</div>
                </div>
              </div>
            )}

            <button
              onClick={handleGpsCheckIn}
              disabled={isSimulatingGps}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99] shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              {isSimulatingGps ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              <span>Presensi via GPS Sekarang</span>
            </button>
          </div>

          {/* Latest Assessment Card */}
          {latestAssessment && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-amber-100 text-amber-800">
                    <Award className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Catatan &amp; Evaluasi Ustadz Terakhir</h2>
                    <p className="text-xs text-slate-500">Materi: {latestAssessment.material}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                  {latestAssessment.assessmentDate}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3">
                {renderRubricScore(latestAssessment.scores.tajwid, 'Tajwid')}
                {renderRubricScore(latestAssessment.scores.makhraj, 'Makhraj')}
                {renderRubricScore(latestAssessment.scores.kelancaran, 'Kelancaran')}
              </div>

              <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/60 text-xs space-y-2 mt-3">
                <div>
                  <span className="font-bold text-amber-900 block">Kelebihan:</span>
                  <span className="text-slate-700">{latestAssessment.strengths}</span>
                </div>
                <div>
                  <span className="font-bold text-amber-900 block">Saran Latihan Mandiri:</span>
                  <span className="text-slate-700">{latestAssessment.recommendations}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('progres')}
                className="mt-3 w-full text-center text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1"
              >
                <span>Lihat Rubrik Lengkap 6 Aspek &amp; Riwayat</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PRESENSI GPS */}
      {activeTab === 'presensi' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Presensi Berbasis Shelter</h2>
            <p className="text-xs text-slate-500 mb-4">
              Sesuai aturan sistem, presensi hanya dapat dilakukan jika Anda berada di dalam radius resmi shelter binaan Anda.
            </p>

            {/* Shelter Info Box */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 mb-5 flex flex-col sm:flex-row items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-emerald-950">{shelter.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-bold">
                      Shelter Aktif Anda
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-0.5">{shelter.address}</p>
                  <div className="flex gap-4 mt-2 text-xs font-semibold text-emerald-900">
                    <span>Koordinat: {shelter.latitude}, {shelter.longitude}</span>
                    <span>Radius: {shelter.radiusMeters} meter</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShelterModalSearch('');
                  setShowChangeShelterModal(true);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 shadow-sm transition text-left flex flex-col items-start ${
                  participant.shelterTransferStatus === 'pending'
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
                title="Pindah ke shelter lain (perlu verifikasi Admin Pusat)"
              >
                <span className="flex items-center gap-1 font-bold">
                  {participant.shelterTransferStatus === 'pending' && <Clock className="w-3.5 h-3.5 text-amber-700" />}
                  <span>{participant.shelterTransferStatus === 'pending' ? 'Pengajuan Pindah' : 'Pindah Shelter'}</span>
                </span>
                <span className={`text-[9px] font-normal ${participant.shelterTransferStatus === 'pending' ? 'text-amber-800' : 'text-emerald-100'}`}>
                  {participant.shelterTransferStatus === 'pending' ? '(Menunggu Verifikasi Admin)' : '(Perlu Verifikasi Admin)'}
                </span>
              </button>
            </div>

            {/* GPS Simulation Console */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-900 text-white mb-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Sensor GPS Smartphone
                </span>
                <span className="font-mono text-emerald-400">STATUS: AKTIF</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center mb-4">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase">Jarak Anda ke Shelter</span>
                  <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                    {gpsSimulatedDistance} m
                  </div>
                  <span className="text-[10px] text-slate-300">
                    Batas Maks: {shelter.radiusMeters}m
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase">Kelayakan Lokasi</span>
                  <div className={`text-sm sm:text-base font-black mt-2 ${
                    gpsSimulatedDistance <= shelter.radiusMeters ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {gpsSimulatedDistance <= shelter.radiusMeters ? 'DALAM RADIUS ✓' : 'DI LUAR RADIUS ✕'}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {gpsSimulatedDistance <= shelter.radiusMeters ? 'Presensi Diizinkan' : 'Harap Mendekat'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleGpsCheckIn}
                disabled={isSimulatingGps}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                {isSimulatingGps ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>Konfirmasi Kehadiran Sekarang</span>
              </button>
            </div>

            {/* Riwayat Presensi Peserta */}
            <div>
              <h4 className="font-bold text-sm text-slate-800 mb-3">Riwayat Presensi Anda</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {myAttendance.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">Belum ada riwayat presensi.</div>
                ) : (
                  myAttendance.map(att => (
                    <div key={att.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          att.status === 'hadir' ? 'bg-emerald-100 text-emerald-700' :
                          att.status === 'terlambat' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {att.status === 'hadir' ? 'H' : att.status === 'terlambat' ? 'T' : 'I'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{att.sessionDate}</div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-1">
                            <span>Jam: {att.checkInTime}</span>
                            <span>•</span>
                            <span className="uppercase font-semibold text-emerald-700">{att.method}</span>
                            {att.distanceMeters && <span>({att.distanceMeters}m)</span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          att.status === 'hadir' ? 'bg-emerald-100 text-emerald-800' :
                          att.status === 'terlambat' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {att.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PROGRES AL-QUR'AN */}
      {activeTab === 'progres' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Perkembangan Membaca Al-Qur&apos;an</h2>
                <p className="text-xs text-slate-500">Evaluasi terverifikasi oleh Ustadz pembimbing sesuai rubrik standar</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                participant.currentLevel === 'Belum Dinilai'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}>
                {participant.currentLevel === 'Belum Dinilai' ? 'Menunggu Penilaian Ustadz' : participant.currentLevel}
              </span>
            </div>

            {myAssessments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-slate-700">Belum Ada Evaluasi Dipublikasikan</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Ustadz pembimbing akan mengisi rubrik penilaian saat sesi setoran mengaji berlangsung di shelter.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {myAssessments.map(evalItem => (
                  <div key={evalItem.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-emerald-700">Materi Evaluasi</span>
                        <h3 className="font-extrabold text-base text-slate-900">{evalItem.material}</h3>
                      </div>
                      <span className="text-xs font-medium text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        Tanggal: {evalItem.assessmentDate}
                      </span>
                    </div>

                    {/* 6 Rubric Aspects */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                      {renderRubricScore(evalItem.scores.hijaiyah, '1. Huruf Hijaiyah')}
                      {renderRubricScore(evalItem.scores.harakat, '2. Harakat & Sambung')}
                      {renderRubricScore(evalItem.scores.kelancaran, '3. Kelancaran Membaca')}
                      {renderRubricScore(evalItem.scores.tajwid, '4. Tajwid Dasar')}
                      {renderRubricScore(evalItem.scores.makhraj, '5. Makhraj & Pelafalan')}
                      {renderRubricScore(evalItem.scores.kemandirian, '6. Kemandirian')}
                    </div>

                    {/* Teacher Notes */}
                    <div className="space-y-2 text-xs bg-white p-4 rounded-xl border border-slate-200">
                      <div>
                        <span className="font-bold text-emerald-800">Kelebihan / Kemajuan:</span>
                        <p className="text-slate-700 mt-0.5">{evalItem.strengths}</p>
                      </div>
                      <div>
                        <span className="font-bold text-amber-800">Hal yang Perlu Diperbaiki:</span>
                        <p className="text-slate-700 mt-0.5">{evalItem.improvements}</p>
                      </div>
                      <div>
                        <span className="font-bold text-blue-800">Rekomendasi Latihan di Rumah/Shelter:</span>
                        <p className="text-slate-700 mt-0.5">{evalItem.recommendations}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PENGUMUMAN */}
      {activeTab === 'pengumuman' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Pengumuman &amp; Informasi Program</h2>
            <p className="text-xs text-slate-500 mb-4">Informasi resmi dari Admin Pusat dan Koordinator Shelter</p>

            <div className="space-y-4">
              {announcements.map(ann => (
                <div key={ann.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                      {ann.authorName}
                    </span>
                    <span className="text-[11px] text-slate-400">{ann.createdAt}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">{ann.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PROFIL SAYA */}
      {activeTab === 'profil' && (
        <div className="space-y-5">
          {/* Kartu Tanda Anggota (KTA) Digital Banner Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl border border-emerald-700/50 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <CreditCard className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span>Kartu Tanda Anggota (KTA) Resmi</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                      Digital
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Kartu identitas resmi bimbingan Al-Qur&apos;an Ojol Mengaji
                  </p>
                </div>
              </div>
            </div>

            {/* Driver Photo & KTA Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-emerald-700/50 relative z-10">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-14 h-16 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md bg-slate-800 shrink-0 ring-2 ring-emerald-500/40">
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                    Foto Selfie KTA Terverifikasi
                  </span>
                  <span className="text-xs font-bold text-white block">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-emerald-300">
                    {participant.ojolPlatform} • {shelter.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <input
                  type="file"
                  ref={portalFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpdate}
                />
                <button
                  type="button"
                  onClick={() => portalFileInputRef.current?.click()}
                  disabled={isUpdatingPhoto}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{isUpdatingPhoto ? 'Memproses...' : 'Ganti Foto'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadKtaDirect('front')}
                  disabled={!!downloadingKta}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition active:scale-95 disabled:opacity-50"
                  title="Unduh Kartu Sisi Depan (PNG HD)"
                >
                  {downloadingKta === 'front' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>Download PNG</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowKtaModal(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 transition shadow-md active:scale-95"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Buka &amp; Download KTA</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Profil Driver Peserta</h2>
              <button
                type="button"
                onClick={() => {
                  setEditFeedback(null);
                  setShowEditProfileModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition"
              >
                <Edit className="w-3.5 h-3.5 text-emerald-600" />
                <span>Edit Data Profil</span>
              </button>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Nama Lengkap</span>
                <span className="font-bold text-slate-800">{displayName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Mitra Ojek Online</span>
                <span className="font-bold text-emerald-700">{participant.ojolPlatform}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{participant.nik ? 'Nomor Induk Kependudukan (NIK)' : 'Nomor Plat Kendaraan'}</span>
                <span className="font-bold text-slate-800">{participant.nik || participant.vehiclePlate}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">No. WhatsApp / HP</span>
                <span className="font-bold text-slate-800">{participant.phone}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Shelter Binaan</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{shelter.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShelterModalSearch('');
                      setShowChangeShelterModal(true);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition text-left flex flex-col leading-tight ${
                      participant.shelterTransferStatus === 'pending'
                        ? 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    }`}
                    title="Pindah ke shelter lain (perlu verifikasi Admin Pusat)"
                  >
                    <span className="flex items-center gap-1 font-bold">
                      {participant.shelterTransferStatus === 'pending' && <Clock className="w-3 h-3 text-amber-700" />}
                      <span>{participant.shelterTransferStatus === 'pending' ? 'Status Pengajuan' : 'Pindah Shelter'}</span>
                    </span>
                    <span className="text-[8px] font-normal text-slate-500">
                      {participant.shelterTransferStatus === 'pending' ? '(Menunggu Verifikasi Admin)' : '(Perlu Verifikasi Admin)'}
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Level Pembelajaran</span>
                <span className={`font-bold ${participant.currentLevel === 'Belum Dinilai' ? 'text-amber-700' : 'text-emerald-800'}`}>
                  {participant.currentLevel === 'Belum Dinilai' ? 'Belum Dinilai (Menunggu Ustadz)' : participant.currentLevel}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Nomor Kartu Member</span>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {memberCode}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Tanggal Bergabung</span>
                <span className="font-bold text-slate-800">{participant.joinedDate}</span>
              </div>
              {participant.bankAccount && (
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Akun Penyaluran Insentif</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {participant.accountType === 'Bank' ? (participant.bankName || 'Bank') : (participant.accountType || participant.bankName || 'E-Wallet')} - {participant.bankAccount}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin keluar dari akun driver?')) {
                    logout();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun Driver</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PROFIL DRIVER */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-800 to-teal-800 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Edit className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Edit Profil &amp; Foto Driver</h3>
                  <p className="text-[11px] text-emerald-200">Sesuaikan nama, foto, dan data Anda. Terhubung ke Admin &amp; Guru.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEditProfile} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Foto Profil Preview & Ganti */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Foto Profil &amp; Kartu Anggota (KTA)
                </label>
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <div className="w-16 h-18 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md bg-slate-800 shrink-0">
                    <img
                      src={editPhoto || displayAvatar}
                      alt="Foto Driver"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <p className="text-[11px] text-slate-600">
                      Foto selfie tampak depan yang terpasang pada akun Anda dan Kartu Anggota (KTA).
                    </p>
                    <input
                      type="file"
                      ref={editFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressImage(file, 480, 480, 0.82);
                            setEditPhoto(compressed);
                          } catch (err) {
                            alert('Gagal memproses gambar foto.');
                          }
                        }
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 font-bold text-slate-700 shadow-2xs"
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pilih Foto Baru</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Driver <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nama lengkap sesuai KTP / aplikasi"
                    className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* No WhatsApp / HP */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor WhatsApp / HP Aktif <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Aplikasi Mitra Ojol */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Aplikasi Mitra Ojek Online
                </label>
                <select
                  value={editPlatform}
                  onChange={(e) => setEditPlatform(e.target.value as any)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="Gojek">Gojek</option>
                  <option value="Grab">Grab</option>
                  <option value="Maxim">Maxim</option>
                  <option value="InDrive">InDrive</option>
                  <option value="ShopeeFood">ShopeeFood</option>
                </select>
              </div>

              {/* NIK KTP / Plat Kendaraan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  NIK (16 Digit) / Nomor Plat Kendaraan
                </label>
                <input
                  type="text"
                  value={editNik}
                  onChange={(e) => setEditNik(e.target.value)}
                  placeholder="NIK KTP atau plat nomor motor"
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-medium"
                />
              </div>

              {/* Rekening Insentif (Opsional) */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Akun Penyaluran Insentif / Operasional (Opsional)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Tipe Rekening</label>
                    <select
                      value={editAccountType || ''}
                      onChange={(e) => setEditAccountType(e.target.value ? e.target.value as PaymentAccountType : undefined)}
                      className="w-full py-1.5 px-2 rounded-lg border border-slate-300 text-xs"
                    >
                      <option value="">-- Pilih Tipe --</option>
                      <option value="Bank">Transfer Bank</option>
                      <option value="Gojek">Gojek / GoPay</option>
                      <option value="Ovo">OVO</option>
                      <option value="Dana">DANA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Nama Bank / E-Wallet</label>
                    {editAccountType === 'Bank' ? (
                      <select
                        value={editBankName}
                        onChange={(e) => setEditBankName(e.target.value)}
                        className="w-full py-1.5 px-2 rounded-lg border border-slate-300 text-xs"
                      >
                        <option value="">Pilih Bank...</option>
                        {BANK_OPTIONS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        disabled
                        value={editAccountType || '-'}
                        className="w-full py-1.5 px-2 rounded-lg border border-slate-200 bg-slate-100 text-xs"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Nomor Rekening / Nomor HP E-Wallet</label>
                  <input
                    type="text"
                    value={editBankAccount}
                    onChange={(e) => setEditBankAccount(e.target.value)}
                    placeholder="Nomor rekening bank atau nomor HP akun e-wallet"
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingProfile ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pilih / Ganti Shelter Binaan */}
      {showChangeShelterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-800 to-teal-800 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Pengajuan Pindah Shelter Binaan</h3>
                  <p className="text-[11px] text-emerald-200">Perpindahan shelter wajib diverifikasi oleh Admin Pusat</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowChangeShelterModal(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification on admin verification policy */}
            <div className="p-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Ketentuan Pindah Shelter:</strong> Pilihan shelter baru akan diajukan ke Admin Pusat untuk diverifikasi &amp; disetujui terlebih dahulu sebelum aktif pada sistem presensi Anda.
              </p>
            </div>

            {/* Search Bar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ketik nama atau lokasi shelter (cth: Poltangan, Tebet)..."
                  value={shelterModalSearch}
                  onChange={(e) => setShelterModalSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                />
              </div>
            </div>

            {/* Shelters List */}
            <div className="overflow-y-auto divide-y divide-slate-100 p-2 flex-1 max-h-96">
              {(() => {
                const activeShelters = shelters.filter(s => s.isActive !== false);
                const filtered = activeShelters.filter(s =>
                  s.name.toLowerCase().includes(shelterModalSearch.toLowerCase()) ||
                  s.address.toLowerCase().includes(shelterModalSearch.toLowerCase()) ||
                  (s.notes && s.notes.toLowerCase().includes(shelterModalSearch.toLowerCase()))
                );

                if (filtered.length === 0) {
                  return (
                    <div className="p-6 text-center text-xs text-slate-500">
                      Shelter tidak ditemukan dengan kata kunci &quot;{shelterModalSearch}&quot;.
                    </div>
                  );
                }

                return filtered.map((sh) => {
                  const isCurrent = sh.id === participant.shelterId;
                  const isPending = sh.id === participant.pendingShelterId;

                  return (
                    <div
                      key={sh.id}
                      className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-colors ${
                        isCurrent ? 'bg-emerald-50/70 border border-emerald-300' : isPending ? 'bg-amber-50/70 border border-amber-300' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${isCurrent ? 'text-emerald-700' : isPending ? 'text-amber-700' : 'text-slate-400'}`} />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-xs text-slate-900">{sh.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900">
                                Shelter Aktif Anda
                              </span>
                            )}
                            {isPending && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-950 flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5 text-amber-800" />
                                Menunggu Verifikasi
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{sh.address}</p>
                          <span className="text-[10px] text-slate-400 font-medium">Radius presensi: {sh.radiusMeters} meter</span>
                        </div>
                      </div>

                      <div>
                        {isCurrent ? (
                          <span className="text-[10px] font-bold text-emerald-800 px-2.5 py-1 rounded-xl bg-emerald-100 block">
                            Aktif
                          </span>
                        ) : isPending ? (
                          <button
                            type="button"
                            onClick={() => {
                              cancelShelterTransferRequest(participant.id);
                              setShowChangeShelterModal(false);
                              setShelterTransferFeedback({ success: true, message: 'Pengajuan pindah shelter berhasil dibatalkan.' });
                            }}
                            className="px-2.5 py-1 rounded-xl text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 transition"
                          >
                            Batal
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const res = requestShelterTransfer(participant.id, sh.id, 'Permohonan perpindahan shelter oleh driver');
                              setShowChangeShelterModal(false);
                              setShelterTransferFeedback(res);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition active:scale-95 shadow-xs"
                          >
                            Pilih Pindah
                          </button>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* MODAL KARTU MEMBER (KTA) DIGITAL RESMI */}
      {showKtaModal && (
        <MemberCardModal
          isOpen={showKtaModal}
          participant={participant}
          shelter={shelter}
          onClose={() => setShowKtaModal(false)}
        />
      )}
    </div>
  );
};
