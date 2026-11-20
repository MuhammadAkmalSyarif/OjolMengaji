'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Shield, 
  Users, 
  MapPin, 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  BookOpen, 
  FileText, 
  Bell, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  AlertTriangle, 
  Check, 
  X,
  History,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Navigation,
  Loader2,
  Lock,
  Unlock,
  CreditCard,
  IdCard,
  FileSpreadsheet,
  Table
} from 'lucide-react';
import { Shelter, Teacher, Participant, Schedule, AttendanceStatus, RubricScores } from '@/types';
import { MemberCardModal } from '../ojol/MemberCardModal';

// Preset titik-titik shelter strategis untuk pengisian otomatis 1-klik
const PRESET_SHELTERS = [
  {
    name: 'Shelter Poltangan (baru)',
    address: 'Jl. Poltangan Raya No. 25, Tanjung Barat, Jagakarsa, Jakarta Selatan',
    lat: -6.2995,
    lng: 106.8458,
    radius: 75,
    notes: 'Pangkalan binaan ojol Poltangan dekat Stasiun Tanjung Barat & koridor TB Simatupang.'
  },
  {
    name: 'Shelter Stasiun Tebet Barat',
    address: 'Jl. Tebet Raya No. 45, Tebet Timur, Jakarta Selatan',
    lat: -6.2268,
    lng: 106.8582,
    radius: 75,
    notes: 'Dekat pangkalan ojol Pintu Barat Stasiun Tebet. Kapasitas 25 orang.'
  },
  {
    name: 'Shelter Blok M Square Sentral',
    address: 'Jl. Melawai Raya, Area Parkir Belakang Blok M Square, Jakarta Selatan',
    lat: -6.2435,
    lng: 106.7981,
    radius: 60,
    notes: 'Pojok gazebo musholla sentral Blok M. Ruangan nyaman dan tenang.'
  },
  {
    name: 'Shelter Stasiun Palmerah',
    address: 'Jl. Palmerah Barat No. 12, Gelora, Jakarta Pusat',
    lat: -6.2081,
    lng: 106.7972,
    radius: 80,
    notes: 'Depan Pasar Palmerah dan dekat JPO halte TransJakarta.'
  },
  {
    name: 'Shelter Harmoni Hayam Wuruk',
    address: 'Jl. Hayam Wuruk No. 88, Gambir, Jakarta Pusat',
    lat: -6.1664,
    lng: 106.8197,
    radius: 50,
    notes: 'Dekat area istirahat driver transit Harmoni.'
  },
  {
    name: 'Shelter Stasiun Manggarai',
    address: 'Pintu Barat Stasiun Manggarai, Jl. Manggarai Utara 1, Tebet, Jakarta Selatan',
    lat: -6.2100,
    lng: 106.8503,
    radius: 75,
    notes: 'Pangkalan transit driver ojol Manggarai dekat musholla.'
  },
  {
    name: 'Shelter Stasiun Tanah Abang',
    address: 'Jl. Jatibaru Raya No. 1, Kampung Bali, Tanah Abang, Jakarta Pusat',
    lat: -6.1856,
    lng: 106.8111,
    radius: 75,
    notes: 'Titik kumpul driver dekat JPO Stasiun Tanah Abang.'
  },
  {
    name: 'Shelter Stasiun Pasar Senen',
    address: 'Jl. Pasar Senen No. 14, Senen, Jakarta Pusat',
    lat: -6.1747,
    lng: 106.8444,
    radius: 75,
    notes: 'Pangkalan barat Stasiun Senen area parkir ojol.'
  },
  {
    name: 'Shelter Stasiun Juanda',
    address: 'Jl. Ir. H. Juanda No. 1, Kebon Kelapa, Gambir, Jakarta Pusat',
    lat: -6.1668,
    lng: 106.8315,
    radius: 65,
    notes: 'Pangkalan ojol dekat pintu keluar halte Juanda.'
  },
  {
    name: 'Shelter Terminal Kampung Rambutan',
    address: 'Jl. Lingkar Luar Selatan, Ciracas, Jakarta Timur',
    lat: -6.3115,
    lng: 106.8824,
    radius: 80,
    notes: 'Gazebo musholla istirahat driver transit luar kota.'
  },
  {
    name: 'Shelter Stasiun Jatinegara',
    address: 'Jl. Bekasi Barat No. 1, Jatinegara, Jakarta Timur',
    lat: -6.2151,
    lng: 106.8681,
    radius: 75,
    notes: 'Dekat area pangkalan sepeda motor Stasiun Jatinegara.'
  }
];

