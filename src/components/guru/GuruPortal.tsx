'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  GraduationCap, 
  Users, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  Plus, 
  Search, 
  AlertCircle, 
  TrendingUp, 
  Check, 
  Sparkles, 
  X,
  Shield,
  Building
} from 'lucide-react';
import { 
  Participant, 
  ParticipantLevel, 
  LEVEL_OPTIONS, 
  RubricScores, 
  AttendanceStatus 
} from '@/types';

export const GuruPortal: React.FC = () => {
  const { 
    currentUser, 
    teachers, 
    shelters, 
    participants, 
    schedules, 
    attendance, 
    assessments, 
    recordAttendance, 
    correctAttendance, 
    addAssessment, 
    getParticipantAttendanceStats, 
    updateParticipantLevel 
  } = useApp();

  // Find active teacher profile
  // If currentUser is guru, strictly match userId
  // If currentUser is admin, simulate first teacher or selected
  const currentGuru = teachers.find(t => t.userId === currentUser?.id);
  const teacher = currentGuru || (currentUser?.role === 'admin' ? teachers[0] : null);

  // Filter shelters explicitly assigned to this teacher by Admin
  const myShelterIds = teacher?.shelterIds || [];
  const myShelters = shelters.filter(s => myShelterIds.includes(s.id));

  // Participants belonging ONLY to this teacher's assigned shelters
  const myParticipants = participants.filter(p => myShelterIds.includes(p.shelterId));
  const myParticipantIds = new Set(myParticipants.map(p => p.id));
  const mySchedules = schedules.filter(s => myShelterIds.includes(s.shelterId));

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'peserta' | 'presensi' | 'penilaian' | 'laporan'>('dashboard');

  // Filter shelter selection ('all' or specific shelterId from myShelterIds)
  const [selectedShelterId, setSelectedShelterId] = useState<string>('all');
  const activeShelterId = (selectedShelterId !== 'all' && myShelterIds.includes(selectedShelterId))
    ? selectedShelterId
    : 'all';

  // Search participant
  const [searchQuery, setSearchQuery] = useState('');

  // Participants strictly filtered by active shelter and search query
  const filteredParticipants = myParticipants.filter(p => {
    const matchShelter = activeShelterId === 'all' ? true : p.shelterId === activeShelterId;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (p.vehiclePlate && p.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (p.nik && p.nik.includes(searchQuery));
    return matchShelter && matchSearch;
  });

  // Count unassessed participants in this teacher's shelters
  const unassessedParticipants = myParticipants.filter(p => p.currentLevel === 'Belum Dinilai');

  // Assessments for participants belonging to this teacher's shelters
  const myAssessments = assessments.filter(a => {
    const part = participants.find(p => p.id === a.participantId);
    if (!part) return false;
    const inMyShelters = myShelterIds.includes(part.shelterId);
    const matchShelter = activeShelterId === 'all' || part.shelterId === activeShelterId;
    return inMyShelters && matchShelter;
  });

  // Attendance for participants in this teacher's shelters
  const myAttendance = attendance
    .filter(a => myShelterIds.includes(a.shelterId))
    .filter(a => activeShelterId === 'all' || a.shelterId === activeShelterId)
    .filter(a => myParticipantIds.has(a.participantId));

  // Assessment Modal state
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [evalParticipantId, setEvalParticipantId] = useState<string>('');
  const [evalAssignedLevel, setEvalAssignedLevel] = useState<ParticipantLevel>('Iqro 1-3');
  const [evalMaterial, setEvalMaterial] = useState('');
  const [evalScores, setEvalScores] = useState<RubricScores>({
    hijaiyah: 3,
    harakat: 3,
    kelancaran: 3,
    tajwid: 3,
    makhraj: 3,
    kemandirian: 3,
  });
  const [evalStrengths, setEvalStrengths] = useState('');
  const [evalImprovements, setEvalImprovements] = useState('');
  const [evalRecommendations, setEvalRecommendations] = useState('');

  // Dedicated Level Assessment Modal state
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [selectedParticipantForLevel, setSelectedParticipantForLevel] = useState<Participant | null>(null);
  const [newAssignedLevel, setNewAssignedLevel] = useState<ParticipantLevel>('Iqro 1-3');
  const [levelEvaluationNote, setLevelEvaluationNote] = useState('');

  // Manual Attendance modal state
  const [manualAttModal, setManualAttModal] = useState(false);
  const [manualShelterId, setManualShelterId] = useState<string>('');
  const [manualPartId, setManualPartId] = useState<string>('');
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('hadir');
  const [manualNotes, setManualNotes] = useState('');

  // Open Assessment Modal safely for a driver
  const handleOpenAssessmentModal = (participantId?: string) => {
    if (myParticipants.length === 0) {
      alert('Belum ada pengemudi ojol yang terdaftar di shelter binaan Anda.');
      return;
    }
    const targetId = (participantId && myParticipantIds.has(participantId))
      ? participantId
      : myParticipants[0].id;

    setEvalParticipantId(targetId);
    const targetPart = myParticipants.find(p => p.id === targetId);
    setEvalAssignedLevel(targetPart && targetPart.currentLevel !== 'Belum Dinilai' ? targetPart.currentLevel : 'Iqro 1-3');
    setShowAssessmentModal(true);
  };

  // Open Level Modal safely
  const handleOpenLevelModal = (target?: Participant) => {
    const candidate = target || unassessedParticipants[0] || myParticipants[0];
    if (!candidate || !myParticipantIds.has(candidate.id)) {
      alert('Belum ada driver ojol binaan yang dapat dinilai.');
      return;
    }
    setSelectedParticipantForLevel(candidate);
    setNewAssignedLevel(candidate.currentLevel === 'Belum Dinilai' ? 'Iqro 1-3' : candidate.currentLevel);
    setLevelEvaluationNote('');
    setShowLevelModal(true);
  };

  // Open Manual Attendance Modal safely
  const handleOpenManualAttendanceModal = () => {
    if (myShelters.length === 0) {
      alert('Anda belum ditugaskan di shelter manapun oleh admin.');
      return;
    }
    const initialShId = (activeShelterId !== 'all' && myShelterIds.includes(activeShelterId))
      ? activeShelterId
      : myShelters[0].id;

    setManualShelterId(initialShId);
    const partsInSh = myParticipants.filter(p => p.shelterId === initialShId);
    setManualPartId(partsInSh[0]?.id || '');
    setManualStatus('hadir');
    setManualNotes('');
    setManualAttModal(true);
  };

  // When shelter selection changes inside the manual attendance modal
  const handleManualShelterChange = (newShId: string) => {
    setManualShelterId(newShId);
    const partsInSh = myParticipants.filter(p => p.shelterId === newShId);
    setManualPartId(partsInSh[0]?.id || '');
  };

  // Handle Save Assessment
  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher || !evalParticipantId || !evalMaterial) return;

    const targetPart = myParticipants.find(p => p.id === evalParticipantId);
    if (!targetPart) {
      alert('Akses dibatasi: Driver yang dinilai harus terdaftar di shelter binaan Anda.');
      return;
    }

    addAssessment({
      participantId: evalParticipantId,
      teacherId: teacher.id,
      assessmentDate: new Date().toISOString().substring(0, 10),
      material: evalMaterial,
      scores: evalScores,
      assessedLevel: evalAssignedLevel,
      strengths: evalStrengths || 'Pemahaman huruf dan tanda baca sudah baik.',
      improvements: evalImprovements || 'Perhatikan dengung ghunnah dan panjang mad thabi\'i.',
      recommendations: evalRecommendations || 'Luangkan 10 menit sehabis Subuh untuk membaca mandiri.',
      isPublished: true,
    });

    setShowAssessmentModal(false);
    setEvalMaterial('');
    setEvalStrengths('');
    setEvalImprovements('');
    setEvalRecommendations('');
    alert(`Alhamdulillah! Nilai evaluasi membaca & penetapan tingkat (${evalAssignedLevel}) untuk ${targetPart.name} berhasil disimpan dan dipublikasikan!`);
  };

  // Handle Save Direct Level Assessment
  const handleSaveLevelAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipantForLevel || !myParticipantIds.has(selectedParticipantForLevel.id)) {
      alert('Akses dibatasi: Driver harus terdaftar di shelter binaan Anda.');
      return;
    }

    updateParticipantLevel(
      selectedParticipantForLevel.id,
      newAssignedLevel,
      levelEvaluationNote.trim() || undefined
    );

    setShowLevelModal(false);
    alert(`Alhamdulillah! Tingkat kemampuan mengaji untuk ${selectedParticipantForLevel.name} berhasil ditetapkan sebagai "${newAssignedLevel}".`);
  };

  // Handle Manual Attendance
  const handleSaveManualAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;
    
    // Verify driver is registered in the selected shelter and belongs to teacher's shelters
    const validDriver = myParticipants.find(p => p.id === manualPartId && p.shelterId === manualShelterId);
    if (!validDriver) {
      alert('Akses dibatasi: Driver yang dipilih harus terdaftar di shelter yang bersangkutan.');
      return;
    }

    recordAttendance(
      manualPartId,
      manualShelterId,
      'manual',
      manualStatus,
      0,
      `Verifikasi manual oleh guru ${teacher.name}. ${manualNotes}`
    );
    setManualAttModal(false);
    setManualNotes('');
    alert(`Presensi manual untuk ${validDriver.name} di shelter ${shelters.find(s => s.id === manualShelterId)?.name} berhasil dicatat!`);
  };

  const renderScoreButtons = (aspect: keyof RubricScores, currentVal: number) => {
    const levels = [
      { val: 1, label: '1 - Bimbingan' },
      { val: 2, label: '2 - Berkembang' },
      { val: 3, label: '3 - Baik' },
      { val: 4, label: '4 - Sangat Baik' },
    ];
    return (
      <div className="grid grid-cols-4 gap-1.5 mt-1">
        {levels.map(lvl => (
          <button
            key={lvl.val}
            type="button"
            onClick={() => setEvalScores(prev => ({ ...prev, [aspect]: lvl.val }))}
            className={`py-1.5 px-1 rounded-lg text-xs font-semibold text-center transition-all ${
              currentVal === lvl.val
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {lvl.label}
          </button>
        ))}
      </div>
    );
  };

  // If teacher profile is not found
  if (!teacher) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto ring-4 ring-rose-50">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Profil Dewan Guru Belum Terdaftar</h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Akun <strong>{currentUser?.name || 'Anda'}</strong> belum terhubung dengan data profil Dewan Guru aktif di sistem.
          </p>
          <p className="text-xs text-slate-500">
            Silakan hubungi Administrator Sistem (admin@ojolmengaji.id) untuk aktivasi dan penugasan shelter bimbingan.
          </p>
        </div>
      </div>
    );
  }

  // If admin has NOT assigned any shelters to this teacher yet
  if (myShelters.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <img
              src={teacher.avatar}
              alt={teacher.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-200 border border-emerald-700/50 mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
                Dewan Guru Mengaji
              </div>
              <h1 className="text-xl sm:text-2xl font-bold">{teacher.name}</h1>
              <p className="text-xs sm:text-sm text-emerald-200 mt-0.5">
                Spesialisasi: {teacher.specialization}
              </p>
            </div>
          </div>
        </div>

        {/* Warning / Explanation Card */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto ring-4 ring-amber-100/50">
            <AlertCircle className="w-7 h-7 text-amber-700" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-amber-950">
              Belum Ada Shelter Binaan yang Ditugaskan oleh Admin
            </h3>
            <p className="text-xs sm:text-sm text-amber-900 mt-2 max-w-xl mx-auto leading-relaxed">
              Assalamu&apos;alaikum <strong>{teacher.name}</strong>. Sesuai kebijakan hak akses sistem, Guru hanya dapat melihat shelter yang ditunjuk langsung oleh Administrator serta para pengemudi ojol yang mendaftar di shelter tersebut.
            </p>
            <p className="text-xs text-amber-800 mt-2 font-medium">
              Saat ini akun Anda belum memiliki shelter binaan aktif. Silakan hubungi Administrator Pusat agar shelter bimbingan dapat segera ditugaskan ke akun Anda.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Teacher Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={teacher.avatar}
              alt={teacher.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-lg ring-4 ring-emerald-500/20"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-200 border border-emerald-700/50 mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
                Ustadz Pengampu Shelter Binaan
              </div>
              <h1 className="text-xl sm:text-2xl font-bold">{teacher.name}</h1>
              <p className="text-xs sm:text-sm text-emerald-200 mt-0.5">
                Spesialisasi: {teacher.specialization}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {myShelters.map(s => {
                  const partCount = myParticipants.filter(p => p.shelterId === s.id).length;
                  return (
                    <span key={s.id} className="text-[11px] font-medium bg-emerald-950/70 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-800 flex items-center gap-1.5 shadow-2xs">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span className="font-bold">{s.name}</span>
                      <span className="text-[10px] bg-emerald-900 text-emerald-200 px-1.5 py-0.2 rounded-full border border-emerald-700">
                        {partCount} Ojol
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:self-center">
            <button
              onClick={() => handleOpenLevelModal()}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Nilai Level Ojol</span>
            </button>
            <button
              onClick={() => handleOpenAssessmentModal()}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              <span>Input Penilaian Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shelter Scope Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold border border-emerald-100">
            <MapPin className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Filter Shelter Penugasan Admin:</span>
              <span className="px-2 py-0.5 text-[10px] rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {myShelters.length} Shelter Ditunjuk
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {activeShelterId === 'all'
                ? `Menampilkan seluruh ${myParticipants.length} pengemudi ojol di ${myShelters.length} shelter binaan Anda.`
                : `Menampilkan hanya pengemudi ojol di ${myShelters.find(s => s.id === activeShelterId)?.name} (${myParticipants.filter(p => p.shelterId === activeShelterId).length} ojol).`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="Filter berdasarkan shelter binaan"
            value={activeShelterId}
            onChange={(e) => setSelectedShelterId(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50/50 text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
          >
            <option value="all">Semua Shelter Ditunjuk ({myShelters.length} Shelter • {myParticipants.length} Ojol)</option>
            {myShelters.map(s => {
              const count = myParticipants.filter(p => p.shelterId === s.id).length;
              return (
                <option key={s.id} value={s.id}>
                  {s.name} ({count} Ojol)
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none border-b border-slate-200">
        {[
          { id: 'dashboard', label: 'Ringkasan Kelas', icon: TrendingUp },
          { id: 'peserta', label: 'Daftar Peserta Ojol', icon: Users, badge: filteredParticipants.length },
          { id: 'presensi', label: 'Presensi Sesi', icon: CheckCircle2, badge: myAttendance.length },
          { id: 'penilaian', label: 'Rubrik Evaluasi Al-Qur\'an', icon: Award, badge: myAssessments.length },
          { id: 'laporan', label: 'Rekap Kehadiran Binaan', icon: Calendar, badge: filteredParticipants.length },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.id ? 'bg-emerald-900 text-emerald-200' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase">Total Peserta Binaan</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{myParticipants.length} Driver</div>
              <p className="text-xs text-slate-500 mt-1">Terdaftar di {myShelters.length} shelter yang ditunjuk admin</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase">Jadwal Sesi Shelter Anda</span>
                <Calendar className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">{mySchedules.length} Sesi</div>
              <p className="text-xs text-slate-500 mt-1">Halaqah mengaji di shelter binaan</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase">Evaluasi Al-Qur&apos;an</span>
                <Award className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-purple-700">
                {myAssessments.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Driver di shelter Anda telah dinilai</p>
            </div>
          </div>

          {/* Unassessed Drivers Alert Banner */}
          {unassessedParticipants.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                  <Sparkles className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                    <span>Ada {unassessedParticipants.length} pengemudi baru di shelter Anda yang belum dinilai tingkat kemampuannya!</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                      Perlu Penilaian
                    </span>
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Lakukan tes talaqqi ramah di shelter binaan untuk menentukan level (Iqro 1-3, Iqro 4-6, Al-Qur&apos;an Dasar, atau Tahsin/Tajwid).
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleOpenLevelModal(unassessedParticipants[0])}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-colors whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Tentukan Level Sekarang</span>
              </button>
            </div>
          )}

          {/* Teacher Schedules & Teaching Sessions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Jadwal Mengajar Anda
              </h3>

              {mySchedules.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                  Belum ada jadwal sesi yang dijadwalkan di shelter binaan Anda.
                </div>
              ) : (
                <div className="space-y-3">
                  {mySchedules
                    .filter(sched => activeShelterId === 'all' || sched.shelterId === activeShelterId)
                    .map(sched => {
                      const sh = shelters.find(s => s.id === sched.shelterId);
                      return (
                        <div key={sched.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">{sched.dayName}</span>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {sched.startTime} - {sched.endTime} WIB
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-amber-500" />
                              <span>{sh?.name}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1 font-medium">{sched.topic}</div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedShelterId(sched.shelterId);
                              setActiveTab('presensi');
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                          >
                            Buka Sesi
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Quick List of Driver Progress */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Perkembangan Bacaan Terkini Peserta
              </h3>

              {filteredParticipants.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                  Belum ada peserta ojol di shelter ini.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredParticipants.slice(0, 5).map(part => {
                    const ev = assessments.find(a => a.participantId === part.id);
                    return (
                      <div key={part.id} className="py-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <img src={part.avatar} alt={part.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                          <div>
                            <div className="font-bold text-xs text-slate-900">{part.name} ({part.ojolPlatform})</div>
                            <div className="text-[11px] flex items-center gap-1.5 mt-0.5">
                              <span className="text-slate-500">Tingkat:</span>
                              <span className={`px-2 py-0.2 rounded text-[10px] font-bold border ${
                                part.currentLevel === 'Belum Dinilai'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              }`}>
                                {part.currentLevel}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-2">
                          {ev ? (
                            <div className="hidden sm:block">
                              <span className="text-xs font-bold text-emerald-700">{ev.material}</span>
                              <div className="text-[10px] text-slate-400">Dinilai {ev.assessmentDate}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic hidden sm:inline">Belum dinilai</span>
                          )}

                          <button
                            onClick={() => handleOpenLevelModal(part)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors flex items-center gap-1 ${
                              part.currentLevel === 'Belum Dinilai'
                                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-600 shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                            }`}
                            title="Tentukan Tingkat Kemampuan Mengaji"
                          >
                            <Sparkles className="w-3 h-3 text-current" />
                            <span>{part.currentLevel === 'Belum Dinilai' ? 'Nilai Level' : 'Ubah'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DAFTAR PESERTA OJOL */}
      {activeTab === 'peserta' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Peserta Binaan Anda</h2>
              <p className="text-xs text-slate-500">
                Sesuai penugasan Admin, Anda hanya dapat melihat driver yang mendaftar di: {myShelters.map(s => s.name).join(', ')}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari driver / plat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44"
                />
              </div>

              <select
                aria-label="Filter berdasarkan shelter binaan"
                value={activeShelterId}
                onChange={(e) => setSelectedShelterId(e.target.value)}
                className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="all">Semua Shelter Ditunjuk ({myShelters.length})</option>
                {myShelters.map(s => {
                  const count = myParticipants.filter(p => p.shelterId === s.id).length;
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} ({count} Ojol)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {filteredParticipants.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-sm text-slate-700">Tidak Ada Pengemudi Ojol Ditemukan</h4>
              <p className="text-xs text-slate-500">
                {searchQuery 
                  ? `Tidak ada pengemudi yang cocok dengan kata kunci "${searchQuery}".`
                  : 'Belum ada pengemudi ojol yang terdaftar pada shelter binaan yang dipilih.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Driver Peserta</th>
                    <th className="py-3 px-4">Shelter Terdaftar</th>
                    <th className="py-3 px-4">Tingkat Kemampuan</th>
                    <th className="py-3 px-4 text-center">Kehadiran (%)</th>
                    <th className="py-3 px-4 text-right">Aksi Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredParticipants.map(part => {
                    const sh = shelters.find(s => s.id === part.shelterId);
                    const { attendedSessions, totalSessions, rate } = getParticipantAttendanceStats(part.id);

                    return (
                      <tr key={part.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img src={part.avatar} alt={part.name} className="w-9 h-9 rounded-xl object-cover" />
                            <div>
                              <div className="font-bold text-slate-900">{part.name}</div>
                              <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
                                <span className="font-semibold text-emerald-700">{part.ojolPlatform}</span>
                                <span>•</span>
                                <span>{part.vehiclePlate}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-700 font-medium">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{sh?.name}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border inline-flex items-center gap-1.5 ${
                            part.currentLevel === 'Belum Dinilai'
                              ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {part.currentLevel === 'Belum Dinilai' && (
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            )}
                            <span>{part.currentLevel}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className={`font-bold ${rate >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {rate}%
                          </span>
                          <div className="text-[10px] text-slate-400">({attendedSessions}/{totalSessions} sesi)</div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenLevelModal(part)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 transition-all ${
                                part.currentLevel === 'Belum Dinilai'
                                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-500 shadow-sm ring-2 ring-amber-300/40'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                              }`}
                              title="Penilaian Tingkat Kemampuan Mengaji Driver"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-current" />
                              <span>{part.currentLevel === 'Belum Dinilai' ? 'Tentukan Level' : 'Ubah Level'}</span>
                            </button>

                            <button
                              onClick={() => handleOpenAssessmentModal(part.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold border border-emerald-200 flex items-center gap-1"
                            >
                              <Award className="w-3 h-3" />
                              <span>Beri Nilai</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PRESENSI SESI KELAS */}
      {activeTab === 'presensi' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Kelola Presensi Sesi Binaan</h2>
              <p className="text-xs text-slate-500">
                Presensi pengemudi ojol yang mendaftar di {activeShelterId === 'all' ? `${myShelters.length} shelter binaan Anda` : myShelters.find(s => s.id === activeShelterId)?.name}.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <select
                aria-label="Filter presensi berdasarkan shelter"
                value={activeShelterId}
                onChange={(e) => setSelectedShelterId(e.target.value)}
                className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="all">Semua Shelter Ditunjuk ({myShelters.length})</option>
                {myShelters.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <button
                onClick={handleOpenManualAttendanceModal}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Input Presensi Manual Guru</span>
              </button>
            </div>
          </div>

          {/* List of Recent Attendance for this Teacher's Shelters */}
          {myAttendance.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-sm text-slate-700">Belum Ada Riwayat Presensi</h4>
              <p className="text-xs text-slate-500">
                Belum ada driver yang melakukan presensi di shelter binaan ini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Tanggal &amp; Waktu</th>
                    <th className="py-3 px-4">Peserta Ojol</th>
                    <th className="py-3 px-4">Shelter</th>
                    <th className="py-3 px-4">Metode Validasi</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Koreksi Guru</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myAttendance.map(record => {
                    const part = participants.find(p => p.id === record.participantId);
                    const sh = shelters.find(s => s.id === record.shelterId);

                    return (
                      <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{record.sessionDate}</div>
                          <div className="text-slate-400 text-[11px]">{record.checkInTime}</div>
                        </td>

                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {part?.name} ({part?.ojolPlatform})
                        </td>

                        <td className="py-3 px-4 text-slate-600">
                          {sh?.name}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold uppercase text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
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
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                const reason = prompt('Masukkan alasan koreksi ke Hadir:');
                                if (reason) correctAttendance(record.id, 'hadir', reason);
                              }}
                              className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 text-[11px]"
                            >
                              Hadir
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Masukkan alasan koreksi ke Izin/Sakit:');
                                if (reason) correctAttendance(record.id, 'izin', reason);
                              }}
                              className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 text-[11px]"
                            >
                              Izin
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: RUBRIK EVALUASI AL-QUR'AN */}
      {activeTab === 'penilaian' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Rubrik Evaluasi Al-Qur&apos;an (Skala 1–4)</h2>
              <p className="text-xs text-slate-500">
                Hasil evaluasi membaca pengemudi ojol yang mendaftar di shelter binaan Anda.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <select
                aria-label="Filter penilaian berdasarkan shelter"
                value={activeShelterId}
                onChange={(e) => setSelectedShelterId(e.target.value)}
                className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="all">Semua Shelter Ditunjuk ({myShelters.length})</option>
                {myShelters.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <button
                onClick={() => handleOpenLevelModal()}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-xs transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Penilaian Level Driver</span>
              </button>

              <button
                onClick={() => handleOpenAssessmentModal()}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Input Penilaian Baru</span>
              </button>
            </div>
          </div>

          {/* Assessment Cards */}
          {myAssessments.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <Award className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-sm text-slate-700">Belum Ada Evaluasi Bacaan</h4>
              <p className="text-xs text-slate-500">
                Belum ada evaluasi membaca Al-Qur&apos;an untuk peserta ojol di shelter binaan ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAssessments.map(evalItem => {
                const part = participants.find(p => p.id === evalItem.participantId);
                const sh = shelters.find(s => s.id === part?.shelterId);
                return (
                  <div key={evalItem.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={part?.avatar} alt={part?.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{part?.name}</h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span>{evalItem.assessmentDate}</span>
                            <span>•</span>
                            <span className="font-semibold text-emerald-700">{part?.currentLevel}</span>
                            <span>•</span>
                            <span className="text-slate-600 font-medium">{sh?.name}</span>
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        {evalItem.material}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block">Tajwid:</span>
                        <span className="font-bold text-slate-800">{evalItem.scores.tajwid}/4</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block">Makhraj:</span>
                        <span className="font-bold text-slate-800">{evalItem.scores.makhraj}/4</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block">Kelancaran:</span>
                        <span className="font-bold text-slate-800">{evalItem.scores.kelancaran}/4</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800 block mb-0.5">Catatan Ustadz:</span>
                      <p className="line-clamp-2">{evalItem.strengths}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: LAPORAN REKAP KEHADIRAN */}
      {activeTab === 'laporan' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Rekap Kehadiran Peserta Binaan</h2>
              <p className="text-xs text-slate-500">
                Rekapitulasi kehadiran khusus pengemudi ojol yang mendaftar di shelter binaan Anda.
              </p>
            </div>

            <select
              aria-label="Filter laporan berdasarkan shelter"
              value={activeShelterId}
              onChange={(e) => setSelectedShelterId(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-white font-medium self-start sm:self-auto"
            >
              <option value="all">Semua Shelter Ditunjuk ({myShelters.length})</option>
              {myShelters.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {filteredParticipants.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-sm text-slate-700">Belum Ada Peserta untuk Direkap</h4>
              <p className="text-xs text-slate-500">
                Belum ada pengemudi ojol yang terdaftar pada shelter ini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Nama Peserta</th>
                    <th className="py-3 px-4">Shelter Terdaftar</th>
                    <th className="py-3 px-4 text-center">Sesi Hadir</th>
                    <th className="py-3 px-4 text-center">Total Sesi Wajib</th>
                    <th className="py-3 px-4 text-center">Persentase</th>
                    <th className="py-3 px-4 text-center">Status Keaktifan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredParticipants.map(part => {
                    const sh = shelters.find(s => s.id === part.shelterId);
                    const { attendedSessions, totalSessions, rate } = getParticipantAttendanceStats(part.id);

                    return (
                      <tr key={part.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {part.name} ({part.ojolPlatform})
                        </td>
                        <td className="py-3 px-4 text-slate-600">{sh?.name}</td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-700">{attendedSessions}</td>
                        <td className="py-3 px-4 text-center font-medium text-slate-500">{totalSessions}</td>
                        <td className="py-3 px-4 text-center font-extrabold text-sm">
                          <span className={rate >= 75 ? 'text-emerald-600' : 'text-rose-600'}>{rate}%</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rate >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {rate >= 75 ? 'Aktif & Konsisten' : 'Perlu Pendampingan'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: INPUT PENILAIAN 6 ASPEK */}
      {showAssessmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Formulir Penilaian Membaca Al-Qur&apos;an</h3>
            <p className="text-xs text-slate-500 mb-4">
              Isi nilai 6 aspek rubrik pembelajaran (skala 1–4) khusus untuk peserta di shelter binaan Anda.
            </p>

            <form onSubmit={handleSaveAssessment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Peserta Ojol Binaan</label>
                  <select
                    value={evalParticipantId}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setEvalParticipantId(newId);
                      const p = myParticipants.find(part => part.id === newId);
                      if (p && p.currentLevel !== 'Belum Dinilai') {
                        setEvalAssignedLevel(p.currentLevel);
                      }
                    }}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                  >
                    {myShelters.map(sh => {
                      const shParts = myParticipants.filter(p => p.shelterId === sh.id);
                      if (shParts.length === 0) return null;
                      return (
                        <optgroup key={sh.id} label={`Shelter: ${sh.name}`}>
                          {shParts.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.ojolPlatform} - {p.vehiclePlate}) - {p.currentLevel}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Materi / Surah Diuji</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Surah Al-Mulk ayat 1-10 / Iqro 5"
                    value={evalMaterial}
                    onChange={(e) => setEvalMaterial(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Tingkat Kemampuan Mengaji Driver */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tingkat Kemampuan Mengaji Driver (Penilaian Guru)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Tentukan / sesuaikan jenjang pembelajaran driver berdasarkan bacaan saat ini:
                    </p>
                  </div>
                  {(() => {
                    const currentPart = myParticipants.find(p => p.id === evalParticipantId);
                    return (
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${
                        currentPart?.currentLevel === 'Belum Dinilai'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}>
                        Level Saat Ini: {currentPart?.currentLevel || 'Belum Dinilai'}
                      </span>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {LEVEL_OPTIONS.map((lvl) => {
                    const isSelected = evalAssignedLevel === lvl.id;
                    return (
                      <div
                        key={lvl.id}
                        onClick={() => setEvalAssignedLevel(lvl.id)}
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

              {/* 6 Rubric Selectors */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Rubrik 6 Aspek Bacaan (1: Perlu Bimbingan, 2: Berkembang, 3: Baik, 4: Sangat Baik)
                </h4>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-700">1. Pengenalan Huruf Hijaiyah</span>
                    {renderScoreButtons('hijaiyah', evalScores.hijaiyah)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-700">2. Harakat &amp; Rangkaian Huruf Sambung</span>
                    {renderScoreButtons('harakat', evalScores.harakat)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-700">3. Kelancaran Membaca</span>
                    {renderScoreButtons('kelancaran', evalScores.kelancaran)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-700">4. Tajwid Dasar (Panjang Pendek &amp; Dengung)</span>
                    {renderScoreButtons('tajwid', evalScores.tajwid)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-700">5. Makhraj &amp; Pelafalan Huruf</span>
                    {renderScoreButtons('makhraj', evalScores.makhraj)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-700">6. Kemandirian Membaca (Tanpa Ditalqin)</span>
                    {renderScoreButtons('kemandirian', evalScores.kemandirian)}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kelebihan / Kemajuan Peserta</label>
                  <textarea
                    rows={2}
                    value={evalStrengths}
                    onChange={(e) => setEvalStrengths(e.target.value)}
                    placeholder="Contoh: Makhraj huruf 'Ain dan Ha sudah fasih, pelafalan mantap..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hal yang Perlu Diperbaiki</label>
                  <textarea
                    rows={2}
                    value={evalImprovements}
                    onChange={(e) => setEvalImprovements(e.target.value)}
                    placeholder="Contoh: Ghunnah pada nun bertasydid mohon ditahan 2 harakat..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rekomendasi Latihan di Rumah/Shelter</label>
                  <input
                    type="text"
                    value={evalRecommendations}
                    onChange={(e) => setEvalRecommendations(e.target.value)}
                    placeholder="Contoh: Ulangi ayat 5-8 sebanyak 3x di shelter saat santai..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAssessmentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                >
                  Simpan &amp; Publikasikan ke Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PENILAIAN TINGKAT KEMAMPUAN MENGAJI DRIVER */}
      {showLevelModal && selectedParticipantForLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl my-8 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Penilaian Tingkat Kemampuan Mengaji Driver
                  </h3>
                  <p className="text-xs text-slate-500">
                    Uji kemampuan membaca Al-Qur&apos;an &amp; tetapkan jenjang belajar ojol binaan
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowLevelModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLevelAssessment} className="space-y-4">
              {/* Driver Summary Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedParticipantForLevel.avatar}
                    alt={selectedParticipantForLevel.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/20"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {selectedParticipantForLevel.name}
                    </h4>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span className="font-semibold text-emerald-700">{selectedParticipantForLevel.ojolPlatform}</span>
                      <span>•</span>
                      <span>{selectedParticipantForLevel.vehiclePlate}</span>
                      <span>•</span>
                      <span className="text-slate-700 font-medium">
                        {shelters.find(s => s.id === selectedParticipantForLevel.shelterId)?.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Level Saat Ini</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    selectedParticipantForLevel.currentLevel === 'Belum Dinilai'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}>
                    {selectedParticipantForLevel.currentLevel}
                  </span>
                </div>
              </div>

              {/* 4 Cards: Tingkat Kemampuan Mengaji */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Pilih Tingkat Kemampuan Mengaji Hasil Penilaian Ustadz:
                </label>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pilih perkiraan kemampuan membaca Al-Qur&apos;an peserta berdasarkan hasil tes bacaan / talaqqi di shelter:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {LEVEL_OPTIONS.map((lvl) => {
                    const isSelected = newAssignedLevel === lvl.id;
                    return (
                      <div
                        key={lvl.id}
                        onClick={() => setNewAssignedLevel(lvl.id)}
                        className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/30'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{lvl.icon}</span>
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

              {/* Catatan Observasi Guru */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Hasil Tes / Observasi Guru (Opsional)
                </label>
                <input
                  type="text"
                  value={levelEvaluationNote}
                  onChange={(e) => setLevelEvaluationNote(e.target.value)}
                  placeholder="Contoh: Sudah hafal makhraj huruf dasar, ditempatkan di Iqro 4..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLevelModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan &amp; Tetapkan Tingkat Kemampuan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL ATTENDANCE GURU */}
      {manualAttModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Presensi Manual oleh Guru</h3>
            <p className="text-xs text-slate-500 mb-4">
              Gunakan saat peserta di shelter binaan Anda mengalami masalah sinyal GPS.
            </p>

            <form onSubmit={handleSaveManualAttendance} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Shelter Binaan</label>
                  <select
                    value={manualShelterId}
                    onChange={(e) => handleManualShelterChange(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-semibold"
                  >
                    {myShelters.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Kehadiran</label>
                  <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-bold"
                  >
                    <option value="hadir">Hadir</option>
                    <option value="terlambat">Terlambat</option>
                    <option value="izin">Izin</option>
                    <option value="sakit">Sakit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Peserta Ojol (Terdaftar di Shelter Ini)
                </label>
                {(() => {
                  const shelterDrivers = myParticipants.filter(p => p.shelterId === manualShelterId);
                  if (shelterDrivers.length === 0) {
                    return (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                        Belum ada ojol yang mendaftar di shelter ini.
                      </div>
                    );
                  }
                  return (
                    <select
                      value={manualPartId}
                      onChange={(e) => setManualPartId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-semibold"
                    >
                      {shelterDrivers.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.ojolPlatform} - {p.vehiclePlate})
                        </option>
                      ))}
                    </select>
                  );
                })()}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan / Alasan Manual</label>
                <input
                  type="text"
                  placeholder="Contoh: Hadir di shelter, GPS ponsel driver sedang trouble"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setManualAttModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!myParticipants.some(p => p.shelterId === manualShelterId)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md disabled:opacity-50"
                >
                  Simpan Presensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
