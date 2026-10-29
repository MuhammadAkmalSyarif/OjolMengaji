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
  ExternalLink
} from 'lucide-react';
import { Shelter, Teacher, Participant, Schedule, AttendanceStatus } from '@/types';

export const AdminPortal: React.FC = () => {
  const { 
    shelters, 
    teachers, 
    participants, 
    schedules, 
    attendance, 
    assessments, 
    tasks, 
    submissions, 
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

  // Teacher Modal
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherSpec, setTeacherSpec] = useState('');
  const [teacherSelectedShelters, setTeacherSelectedShelters] = useState<string[]>([]);

  // Participant Modal
  const [showPartModal, setShowPartModal] = useState(false);
  const [partName, setPartName] = useState('');
  const [partEmail, setPartEmail] = useState('');
  const [partPhone, setPartPhone] = useState('');
  const [partPlatform, setPartPlatform] = useState<'Gojek' | 'Grab' | 'Maxim' | 'InDrive' | 'ShopeeFood'>('Gojek');
  const [partPlate, setPartPlate] = useState('');
  const [partShelterId, setPartShelterId] = useState<string>(shelters[0]?.id || '');
  const [partLevel, setPartLevel] = useState<'Iqro 1-3' | 'Iqro 4-6' | 'Al-Qur\'an Dasar' | 'Al-Qur\'an Mahir / Tajwid'>('Al-Qur\'an Dasar');

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
    'Iqro 1-3': participants.filter(p => p.currentLevel === 'Iqro 1-3').length,
    'Iqro 4-6': participants.filter(p => p.currentLevel === 'Iqro 4-6').length,
    'Al-Qur\'an Dasar': participants.filter(p => p.currentLevel === 'Al-Qur\'an Dasar').length,
    'Al-Qur\'an Mahir / Tajwid': participants.filter(p => p.currentLevel === 'Al-Qur\'an Mahir / Tajwid').length,
  };

  // Open Shelter Modal for Create
  const handleOpenCreateShelter = () => {
    setEditingShelter(null);
    setShelterName('');
    setShelterAddress('');
    setShelterLat(-6.2268);
    setShelterLng(106.8582);
    setShelterRadius(75);
    setShelterNotes('');
    setShowShelterModal(true);
  };

  // Open Shelter Modal for Edit
  const handleOpenEditShelter = (s: Shelter) => {
    setEditingShelter(s);
    setShelterName(s.name);
    setShelterAddress(s.address);
    setShelterLat(s.latitude);
    setShelterLng(s.longitude);
    setShelterRadius(s.radiusMeters);
    setShelterNotes(s.notes || '');
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

  // Save Teacher
  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName || !teacherEmail) return;

    addTeacher({
      name: teacherName,
      phone: teacherPhone || '0812-0000-0000',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      specialization: teacherSpec || 'Tahsin & Bimbingan Mengaji',
      shelterIds: teacherSelectedShelters.length > 0 ? teacherSelectedShelters : [shelters[0]?.id || ''],
      isActive: true,
    }, teacherEmail);

    setShowTeacherModal(false);
    setTeacherName('');
    setTeacherEmail('');
    setTeacherPhone('');
    setTeacherSpec('');
    setTeacherSelectedShelters([]);
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
    }, partEmail || `${partPlate.toLowerCase().replace(/\s+/g, '')}@driver.ojol`);

    setShowPartModal(false);
    setPartName('');
    setPartPlate('');
    setPartPhone('');
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

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Nama Peserta', 'Mitra', 'Plat Nomor', 'Shelter', 'Tingkat', 'Sesi Hadir', 'Total Sesi', 'Persentase'];
    const rows = participants.map(p => {
      const sh = shelters.find(s => s.id === p.shelterId);
      const { attendedSessions, totalSessions, rate } = getParticipantAttendanceStats(p.id);
      return [
        `"${p.name}"`,
        `"${p.ojolPlatform}"`,
        `"${p.vehiclePlate}"`,
        `"${sh?.name || '-'}"`,
        `"${p.currentLevel}"`,
        attendedSessions,
        totalSessions,
        `"${rate}%"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_ojol_mengaji_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          { id: 'guru', label: 'Guru & Penugasan', icon: GraduationCap, count: teachers.length },
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
                      <span className="font-mono text-slate-800 font-semibold">{shelter.latitude}, {shelter.longitude}</span>
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
              <h2 className="text-lg font-bold text-slate-900">Manajemen Guru Mengaji (Ustadz)</h2>
              <p className="text-xs text-slate-500">
                Admin menentukan penempatan guru pada shelter dan memantau aktivitas bimbingan.
              </p>
            </div>

            <button
              onClick={() => setShowTeacherModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-700 text-white hover:bg-purple-800 shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Guru Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachers.map(teacher => {
              const mySheltersList = shelters.filter(s => teacher.shelterIds.includes(s.id));
              return (
                <div key={teacher.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={teacher.avatar} alt={teacher.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{teacher.name}</h4>
                      <p className="text-xs text-slate-500">{teacher.phone} • {teacher.email}</p>
                      <p className="text-[11px] text-emerald-700 font-medium mt-0.5">{teacher.specialization}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 block mb-1">Penugasan Shelter:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {mySheltersList.map(s => (
                        <span key={s.id} className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-medium">
                          {s.name}
                        </span>
                      ))}
                    </div>
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
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">{part.vehiclePlate}</td>
                      <td className="py-3 px-4 text-slate-700">{sh?.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium">
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
          <div>
            <h2 className="text-lg font-bold text-slate-900">Monitoring Perkembangan Membaca Al-Qur&apos;an</h2>
            <p className="text-xs text-slate-500">
              Evaluasi berkala guru pembimbing berbasis rubrik 6 aspek pembelajaran Al-Qur&apos;an.
            </p>
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
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingShelter ? 'Edit Data Shelter' : 'Tambah Titik Shelter Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Tentukan koordinat GPS dan radius kehadiran agar driver dapat presensi secara otomatis
            </p>

            <form onSubmit={handleSaveShelter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Shelter</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Shelter Tebet Timur / Shelter Palmerah"
                  value={shelterName}
                  onChange={(e) => setShelterName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jl. Tebet Raya No. 45, Tebet Timur, Jakarta Selatan"
                  value={shelterAddress}
                  onChange={(e) => setShelterAddress(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={shelterLat}
                    onChange={(e) => setShelterLat(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={shelterLng}
                    onChange={(e) => setShelterLng(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Radius (Meter)</label>
                  <input
                    type="number"
                    required
                    value={shelterRadius}
                    onChange={(e) => setShelterRadius(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-bold text-purple-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Lokasi</label>
                <input
                  type="text"
                  placeholder="Contoh: Dekat musholla transit driver ojol"
                  value={shelterNotes}
                  onChange={(e) => setShelterNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowShelterModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-700 text-white hover:bg-purple-800 shadow-md"
                >
                  Simpan Shelter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TEACHER CREATE */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Pendaftaran Guru Mengaji (Ustadz)</h3>
            <p className="text-xs text-slate-500 mb-4">Buat akun guru dan tetapkan penempatan shelter</p>

            <form onSubmit={handleSaveTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap &amp; Gelar</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ust. Ahmad Fauzi, S.Q."
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Login</label>
                  <input
                    type="email"
                    required
                    placeholder="guru@ojolmengaji.id"
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0813-xxxx-xxxx"
                    value={teacherPhone}
                    onChange={(e) => setTeacherPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Spesialisasi Bimbingan</label>
                <input
                  type="text"
                  placeholder="Contoh: Tahsin Makharijul Huruf &amp; Talaqqi"
                  value={teacherSpec}
                  onChange={(e) => setTeacherSpec(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Penempatan Shelter</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-3">
                  {shelters.map(s => {
                    const isChecked = teacherSelectedShelters.includes(s.id);
                    return (
                      <label key={s.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
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

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowTeacherModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-700 text-white hover:bg-purple-800 shadow-md"
                >
                  Daftarkan Guru
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
    </div>
  );
};