export const AdminPortal: React.FC = () => {
  const { 
    shelters, 
    teachers, 
    participants, 
    schedules, 
    attendance, 
    assessments, 
    announcements, 
    auditLogs,
    addShelter,
    updateShelter,
    deleteShelter,
    addTeacher,
    updateTeacher,
    addParticipant,
    updateParticipant,
    addSchedule,
    deleteSchedule,
    correctAttendance,
    createAnnouncement,
    deleteAnnouncement,
    getParticipantAttendanceStats
  } = useApp();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'shelter' | 'guru' | 'peserta' | 'jadwal' | 'presensi' | 'evaluasi' | 'pengumuman' | 'laporan' | 'audit'
  >('dashboard');

  // Search & Filter
  const [searchFilter, setSearchFilter] = useState('');
  const [shelterFilter, setShelterFilter] = useState('all');

  // Modals state
  const [showShelterModal, setShowShelterModal] = useState(false);
  const [editingShelter, setEditingShelter] = useState<Shelter | null>(null);
  const [shelterName, setShelterName] = useState('');
  const [shelterAddress, setShelterAddress] = useState('');
  const [shelterLat, setShelterLat] = useState<number>(-6.2268);
  const [shelterLng, setShelterLng] = useState<number>(106.8582);
  const [shelterRadius, setShelterRadius] = useState<number>(75);
  const [shelterNotes, setShelterNotes] = useState('');

  // Auto Geofencing & GPS Detection State (Bukan Manual)
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsAutoStatus, setGpsAutoStatus] = useState<string>('');
  const [allowManualCoordEdit, setAllowManualCoordEdit] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // Teacher Modal
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherSpec, setTeacherSpec] = useState('');
  const [teacherNik, setTeacherNik] = useState('');
  const [teacherBankName, setTeacherBankName] = useState('');
  const [teacherBankAccount, setTeacherBankAccount] = useState('');
  const [teacherSelectedShelters, setTeacherSelectedShelters] = useState<string[]>([]);

  // Teacher Shelter Assignment Modal
  const [showAssignShelterModal, setShowAssignShelterModal] = useState(false);
  const [assigningTeacher, setAssigningTeacher] = useState<Teacher | null>(null);
  const [selectedSheltersForAssign, setSelectedSheltersForAssign] = useState<string[]>([]);

  // Participant Modal & KTA Preview
  const [selectedKtaParticipant, setSelectedKtaParticipant] = useState<Participant | null>(null);
  const [showPartModal, setShowPartModal] = useState(false);
  const [partName, setPartName] = useState('');
  const [partEmail, setPartEmail] = useState('');
  const [partPhone, setPartPhone] = useState('');
  const [partPlatform, setPartPlatform] = useState<'Gojek' | 'Grab' | 'Maxim' | 'InDrive' | 'ShopeeFood'>('Gojek');
  const [partPlate, setPartPlate] = useState('');
  const [partShelterId, setPartShelterId] = useState<string>(shelters[0]?.id || '');
  const [partLevel, setPartLevel] = useState<'Iqro 1-3' | 'Iqro 4-6' | 'Al-Qur\'an Dasar' | 'Al-Qur\'an Mahir / Tajwid'>('Al-Qur\'an Dasar');
  const [partBankName, setPartBankName] = useState('');
  const [partBankAccount, setPartBankAccount] = useState('');

  // Announcement Modal
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annTargetRole, setAnnTargetRole] = useState<'all' | 'guru' | 'ojol' | 'shelter'>('all');
  const [annShelterId, setAnnShelterId] = useState<string>('');

  // Attendance Correction Modal
  const [correctingRecordId, setCorrectingRecordId] = useState<string | null>(null);
  const [correctNewStatus, setCorrectNewStatus] = useState<AttendanceStatus>('hadir');
  const [correctReason, setCorrectReason] = useState('');

  // Export CSV Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportReportType, setExportReportType] = useState<'rekap' | 'presensi' | 'evaluasi'>('rekap');
  const [exportDelimiter, setExportDelimiter] = useState<';' | ','>(';');
  const [exportScope, setExportScope] = useState<'all' | 'filtered'>('all');

  // Calculation Metrics
  const activeParticipants = participants.filter(p => p.isActive);
  const activeTeachers = teachers.filter(t => t.isActive);
  const activeShelters = shelters.filter(s => s.isActive);
  
  // Risk participants (attendance < 75%)
  const riskParticipants = participants.filter(p => {
    const { rate } = getParticipantAttendanceStats(p.id);
    return rate < 75;
  });

  // Level Distribution
  const levelCounts = {
    'Belum Dinilai': participants.filter(p => p.currentLevel === 'Belum Dinilai').length,
    'Iqro 1-3': participants.filter(p => p.currentLevel === 'Iqro 1-3').length,
    'Iqro 4-6': participants.filter(p => p.currentLevel === 'Iqro 4-6').length,
    'Al-Qur\'an Dasar': participants.filter(p => p.currentLevel === 'Al-Qur\'an Dasar').length,
    'Al-Qur\'an Mahir / Tajwid': participants.filter(p => p.currentLevel === 'Al-Qur\'an Mahir / Tajwid').length,
  };

  // Auto-detect GPS location (Latitude & Longitude) dan Radius terisi otomatis
  const detectGpsLocation = (defaultRadius = 75) => {
    setIsDetectingGps(true);
    setGpsAutoStatus('Mendeteksi koordinat GPS otomatis...');

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          setShelterLat(lat);
          setShelterLng(lng);
          setShelterRadius(defaultRadius);
          setIsDetectingGps(false);
          setGpsAutoStatus(`✓ Koordinat GPS berhasil terisi otomatis: ${lat}, ${lng} (Akurasi: ±${Math.round(pos.coords.accuracy)}m)`);
        },
        (err) => {
          console.warn('Geolocation warning / permission:', err);
          // Standard center Jakarta fallback
          setShelterLat(-6.2268);
          setShelterLng(106.8582);
          setShelterRadius(defaultRadius);
          setIsDetectingGps(false);
          setGpsAutoStatus('Izin GPS belum aktif / sensor tidak terdeteksi. Koordinat terisi otomatis standar Jakarta (-6.2268, 106.8582).');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
    } else {
      setShelterLat(-6.2268);
      setShelterLng(106.8582);
      setShelterRadius(defaultRadius);
      setIsDetectingGps(false);
      setGpsAutoStatus('Geolokasi browser tidak tersedia. Koordinat disetel otomatis ke standar Jakarta.');
    }
  };

  // Ambil koordinat otomatis dari Nama/Alamat Shelter
  const handleAutoGeocodeFromAddress = async () => {
    const query = shelterAddress || shelterName;
    if (!query.trim()) {
      alert('Silakan ketik Nama Shelter atau Alamat terlebih dahulu untuk mengambil koordinat otomatis.');
      return;
    }

    setIsSearchingAddress(true);
    setGpsAutoStatus('Mencari koordinat otomatis berdasarkan alamat...');

    const lowerQuery = query.toLowerCase();
    const matchedPreset = PRESET_SHELTERS.find(p => 
      lowerQuery.includes(p.name.toLowerCase().replace('shelter ', '')) ||
      p.name.toLowerCase().includes(lowerQuery) ||
      p.address.toLowerCase().includes(lowerQuery)
    );

    if (matchedPreset) {
      setShelterLat(matchedPreset.lat);
      setShelterLng(matchedPreset.lng);
      setShelterRadius(matchedPreset.radius);
      if (!shelterAddress) setShelterAddress(matchedPreset.address);
      setIsSearchingAddress(false);
      setGpsAutoStatus(`✓ Koordinat & Radius terisi otomatis dari referensi (${matchedPreset.lat}, ${matchedPreset.lng})!`);
      return;
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' Indonesia')}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const foundLat = Number(parseFloat(data[0].lat).toFixed(6));
        const foundLng = Number(parseFloat(data[0].lon).toFixed(6));
        setShelterLat(foundLat);
        setShelterLng(foundLng);
        setShelterRadius(75);
        setGpsAutoStatus(`✓ Koordinat berhasil terisi otomatis dari peta: ${foundLat}, ${foundLng}`);
      } else {
        setGpsAutoStatus('Alamat tidak ditemukan di geocoder peta. Koordinat saat ini dipertahankan.');
      }
    } catch {
      setGpsAutoStatus('Layanan geocoding peta sedang sibuk. Gunakan tombol Deteksi GPS atau pilih preset.');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // Open Shelter Modal for Create
  const handleOpenCreateShelter = () => {
    setEditingShelter(null);
    setShelterName('');
    setShelterAddress('');
    setShelterNotes('');
    setShelterRadius(75); // Otomatis terisi default radius 75 meter
    setAllowManualCoordEdit(false);
    setShowShelterModal(true);
    // Pemicu otomatis deteksi GPS
    detectGpsLocation(75);
  };

  // Open Shelter Modal for Edit
  const handleOpenEditShelter = (s: Shelter) => {
    setEditingShelter(s);
    setShelterName(s.name);
    setShelterAddress(s.address);
    setShelterLat(s.latitude);
    setShelterLng(s.longitude);
    setShelterRadius(s.radiusMeters || 75);
    setShelterNotes(s.notes || '');
    setAllowManualCoordEdit(false);
    setGpsAutoStatus(`Koordinat tersimpan: ${s.latitude}, ${s.longitude} • Radius: ${s.radiusMeters}m`);
    setShowShelterModal(true);
  };

  // Save Shelter
  const handleSaveShelter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shelterName || !shelterAddress) return;

    if (editingShelter) {
      updateShelter({
        ...editingShelter,
        name: shelterName,
        address: shelterAddress,
        latitude: Number(shelterLat),
        longitude: Number(shelterLng),
        radiusMeters: Number(shelterRadius),
        notes: shelterNotes,
      });
    } else {
      addShelter({
        name: shelterName,
        address: shelterAddress,
        latitude: Number(shelterLat),
        longitude: Number(shelterLng),
        radiusMeters: Number(shelterRadius),
        isActive: true,
        notes: shelterNotes,
      });
    }

    setShowShelterModal(false);
  };

  // Open Teacher Modal for Create
  const handleOpenCreateTeacher = () => {
    setEditingTeacher(null);
    setTeacherName('');
    setTeacherEmail('');
    setTeacherPhone('');
    setTeacherSpec('');
    setTeacherNik('');
    setTeacherBankName('BSI (Bank Syariah Indonesia)');
    setTeacherBankAccount('');
    setTeacherSelectedShelters([]);
    setShowTeacherModal(true);
  };

  // Open Teacher Modal for Edit
  const handleOpenEditTeacher = (t: Teacher) => {
    setEditingTeacher(t);
    setTeacherName(t.name);
    setTeacherEmail(t.email);
    setTeacherPhone(t.phone);
    setTeacherSpec(t.specialization || '');
    setTeacherNik(t.nik || '');
    setTeacherBankName(t.bankName || 'BSI (Bank Syariah Indonesia)');
    setTeacherBankAccount(t.bankAccount || '');
    setTeacherSelectedShelters(t.shelterIds || []);
    setShowTeacherModal(true);
  };

  // Save Teacher
  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName || (!editingTeacher && !teacherEmail)) return;

    if (editingTeacher) {
      updateTeacher({
        ...editingTeacher,
        name: teacherName,
        phone: teacherPhone || '0812-0000-0000',
        specialization: teacherSpec || 'Tahsin & Bimbingan Mengaji',
        nik: teacherNik.trim() || undefined,
        bankName: teacherBankName.trim() || undefined,
        bankAccount: teacherBankAccount.trim() || undefined,
        shelterIds: teacherSelectedShelters.length > 0 ? teacherSelectedShelters : editingTeacher.shelterIds,
      });
    } else {
      addTeacher({
        name: teacherName,
        phone: teacherPhone || '0812-0000-0000',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        specialization: teacherSpec || 'Tahsin & Bimbingan Mengaji',
        nik: teacherNik.trim() || undefined,
        bankName: teacherBankName.trim() || undefined,
        bankAccount: teacherBankAccount.trim() || undefined,
        shelterIds: teacherSelectedShelters.length > 0 ? teacherSelectedShelters : [shelters[0]?.id || ''],
        isActive: true,
      }, teacherEmail);
    }

    setShowTeacherModal(false);
    setEditingTeacher(null);
    setTeacherName('');
    setTeacherEmail('');
    setTeacherPhone('');
    setTeacherSpec('');
    setTeacherNik('');
    setTeacherBankName('');
    setTeacherBankAccount('');
    setTeacherSelectedShelters([]);
  };

  // Open Shelter Assignment Modal for Teacher
  const handleOpenAssignShelters = (t: Teacher) => {
    setAssigningTeacher(t);
    setSelectedSheltersForAssign(t.shelterIds || []);
    setShowAssignShelterModal(true);
  };

  // Save Shelter Assignment for Teacher
  const handleSaveShelterAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningTeacher) return;

    updateTeacher({
      ...assigningTeacher,
      shelterIds: selectedSheltersForAssign
    });

    setShowAssignShelterModal(false);
    alert(`Alhamdulillah! Penugasan shelter untuk Ustadz ${assigningTeacher.name} berhasil disimpan (${selectedSheltersForAssign.length} shelter binaan ditunjuk). Guru hanya dapat melihat shelter tersebut dan ojol yang mendaftar di dalamnya.`);
  };

  // Save Participant
  const handleSaveParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName || !partPlate) return;

    addParticipant({
      name: partName,
      phone: partPhone || '0857-0000-0000',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      ojolPlatform: partPlatform,
      vehiclePlate: partPlate,
      shelterId: partShelterId || shelters[0]?.id || '',
      currentLevel: partLevel,
      joinedDate: new Date().toISOString().substring(0, 10),
      isActive: true,
      bankName: partBankName.trim() || undefined,
      bankAccount: partBankAccount.trim() || undefined,
    }, partEmail || `${partPlate.toLowerCase().replace(/\s+/g, '')}@driver.ojol`);

    setShowPartModal(false);
    setPartName('');
    setPartPlate('');
    setPartPhone('');
    setPartBankName('');
    setPartBankAccount('');
  };

  // Save Announcement
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    createAnnouncement({
      title: annTitle,
      content: annContent,
      targetRole: annTargetRole,
      targetShelterId: annShelterId || undefined,
    });

    setShowAnnModal(false);
    setAnnTitle('');
    setAnnContent('');
  };

  // Save Attendance Correction with Audit
  const handleSaveAttendanceCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctingRecordId || !correctReason) return;

    correctAttendance(correctingRecordId, correctNewStatus, correctReason);
    setCorrectingRecordId(null);
    setCorrectReason('');
    alert('Koreksi presensi berhasil dicatat dalam audit log sistem!');
  };

  // Helpers for Export CSV
  const getAverageRubricScore = (scores?: RubricScores) => {
    if (!scores) return '-';
    const sum = scores.hijaiyah + scores.harakat + scores.kelancaran + scores.tajwid + scores.makhraj + scores.kemandirian;
    return (sum / 6).toFixed(1);
  };

  const formatCSVCell = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/\r?\n|\r/g, ' ').trim();
    return `"${str.replace(/"/g, '""')}"`;
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    // Add UTF-8 BOM (\uFEFF) to guarantee Excel reads characters cleanly without mojibake
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 200);
  };

  const handleOpenExportModal = (type: 'rekap' | 'presensi' | 'evaluasi' = 'rekap') => {
    setExportReportType(type);
    setShowExportModal(true);
  };

  const handleExportCSV = () => {
    handleOpenExportModal('rekap');
  };

  const handleExecuteExport = () => {
    const sep = exportDelimiter;
    const dateToday = new Date().toISOString().substring(0, 10);

    let filename = '';
    let headers: string[] = [];
    let rows: string[][] = [];

    const isFiltered = exportScope === 'filtered' && shelterFilter !== 'all';

    if (exportReportType === 'rekap') {
      filename = `rekap_laporan_ojol_mengaji_${dateToday}.csv`;
      headers = [
        'No',
        'Nama Peserta',
        'Mitra Ojol',
        'Plat Nomor',
        'No. WhatsApp/HP',
        'Shelter Lokasi',
        'Tingkat Saat Ini',
        'Sesi Hadir',
        'Total Sesi Wajib',
        'Persentase Kehadiran',
        'Status Kualifikasi (>=75%)',
        'Materi Evaluasi Terakhir',
        'Rata-rata Nilai Rubrik',
        'Catatan / Rekomendasi Guru',
        'Tanggal Bergabung',
        'Status Akun'
      ];

      const targetParticipants = isFiltered
        ? participants.filter(p => p.shelterId === shelterFilter)
        : participants;

      rows = targetParticipants.map((p, idx) => {
        const sh = shelters.find(s => s.id === p.shelterId);
        const { attendedSessions, totalSessions, rate } = getParticipantAttendanceStats(p.id);
        const ev = assessments.find(a => a.participantId === p.id);
        const avgScore = ev ? getAverageRubricScore(ev.scores) : '-';
        const qualification = rate >= 75 ? 'Memenuhi Syarat (>=75%)' : 'Perlu Pendampingan (<75%)';

        return [
          String(idx + 1),
          p.name,
          p.ojolPlatform,
          p.vehiclePlate || '-',
          p.phone || '-',
          sh?.name || '-',
          p.currentLevel || 'Belum Dinilai',
          String(attendedSessions),
          String(totalSessions),
          `${rate}%`,
          qualification,
          ev?.material || 'Belum dievaluasi',
          avgScore !== '-' ? `${avgScore} / 4.0` : '-',
          ev?.recommendations || ev?.improvements || '-',
          p.joinedDate || '-',
          p.isActive ? 'Aktif' : 'Nonaktif'
        ];
      });
    } else if (exportReportType === 'presensi') {
      filename = `log_presensi_ojol_mengaji_${dateToday}.csv`;
      headers = [
        'No',
        'Tanggal Sesi',
        'Waktu Check-In',
        'Nama Peserta',
        'Mitra Ojol',
        'Plat Nomor',
        'Lokasi Shelter',
        'Status Kehadiran',
        'Metode Presensi',
        'Akurasi Jarak GPS',
        'Catatan / Keterangan'
      ];

      const targetAttendance = isFiltered
        ? attendance.filter(a => a.shelterId === shelterFilter)
        : attendance;

      rows = targetAttendance.map((rec, idx) => {
        const p = participants.find(part => part.id === rec.participantId);
        const sh = shelters.find(s => s.id === rec.shelterId);
        const statusLabel = 
          rec.status === 'hadir' ? 'Hadir Tepat Waktu' :
          rec.status === 'terlambat' ? 'Hadir Terlambat' :
          rec.status === 'izin' ? 'Izin' :
          rec.status === 'sakit' ? 'Sakit' : 'Alpa (Tanpa Keterangan)';
        
        const methodLabel =
          rec.method === 'gps' ? 'Geofencing GPS' :
          rec.method === 'qr' ? 'QR Code Shelter' : 'Koreksi Manual Admin';

        return [
          String(idx + 1),
          rec.sessionDate,
          rec.checkInTime || '-',
          p?.name || 'Peserta Tidak Ditemukan',
          p?.ojolPlatform || '-',
          p?.vehiclePlate || '-',
          sh?.name || '-',
          statusLabel,
          methodLabel,
          rec.distanceMeters !== undefined ? `${rec.distanceMeters} m` : '-',
          rec.notes || '-'
        ];
      });
    } else if (exportReportType === 'evaluasi') {
      filename = `evaluasi_alquran_ojol_mengaji_${dateToday}.csv`;
      headers = [
        'No',
        'Tanggal Penilaian',
        'Nama Peserta',
        'Mitra Ojol',
        'Shelter Lokasi',
        'Ustadz / Guru Penguji',
        'Materi / Surah & Ayat',
        'Hijaiyah (1-4)',
        'Harakat (1-4)',
        'Kelancaran (1-4)',
        'Tajwid (1-4)',
        'Makhraj (1-4)',
        'Kemandirian (1-4)',
        'Rata-rata Skor (Skala 4.0)',
        'Kekuatan Bacaan',
        'Poin Perbaikan',
        'Rekomendasi Ustadz',
        'Status Publikasi'
      ];

      const targetAssessments = isFiltered
        ? assessments.filter(a => {
            const p = participants.find(part => part.id === a.participantId);
            return p?.shelterId === shelterFilter;
          })
        : assessments;

      rows = targetAssessments.map((ev, idx) => {
        const p = participants.find(part => part.id === ev.participantId);
        const sh = p ? shelters.find(s => s.id === p.shelterId) : null;
        const teacher = teachers.find(t => t.id === ev.teacherId);
        const avgScore = getAverageRubricScore(ev.scores);

        return [
          String(idx + 1),
          ev.assessmentDate,
          p?.name || 'Peserta Tidak Ditemukan',
          p?.ojolPlatform || '-',
          sh?.name || '-',
          teacher?.name || 'Ustadz Pembina',
          ev.material,
          String(ev.scores.hijaiyah),
          String(ev.scores.harakat),
          String(ev.scores.kelancaran),
          String(ev.scores.tajwid),
          String(ev.scores.makhraj),
          String(ev.scores.kemandirian),
          avgScore,
          ev.strengths || '-',
          ev.improvements || '-',
          ev.recommendations || '-',
          ev.isPublished ? 'Terbit (Rapor Driver)' : 'Draft Internal'
        ];
      });
    }

    const headerLine = headers.map(formatCSVCell).join(sep);
    const rowLines = rows.map(r => r.map(formatCSVCell).join(sep));
    const csvContent = [headerLine, ...rowLines].join('\r\n');

    downloadCSV(csvContent, filename);
    setShowExportModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Admin Top Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-800/70 text-purple-200 border border-purple-700/50 mb-2">
              <Shield className="w-3.5 h-3.5 text-purple-300" />
              Pusat Kendali Administrator (Full Access)
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Dashboard Program Ojol Mengaji
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-2xl">
              Kelola master shelter geolokasi, penugasan ustadz, pendaftaran driver, monitoring presensi, dan evaluasi Al-Qur&apos;an secara terpusat.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleOpenCreateShelter}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-purple-500 hover:bg-purple-400 text-slate-950 shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Shelter Baru</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-slate-900 hover:bg-slate-100 shadow-md transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-purple-600" />
              <span>Ekspor CSV Laporan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none border-b border-slate-200">
        {[
          { id: 'dashboard', label: 'Ringkasan & KPI', icon: TrendingUp },
          { id: 'shelter', label: 'Kelola Shelter GPS', icon: MapPin, count: shelters.length },
          { id: 'guru', label: 'Pendaftaran Guru', icon: GraduationCap, count: teachers.length },
          { id: 'peserta', label: 'Peserta Ojol', icon: Users, count: participants.length },
          { id: 'presensi', label: 'Log Presensi Realtime', icon: CheckCircle2, count: attendance.length },
          { id: 'evaluasi', label: 'Monitoring Al-Qur\'an', icon: BookOpen, count: assessments.length },
          { id: 'pengumuman', label: 'Pengumuman', icon: Bell, count: announcements.length },
          { id: 'laporan', label: 'Laporan Kehadiran', icon: FileText },
          { id: 'audit', label: 'Audit Log Sistem', icon: History, count: auditLogs.length },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-purple-800 text-white shadow-md shadow-purple-800/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.id ? 'bg-purple-950 text-purple-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: DASHBOARD & KPI */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Driver Ojol Aktif</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{activeParticipants.length} Orang</div>
              <p className="text-xs text-emerald-600 font-medium mt-1">100% akun terverifikasi</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Guru Pengampu</span>
                <GraduationCap className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{activeTeachers.length} Ustadz</div>
              <p className="text-xs text-slate-500 mt-1">Mengampu {activeShelters.length} titik shelter</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Shelter Aktif</span>
                <MapPin className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">{activeShelters.length} Lokasi</div>
              <p className="text-xs text-slate-500 mt-1">Dilengkapi validasi GPS &amp; QR</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Perlu Pendampingan</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-600">{riskParticipants.length} Driver</div>
              <p className="text-xs text-rose-600 font-medium mt-1">Tingkat kehadiran di bawah 75%</p>
            </div>
          </div>

          {/* Level Distribution & Shelter Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Level Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Distribusi Tingkat Bacaan Al-Qur&apos;an</h3>
                  <p className="text-xs text-slate-500">Capaian kemampuan driver dari jenjang Iqro hingga Mahir</p>
                </div>
                <BookOpen className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="space-y-3 pt-2">
                {Object.entries(levelCounts).map(([lvl, count]) => {
                  const percent = participants.length > 0 ? Math.round((count / participants.length) * 100) : 0;
                  return (
                    <div key={lvl}>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>{lvl}</span>
                        <span>{count} Orang ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Risk Participants List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Peserta Berisiko Kurang Aktif (&lt; 75%)</h3>
                  <p className="text-xs text-slate-500">Beri follow-up via koordinator shelter atau WhatsApp</p>
                </div>
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>

              <div className="divide-y divide-slate-100">
                {riskParticipants.length === 0 ? (
                  <div className="p-4 text-center text-xs text-emerald-600 font-semibold">
                    Alhamdulillah, seluruh peserta memiliki kehadiran di atas 75%!
                  </div>
                ) : (
                  riskParticipants.map(rp => {
                    const sh = shelters.find(s => s.id === rp.shelterId);
                    const { rate, attendedSessions, totalSessions } = getParticipantAttendanceStats(rp.id);
                    return (
                      <div key={rp.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img src={rp.avatar} alt={rp.name} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <div className="font-bold text-slate-900">{rp.name} ({rp.ojolPlatform})</div>
                            <div className="text-slate-500 text-[11px]">{sh?.name} • {rp.phone}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-rose-600 text-sm">{rate}%</span>
                          <div className="text-[10px] text-slate-400">{attendedSessions} dari {totalSessions} sesi</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: KELOLA SHELTER GPS */}
      {activeTab === 'shelter' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Manajemen Shelter &amp; Titik Geolokasi Presensi</h2>
              <p className="text-xs text-slate-500">
                Admin menentukan titik koordinat GPS (latitude, longitude) serta radius toleransi kehadiran (meter).
              </p>
            </div>

            <button
              onClick={handleOpenCreateShelter}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-700 text-white hover:bg-purple-800 shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Shelter</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shelters.map(shelter => {
              const assignedTeachers = teachers.filter(t => t.shelterIds.includes(shelter.id));
              const countParticipants = participants.filter(p => p.shelterId === shelter.id).length;

              return (
                <div key={shelter.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-slate-900">{shelter.name}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Radius {shelter.radiusMeters}m
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{shelter.address}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditShelter(shelter)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                        title="Edit Shelter"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus shelter "${shelter.name}"?`)) {
                            deleteShelter(shelter.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Hapus Shelter"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Koordinat GPS:</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-slate-800 font-semibold text-[11px]">{shelter.latitude}, {shelter.longitude}</span>
                        <a
                          href={`https://www.google.com/maps?q=${shelter.latitude},${shelter.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800"
                          title="Buka titik shelter di Google Maps"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Driver Binaan:</span>
                      <span className="font-bold text-purple-700">{countParticipants} Driver</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Guru Pengampu: </span>
                    {assignedTeachers.length > 0 ? (
                      <span>{assignedTeachers.map(t => t.name).join(', ')}</span>
                    ) : (
                      <span className="italic text-slate-400">Belum ada guru ditugaskan</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: GURU & PENUGASAN */}
      {activeTab === 'guru' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Pendaftaran &amp; Manajemen Guru Mengaji (Ustadz)</h2>
              <p className="text-xs text-slate-500">
                Admin mengelola pendaftaran data guru (termasuk NIK dan nomor rekening honorarium), penugasan shelter binaan, serta pemantauan bimbingan.
              </p>
            </div>

            <button
              onClick={handleOpenCreateTeacher}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-700 text-white hover:bg-purple-800 shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Daftarkan Guru Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachers.map(teacher => {
              const mySheltersList = shelters.filter(s => (teacher.shelterIds || []).includes(s.id));
              const totalDrivers = participants.filter(p => (teacher.shelterIds || []).includes(p.shelterId)).length;
              return (
                <div key={teacher.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img src={teacher.avatar} alt={teacher.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500 shadow-2xs" />
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{teacher.name}</h4>
                          <p className="text-xs text-slate-500">{teacher.phone} • {teacher.email}</p>
                          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">{teacher.specialization}</p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200 shrink-0">
                        {mySheltersList.length} Shelter • {totalDrivers} Ojol
                      </span>
                    </div>

                    {/* Data Identitas & Rekening (NIK & Nomor Rekening) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                          <IdCard className="w-3 h-3 text-purple-600" />
                          NIK KTP Guru:
                        </span>
                        <span className="font-mono font-bold text-slate-800 text-[11px] mt-0.5 block">
                          {teacher.nik ? teacher.nik : <span className="text-slate-400 font-normal italic">Belum diisi</span>}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-emerald-600" />
                          Nomor Rekening:
                        </span>
                        <div className="mt-0.5">
                          {teacher.bankAccount ? (
                            <span className="font-mono font-bold text-emerald-800 text-[11px]">
                              {teacher.bankName ? `${teacher.bankName} - ` : ''}{teacher.bankAccount}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal italic text-[11px]">Belum diisi</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-700">Shelter Ditunjuk Admin:</span>
                        <span className="text-[10px] text-slate-400">Guru hanya bisa lihat shelter ini &amp; ojolnya</span>
                      </div>
                      {mySheltersList.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {mySheltersList.map(s => {
                            const count = participants.filter(p => p.shelterId === s.id).length;
                            return (
                              <span key={s.id} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-200 text-[11px] font-medium flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-purple-600" />
                                <span>{s.name}</span>
                                <span className="font-bold text-purple-700 text-[10px]">({count} ojol)</span>
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-amber-700 font-medium italic">
                          Belum ada shelter yang ditugaskan ke ustadz ini.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditTeacher(teacher)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Data &amp; Rekening</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAssignShelters(teacher)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Atur Penugasan Shelter</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PESERTA OJOL */}
      {activeTab === 'peserta' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Manajemen Pengemudi Ojol (Peserta)</h2>
              <p className="text-xs text-slate-500">
                Pendaftaran peserta, pemilihan shelter, penetapan level awal, dan pantau kehadiran.
              </p>
            </div>

            <button
              onClick={() => setShowPartModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-700 text-white hover:bg-purple-800 shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Daftarkan Driver Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama &amp; Mitra</th>
                  <th className="py-3 px-4">Plat Nomor</th>
                  <th className="py-3 px-4">Shelter Penempatan</th>
                  <th className="py-3 px-4">Tingkat Kemampuan</th>
                  <th className="py-3 px-4 text-center">Kehadiran (%)</th>
                  <th className="py-3 px-4 text-center">Bergabung</th>
                  <th className="py-3 px-4 text-center">Kartu KTA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participants.map(part => {
                  const sh = shelters.find(s => s.id === part.shelterId);
                  const { rate, attendedSessions, totalSessions } = getParticipantAttendanceStats(part.id);

                  return (
                    <tr key={part.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img src={part.avatar} alt={part.name} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <div className="font-bold text-slate-900">{part.name}</div>
                            <div className="text-[11px] font-semibold text-emerald-700">{part.ojolPlatform}</div>
                            {part.bankAccount && (
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {part.bankName ? `${part.bankName} - ` : 'Rek: '}{part.bankAccount}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">{part.vehiclePlate}</td>
                      <td className="py-3 px-4 text-slate-700">{sh?.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded border text-[11px] font-medium ${
                          part.currentLevel === 'Belum Dinilai'
                            ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {part.currentLevel}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`font-bold ${rate >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {rate}%
                        </span>
                        <div className="text-[10px] text-slate-400">({attendedSessions}/{totalSessions})</div>
                      </td>

                      <td className="py-3 px-4 text-center text-slate-500">{part.joinedDate}</td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedKtaParticipant(part)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition"
                          title="Lihat, Unduh (PNG HD), atau Cetak Kartu Anggota Ojol Mengaji"
                        >
                          <CreditCard className="w-3 h-3 text-emerald-600" />
                          <span>KTA / Unduh</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LOG PRESENSI REALTIME */}
      {activeTab === 'presensi' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Log Monitoring Presensi Lintas Shelter</h2>
              <p className="text-xs text-slate-500">
                Sesuai PRD Bab 5: Setiap koreksi resmi oleh Admin/Guru mewajibkan alasan dan tercatat di audit log.
              </p>
            </div>

            <button
              onClick={() => handleOpenExportModal('presensi')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor CSV Presensi</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tanggal &amp; Waktu</th>
                  <th className="py-3 px-4">Peserta Ojol</th>
                  <th className="py-3 px-4">Shelter</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Koreksi Berizin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map(record => {
                  const part = participants.find(p => p.id === record.participantId);
                  const sh = shelters.find(s => s.id === record.shelterId);

                  return (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{record.sessionDate}</div>
                        <div className="text-slate-400 text-[11px]">{record.checkInTime}</div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {part?.name} ({part?.ojolPlatform})
                      </td>

                      <td className="py-3 px-4 text-slate-600">{sh?.name}</td>

                      <td className="py-3 px-4">
                        <span className="uppercase font-bold text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {record.method} {record.distanceMeters ? `(${record.distanceMeters}m)` : ''}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          record.status === 'hadir' ? 'bg-emerald-100 text-emerald-800' :
                          record.status === 'terlambat' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {record.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setCorrectingRecordId(record.id);
                            setCorrectNewStatus(record.status);
                            setCorrectReason('');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 text-[11px] border border-purple-200"
                        >
                          Koreksi Presensi
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MONITORING AL-QUR'AN */}
      {activeTab === 'evaluasi' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Monitoring Perkembangan Membaca Al-Qur&apos;an</h2>
              <p className="text-xs text-slate-500">
                Evaluasi berkala guru pembimbing berbasis rubrik 6 aspek pembelajaran Al-Qur&apos;an.
              </p>
            </div>

            <button
              onClick={() => handleOpenExportModal('evaluasi')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor CSV Nilai Tilawah</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Peserta Ojol</th>
                  <th className="py-3 px-4">Materi Diuji</th>
                  <th className="py-3 px-4 text-center">Hijaiyah</th>
                  <th className="py-3 px-4 text-center">Harakat</th>
                  <th className="py-3 px-4 text-center">Kelancaran</th>
                  <th className="py-3 px-4 text-center">Tajwid</th>
                  <th className="py-3 px-4 text-center">Makhraj</th>
                  <th className="py-3 px-4 text-center">Kemandirian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessments.map(ev => {
                  const part = participants.find(p => p.id === ev.participantId);
                  return (
                    <tr key={ev.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-500">{ev.assessmentDate}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{part?.name}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-800">{ev.material}</td>
                      <td className="py-3 px-4 text-center font-bold">{ev.scores.hijaiyah}/4</td>
                      <td className="py-3 px-4 text-center font-bold">{ev.scores.harakat}/4</td>
                      <td className="py-3 px-4 text-center font-bold">{ev.scores.kelancaran}/4</td>
                      <td className="py-3 px-4 text-center font-bold">{ev.scores.tajwid}/4</td>
                      <td className="py-3 px-4 text-center font-bold">{ev.scores.makhraj}/4</td>
                      <td className="py-3 px-4 text-center font-bold">{ev.scores.kemandirian}/4</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PENGUMUMAN */}
      {activeTab === 'pengumuman' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Pengumuman &amp; Komunikasi Program</h2>
              <p className="text-xs text-slate-500">
                Kirim informasi ke semua guru, semua driver peserta, atau shelter tertentu.
              </p>
            </div>

            <button
              onClick={() => setShowAnnModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-700 text-white hover:bg-purple-800 shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Pengumuman Baru</span>
            </button>
          </div>

          <div className="space-y-4">
            {announcements.map(ann => (
              <div key={ann.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 uppercase">
                      Target: {ann.targetRole.toUpperCase()}
                    </span>
                    <span className="text-slate-400 text-xs">{ann.createdAt}</span>
                    <span className="text-slate-500 text-xs">• Oleh {ann.authorName}</span>
                  </div>
                  <h4 className="font-bold text-base text-slate-900">{ann.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                </div>

                <button
                  onClick={() => deleteAnnouncement(ann.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Hapus Pengumuman"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: LAPORAN KEHADIRAN & EKSPOR */}
      {activeTab === 'laporan' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Rekapitulasi Laporan Program</h2>
              <p className="text-xs text-slate-500">
                Formula PRD: Kehadiran (%) = (Jumlah sesi hadir ÷ Sesi wajib) × 100%
              </p>
            </div>

            <button
              onClick={() => handleOpenExportModal('rekap')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Unduh Rekap Spreadsheet (CSV)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Peserta</th>
                  <th className="py-3 px-4">Mitra / Plat</th>
                  <th className="py-3 px-4">Shelter</th>
                  <th className="py-3 px-4 text-center">Sesi Hadir</th>
                  <th className="py-3 px-4 text-center">Sesi Wajib</th>
                  <th className="py-3 px-4 text-center">Persentase</th>
                  <th className="py-3 px-4 text-center">Evaluasi Al-Qur&apos;an</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participants.map(part => {
                  const sh = shelters.find(s => s.id === part.shelterId);
                  const { attendedSessions, totalSessions, rate } = getParticipantAttendanceStats(part.id);
                  const ev = assessments.find(a => a.participantId === part.id);

                  return (
                    <tr key={part.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{part.name}</td>
                      <td className="py-3 px-4 text-slate-600">{part.ojolPlatform} ({part.vehiclePlate})</td>
                      <td className="py-3 px-4 text-slate-700">{sh?.name}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-700">{attendedSessions}</td>
                      <td className="py-3 px-4 text-center text-slate-500">{totalSessions}</td>
                      <td className="py-3 px-4 text-center font-black text-sm">
                        <span className={rate >= 75 ? 'text-emerald-600' : 'text-rose-600'}>{rate}%</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[11px] font-semibold text-purple-700">
                          {ev ? ev.material : 'Belum dievaluasi'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Audit Log &amp; Jejak Rekam Aktivitas</h2>
            <p className="text-xs text-slate-500">
              Sesuai PRD Bab 9 &amp; 10: Mencatat seluruh perubahan data penting, pelaku, dan waktu kejadian untuk integritas sistem.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Peran</th>
                  <th className="py-3 px-4">Entitas</th>
                  <th className="py-3 px-4">Aksi</th>
                  <th className="py-3 px-4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.userName}</td>
                    <td className="py-3 px-4">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-purple-700">{log.targetEntity}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{log.action}</td>
                    <td className="py-3 px-4 text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: SHELTER CREATE / EDIT */}
      {showShelterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto border border-slate-100">
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-purple-700" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {editingShelter ? 'Edit Titik Shelter' : 'Tambah Titik Shelter Baru'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Koordinat GPS (Latitude, Longitude) dan Radius terisi otomatis oleh sistem geofencing.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowShelterModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Tutup Formulir"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShelter} className="space-y-4">
              {/* Rekomendasi Titik Shelter Populer (1-Klik Otomatis) */}
              {!editingShelter && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-purple-950 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Pilihan Cepat Titik Populer (1-Klik Auto-Fill):</span>
                  </label>
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const preset = PRESET_SHELTERS.find(p => p.name === val);
                      if (preset) {
                        setShelterName(preset.name);
                        setShelterAddress(preset.address);
                        setShelterLat(preset.lat);
                        setShelterLng(preset.lng);
                        setShelterRadius(preset.radius);
                        setShelterNotes(preset.notes);
                        setGpsAutoStatus(`✓ Titik "${preset.name}" dipilih: Lat, Lng & Radius terisi otomatis!`);
                      }
                    }}
                    defaultValue=""
                    className="w-full text-xs p-2.5 rounded-xl border border-purple-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Pilih titik shelter strategis (opsional) --</option>
                    {PRESET_SHELTERS.map(p => (
                      <option key={p.name} value={p.name}>
                        {p.name} — Radius {p.radius}m ({p.lat}, {p.lng})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Nama Shelter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Titik Shelter <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Shelter Stasiun Tebet Barat"
                  value={shelterName}
                  onChange={(e) => setShelterName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                />
              </div>

              {/* Alamat Lengkap + Auto Search Coords */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Alamat Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGeocodeFromAddress}
                    disabled={isSearchingAddress}
                    className="text-[11px] font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 hover:underline disabled:opacity-50"
                    title="Cari koordinat GPS otomatis dari alamat ini"
                  >
                    {isSearchingAddress ? (
                      <Loader2 className="w-3 h-3 animate-spin text-purple-600" />
                    ) : (
                      <Search className="w-3 h-3 text-purple-600" />
                    )}
                    <span>Ambil Koordinat dari Alamat</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jl. Tebet Raya No. 45, Tebet Timur, Jakarta Selatan"
                  value={shelterAddress}
                  onChange={(e) => setShelterAddress(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                />
              </div>

              {/* KOTAK OTOMATIS: LATITUDE, LONGITUDE, DAN RADIUS */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-900">Geolokasi &amp; Radius Presensi</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          ✓ Terisi Otomatis
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Latitude, Longitude, &amp; Radius ditetapkan otomatis (bukan ketik manual)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => detectGpsLocation(shelterRadius || 75)}
                    disabled={isDetectingGps}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
                  >
                    {isDetectingGps ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Navigation className="w-3.5 h-3.5" />
                    )}
                    <span>{isDetectingGps ? 'Mendeteksi GPS...' : 'Deteksi GPS Saya'}</span>
                  </button>
                </div>

                {/* Status GPS Indikator */}
                {gpsAutoStatus && (
                  <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    gpsAutoStatus.startsWith('✓')
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}>
                    {gpsAutoStatus.startsWith('✓') ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span className="text-[11px] leading-tight font-medium">{gpsAutoStatus}</span>
                  </div>
                )}

                {/* 3 Grid Column: Latitude, Longitude, Radius */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">Latitude</label>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                        Otomatis
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      readOnly={!allowManualCoordEdit}
                      value={shelterLat}
                      onChange={(e) => setShelterLat(Number(e.target.value))}
                      className={`w-full text-xs p-2.5 rounded-xl border font-mono font-bold transition-colors ${
                        allowManualCoordEdit
                          ? 'border-purple-400 bg-white text-slate-900 focus:ring-2 focus:ring-purple-300'
                          : 'border-slate-200 bg-slate-100/90 text-slate-700 cursor-not-allowed select-all'
                      }`}
                      title={allowManualCoordEdit ? 'Mode edit aktif' : 'Terisi otomatis oleh sistem'}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">Longitude</label>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                        Otomatis
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      readOnly={!allowManualCoordEdit}
                      value={shelterLng}
                      onChange={(e) => setShelterLng(Number(e.target.value))}
                      className={`w-full text-xs p-2.5 rounded-xl border font-mono font-bold transition-colors ${
                        allowManualCoordEdit
                          ? 'border-purple-400 bg-white text-slate-900 focus:ring-2 focus:ring-purple-300'
                          : 'border-slate-200 bg-slate-100/90 text-slate-700 cursor-not-allowed select-all'
                      }`}
                      title={allowManualCoordEdit ? 'Mode edit aktif' : 'Terisi otomatis oleh sistem'}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">Radius Presensi</label>
                      <span className="text-[9px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded">
                        Otomatis
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        readOnly={!allowManualCoordEdit}
                        value={shelterRadius}
                        onChange={(e) => setShelterRadius(Number(e.target.value))}
                        className={`w-full text-xs p-2.5 pr-8 rounded-xl border font-black text-purple-800 transition-colors ${
                          allowManualCoordEdit
                            ? 'border-purple-400 bg-white focus:ring-2 focus:ring-purple-300'
                            : 'border-slate-200 bg-slate-100/90 cursor-not-allowed'
                        }`}
                        title={allowManualCoordEdit ? 'Mode edit aktif' : 'Terisi otomatis standar 75m'}
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        m
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Standard Radius Buttons & Google Maps Link */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500">Preset Radius Standar:</span>
                    {[50, 75, 100].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setShelterRadius(r);
                          setGpsAutoStatus(`✓ Radius otomatis disetel ke ${r} meter.`);
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                          shelterRadius === r
                            ? 'bg-purple-700 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {r}m {r === 75 ? '(Standar)' : ''}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <a
                      href={`https://www.google.com/maps?q=${shelterLat},${shelterLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-700 hover:text-purple-900 font-bold text-[11px] inline-flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Titik di Google Maps</span>
                    </a>

                    <span className="text-slate-300">•</span>

                    <button
                      type="button"
                      onClick={() => setAllowManualCoordEdit(!allowManualCoordEdit)}
                      className="text-[10px] font-semibold text-slate-500 hover:text-purple-700 flex items-center gap-1"
                      title="Klik untuk membuka kunci jika ada kebutuhan darurat edit angka manual"
                    >
                      {allowManualCoordEdit ? (
                        <>
                          <Lock className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Kunci Otomatis</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3 text-slate-400" />
                          <span>Koreksi Manual (Opsional)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Catatan Lokasi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Lokasi Shelter</label>
                <input
                  type="text"
                  placeholder="Contoh: Dekat musholla transit driver ojol Pintu Barat"
                  value={shelterNotes}
                  onChange={(e) => setShelterNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowShelterModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-700 text-white hover:bg-purple-800 shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Shelter</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TEACHER CREATE / EDIT */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto border border-slate-100">
            <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-purple-700" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {editingTeacher ? 'Edit Data Guru Mengaji' : 'Pendaftaran Guru Mengaji (Ustadz)'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  {editingTeacher 
                    ? 'Perbarui data identitas, NIK KTP, rekening honorarium, dan penugasan guru' 
                    : 'Buat akun guru, lengkapi NIK & nomor rekening honorarium, serta tetapkan penempatan shelter'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowTeacherModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Tutup Formulir"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap &amp; Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ust. Ahmad Fauzi, S.Q."
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Login <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    disabled={!!editingTeacher}
                    placeholder="guru@ojolmengaji.id"
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    className={`w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-400 outline-none ${
                      editingTeacher ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. WhatsApp / HP <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0813-xxxx-xxxx"
                    value={teacherPhone}
                    onChange={(e) => setTeacherPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                </div>
              </div>

              {/* Data NIK KTP Guru */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5 text-purple-600" />
                    <span>Nomor Induk Kependudukan (NIK KTP)</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">16 digit angka KTP</span>
                </div>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="Contoh: 3201011505800001"
                  value={teacherNik}
                  onChange={(e) => setTeacherNik(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono tracking-wider focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>

              {/* Data Rekening Bank (Honorarium Ustadz) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-800">Data Rekening Bank (Honorarium Ustadz)</span>
                    <p className="text-[10px] text-slate-500">Penyaluran kafalah / honor bimbingan mengaji mitra ojol</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nama Bank
                    </label>
                    <select
                      value={teacherBankName}
                      onChange={(e) => setTeacherBankName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-purple-400 outline-none"
                    >
                      <option value="">-- Pilih Bank --</option>
                      <option value="BSI (Bank Syariah Indonesia)">BSI (Bank Syariah Indonesia)</option>
                      <option value="Bank Muamalat">Bank Muamalat</option>
                      <option value="BCA Syariah">BCA Syariah</option>
                      <option value="Bank Mandiri">Bank Mandiri</option>
                      <option value="Bank BCA">Bank BCA</option>
                      <option value="Bank BRI">Bank BRI</option>
                      <option value="Bank BNI">Bank BNI</option>
                      <option value="Bank DKI / DKI Syariah">Bank DKI / DKI Syariah</option>
                      <option value="Bank Lainnya">Bank Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nomor Rekening
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 7123456789"
                      value={teacherBankAccount}
                      onChange={(e) => setTeacherBankAccount(e.target.value.replace(/[^0-9-]/g, ''))}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-mono font-semibold focus:ring-2 focus:ring-purple-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Spesialisasi Bimbingan</label>
                <input
                  type="text"
                  placeholder="Contoh: Tahsin Makharijul Huruf &amp; Talaqqi"
                  value={teacherSpec}
                  onChange={(e) => setTeacherSpec(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Penempatan Shelter</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-white">
                  {shelters.map(s => {
                    const isChecked = teacherSelectedShelters.includes(s.id);
                    return (
                      <label key={s.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTeacherSelectedShelters(prev => [...prev, s.id]);
                            } else {
                              setTeacherSelectedShelters(prev => prev.filter(id => id !== s.id));
                            }
                          }}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>{s.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTeacherModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-700 text-white hover:bg-purple-800 shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingTeacher ? 'Simpan Perubahan' : 'Daftarkan Guru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PARTICIPANT CREATE */}
      {showPartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Pendaftaran Pengemudi Ojol</h3>
            <p className="text-xs text-slate-500 mb-4">Tambahkan profil driver ke database pembinaan</p>

            <form onSubmit={handleSaveParticipant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Driver</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Hidayat"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mitra Ojol</label>
                  <select
                    value={partPlatform}
                    onChange={(e) => setPartPlatform(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-bold"
                  >
                    <option value="Gojek">Gojek</option>
                    <option value="Grab">Grab</option>
                    <option value="Maxim">Maxim</option>
                    <option value="InDrive">InDrive</option>
                    <option value="ShopeeFood">ShopeeFood</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Plat Motor</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: B 3821 TXZ"
                    value={partPlate}
                    onChange={(e) => setPartPlate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Penempatan Shelter</label>
                  <select
                    value={partShelterId}
                    onChange={(e) => setPartShelterId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-semibold"
                  >
                    {shelters.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Level Mengaji Awal</label>
                  <select
                    value={partLevel}
                    onChange={(e) => setPartLevel(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="Iqro 1-3">Iqro 1-3</option>
                    <option value="Iqro 4-6">Iqro 4-6</option>
                    <option value="Al-Qur'an Dasar">Al-Qur&apos;an Dasar</option>
                    <option value="Al-Qur'an Mahir / Tajwid">Al-Qur&apos;an Mahir / Tajwid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp / HP</label>
                <input
                  type="text"
                  placeholder="0857-xxxx-xxxx"
                  value={partPhone}
                  onChange={(e) => setPartPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              {/* Data Rekening Bank Driver (Nomor Rekening & Dropdown Bank) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-800">Nomor Rekening Bank Mitra</span>
                    <p className="text-[10px] text-slate-500">Penyaluran insentif &amp; bantuan operasional mengaji</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Pilih Bank
                    </label>
                    <select
                      value={partBankName}
                      onChange={(e) => setPartBankName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-purple-400 outline-none"
                    >
                      <option value="">-- Pilih Bank --</option>
                      <option value="BSI (Bank Syariah Indonesia)">BSI (Bank Syariah Indonesia)</option>
                      <option value="Bank Muamalat">Bank Muamalat</option>
                      <option value="BCA Syariah">BCA Syariah</option>
                      <option value="Bank Mandiri">Bank Mandiri</option>
                      <option value="Bank BCA">Bank BCA</option>
                      <option value="Bank BRI">Bank BRI</option>
                      <option value="Bank BNI">Bank BNI</option>
                      <option value="Bank DKI / DKI Syariah">Bank DKI / DKI Syariah</option>
                      <option value="Bank Lainnya">Bank Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nomor Rekening
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 1234567890"
                      value={partBankAccount}
                      onChange={(e) => setPartBankAccount(e.target.value.replace(/[^0-9-]/g, ''))}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-mono font-semibold focus:ring-2 focus:ring-purple-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowPartModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-700 text-white hover:bg-purple-800 shadow-md"
                >
                  Daftarkan Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ANNOUNCEMENT CREATE */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Buat Pengumuman Baru</h3>
            <p className="text-xs text-slate-500 mb-4">Kirimkan broadcast resmi kepada pengguna program</p>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembagian Mushaf Al-Qur'an Saku Gratis"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sasaran Penerima</label>
                <select
                  value={annTargetRole}
                  onChange={(e) => setAnnTargetRole(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-bold"
                >
                  <option value="all">Semua Pengguna (Guru &amp; Driver)</option>
                  <option value="ojol">Khusus Pengemudi Ojol</option>
                  <option value="guru">Khusus Guru Mengaji</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Isi Pesan Pengumuman</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan detail pengumuman di sini..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-700 text-white hover:bg-purple-800 shadow-md"
                >
                  Kirim Pengumuman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ATTENDANCE CORRECTION WITH AUDIT */}
      {correctingRecordId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Koreksi Presensi Berizin</h3>
            <p className="text-xs text-slate-500 mb-4">
              Sesuai audit compliance, setiap perubahan status presensi harus menyertakan alasan yang sah.
            </p>

            <form onSubmit={handleSaveAttendanceCorrection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Baru</label>
                <select
                  value={correctNewStatus}
                  onChange={(e) => setCorrectNewStatus(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-bold"
                >
                  <option value="hadir">Hadir (Tervalidasi)</option>
                  <option value="terlambat">Terlambat</option>
                  <option value="izin">Izin</option>
                  <option value="sakit">Sakit</option>
                  <option value="alpa">Alpa / Tidak Hadir</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alasan Koreksi (Wajib untuk Audit)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Driver hadir fisik di shelter namun HP kehabisan baterai saat sesi berlangsung..."
                  value={correctReason}
                  onChange={(e) => setCorrectReason(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setCorrectingRecordId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-700 text-white hover:bg-purple-800 shadow-md"
                >
                  Simpan &amp; Catat Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ATUR PENUGASAN SHELTER GURU */}
      {showAssignShelterModal && assigningTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold shrink-0">
                  <MapPin className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Atur Penugasan Shelter Guru
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tentukan shelter binaan yang diampu oleh {assigningTeacher.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAssignShelterModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                title="Tutup Formulir"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShelterAssignment} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
                {/* Instruction Notice */}
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-start gap-2">
                  <Shield className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Kebijakan Hak Akses:</strong> Ustadz hanya dapat melihat shelter yang dicentang oleh Admin di bawah ini, dan ustadz juga hanya dapat melihat pengemudi ojol yang mendaftar di shelter tersebut.
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    Pilih Shelter Binaan ({selectedSheltersForAssign.length} dipilih):
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSheltersForAssign(shelters.map(s => s.id))}
                      className="text-[11px] font-semibold text-purple-700 hover:underline"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedSheltersForAssign([])}
                      className="text-[11px] font-semibold text-rose-600 hover:underline"
                    >
                      Kosongkan Semua
                    </button>
                  </div>
                </div>

                {/* Checkboxes List */}
                <div className="space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
                  {shelters.map(s => {
                    const isChecked = selectedSheltersForAssign.includes(s.id);
                    const driverCount = participants.filter(p => p.shelterId === s.id).length;
                    return (
                      <label
                        key={s.id}
                        className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'border-purple-500 bg-purple-50/80 shadow-xs ring-1 ring-purple-300'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSheltersForAssign(prev => [...prev, s.id]);
                              } else {
                                setSelectedSheltersForAssign(prev => prev.filter(id => id !== s.id));
                              }
                            }}
                            className="mt-1 rounded text-purple-600 focus:ring-purple-500"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{s.name}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">{s.address}</div>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                          driverCount > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {driverCount} Ojol Terdaftar
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end p-4 border-t border-slate-100 bg-slate-50/90 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAssignShelterModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-700 text-white hover:bg-purple-800 shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Penugasan Shelter</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: EKSPOR CSV LAPORAN RAPI */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto border border-slate-100 space-y-5">
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Ekspor Laporan &amp; Spreadsheet (CSV)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Unduh file data terstruktur rapi, berstandar UTF-8 BOM, dan kompatibel penuh dengan Microsoft Excel &amp; Google Sheets.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Tutup Formulir"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Pilihan Jenis Laporan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                1. Pilih Jenis Laporan yang Ingin Diekspor
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Option 1: Rekap Utama */}
                <button
                  type="button"
                  onClick={() => setExportReportType('rekap')}
                  className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                    exportReportType === 'rekap'
                      ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-300'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-purple-700" />
                        <span>Rekap Program</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                        {participants.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Data peserta, shelter, kehadiran %, status target, &amp; evaluasi tilawah.
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] font-bold text-purple-700">Laporan Utama</div>
                </button>

                {/* Option 2: Log Presensi */}
                <button
                  type="button"
                  onClick={() => setExportReportType('presensi')}
                  className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                    exportReportType === 'presensi'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-300'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Log Presensi</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {attendance.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Detail tanggal, jam check-in, shelter, status presensi, &amp; metode GPS/QR.
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] font-bold text-emerald-700">Riwayat Sesi</div>
                </button>

                {/* Option 3: Evaluasi Tilawah */}
                <button
                  type="button"
                  onClick={() => setExportReportType('evaluasi')}
                  className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                    exportReportType === 'evaluasi'
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-300'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-700" />
                        <span>Nilai Tilawah</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        {assessments.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Skor rubrik 6 aspek tajwid, makhraj, kelancaran, &amp; rekomendasi ustadz.
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] font-bold text-indigo-700">Rapor Al-Qur&apos;an</div>
                </button>
              </div>
            </div>

            {/* 2. Format Pemisah (Delimiter) Excel vs Google Sheets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                2. Format Pemisah Kolom (Delimiter CSV)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Semicolon - Rekomendasi Excel Indonesia */}
                <label
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    exportDelimiter === ';'
                      ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-300'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportDelimiter"
                    value=";"
                    checked={exportDelimiter === ';'}
                    onChange={() => setExportDelimiter(';')}
                    className="mt-1 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900">
                        Microsoft Excel Windows (Titik Koma &apos;;&apos;)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Direkomendasikan
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Kolom otomatis langsung terbagi rapi saat file dibuka di Microsoft Excel di Indonesia (tidak menumpuk di Kolom A).
                    </p>
                  </div>
                </label>

                {/* Comma - Standar Internasional / Google Sheets */}
                <label
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    exportDelimiter === ','
                      ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-300'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportDelimiter"
                    value=","
                    checked={exportDelimiter === ','}
                    onChange={() => setExportDelimiter(',')}
                    className="mt-1 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900">
                        Google Sheets &amp; Global (Koma &apos;,&apos;)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        RFC-4180
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Format standar koma untuk diimpor ke Google Spreadsheet, Apple Numbers, atau database analitik.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* 3. Cakupan Data & Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                3. Cakupan Data Ekspor
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <label
                  className={`flex-1 p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2 text-xs font-semibold ${
                    exportScope === 'all'
                      ? 'border-purple-500 bg-purple-50/80 text-purple-950 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportScope"
                    value="all"
                    checked={exportScope === 'all'}
                    onChange={() => setExportScope('all')}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>Seluruh Data (Semua Shelter)</span>
                </label>

                {shelterFilter !== 'all' && (
                  <label
                    className={`flex-1 p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2 text-xs font-semibold ${
                      exportScope === 'filtered'
                        ? 'border-purple-500 bg-purple-50/80 text-purple-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportScope"
                      value="filtered"
                      checked={exportScope === 'filtered'}
                      onChange={() => setExportScope('filtered')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="truncate">
                      Hanya Shelter: {shelters.find(s => s.id === shelterFilter)?.name || shelterFilter}
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* 4. Fitur Jaminan Kerapian & Preview Kolom */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-purple-700" />
                  <span>Struktur Kolom Hasil Ekspor:</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {exportReportType === 'rekap' ? '16 Kolom Lengkap' : exportReportType === 'presensi' ? '11 Kolom Lengkap' : '18 Kolom Lengkap'}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(exportReportType === 'rekap'
                  ? ['No', 'Nama Peserta', 'Mitra Ojol', 'Plat Nomor', 'No. WhatsApp/HP', 'Shelter Lokasi', 'Tingkat Saat Ini', 'Sesi Hadir', 'Total Sesi Wajib', 'Persentase Kehadiran', 'Status Kualifikasi (>=75%)', 'Materi Evaluasi Terakhir', 'Rata-rata Nilai Rubrik', 'Catatan / Rekomendasi Guru', 'Tanggal Bergabung', 'Status Akun']
                  : exportReportType === 'presensi'
                  ? ['No', 'Tanggal Sesi', 'Waktu Check-In', 'Nama Peserta', 'Mitra Ojol', 'Plat Nomor', 'Lokasi Shelter', 'Status Kehadiran', 'Metode Presensi', 'Akurasi Jarak GPS', 'Catatan / Keterangan']
                  : ['No', 'Tanggal Penilaian', 'Nama Peserta', 'Mitra Ojol', 'Shelter Lokasi', 'Ustadz / Guru Penguji', 'Materi / Surah & Ayat', 'Hijaiyah', 'Harakat', 'Kelancaran', 'Tajwid', 'Makhraj', 'Kemandirian', 'Rata-rata Skor', 'Kekuatan', 'Perbaikan', 'Rekomendasi', 'Status Publikasi']
                ).map((colName, cIdx) => (
                  <span
                    key={cIdx}
                    className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700"
                  >
                    {colName}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Encoding UTF-8 BOM Aktif</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Standar Kutip Ganda RFC-4180</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Nomor Urut Otomatis Rapi</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteExport}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File CSV Rapi Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Kartu Tanda Anggota (KTA) Preview & Print Modal */}
      <MemberCardModal
        isOpen={!!selectedKtaParticipant}
        onClose={() => setSelectedKtaParticipant(null)}
        participant={selectedKtaParticipant || {}}
        shelter={shelters.find(s => s.id === selectedKtaParticipant?.shelterId)}
      />
    </div>
  );
};
