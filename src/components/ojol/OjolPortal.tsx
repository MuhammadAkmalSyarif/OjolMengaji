'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
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
  LogOut
} from 'lucide-react';

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
    getParticipantAttendanceStats
  } = useApp();

  // Find participant profile corresponding to current logged in user
  const participant = participants.find(p => p.userId === currentUser?.id) || participants[0];
  const shelter = shelters.find(s => s.id === participant.shelterId) || shelters[0];
  const participantSchedules = schedules.filter(s => s.shelterId === shelter.id);

  // States
  const [activeTab, setActiveTab] = useState<'beranda' | 'presensi' | 'progres' | 'pengumuman' | 'profil'>('beranda');
  
  // Interactive GPS & Presensi State
  const [gpsSimulatedDistance, setGpsSimulatedDistance] = useState<number>(18);
  const [isSimulatingGps, setIsSimulatingGps] = useState(false);
  const [presensiFeedback, setPresensiFeedback] = useState<{ success: boolean; message: string } | null>(null);

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
      // If within radius
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
          message: `Gagal: Posisi Anda (${gpsSimulatedDistance}m) di luar batas radius shelter (${shelter.radiusMeters}m). Harap mendekat ke shelter atau gunakan bantuan ustadz.`
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

  return (
    <div className="max-w-md mx-auto sm:max-w-4xl pb-24">
      {/* Mobile Driver Profile Card */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl mb-6 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-emerald-600/30 blur-xl pointer-events-none" />
        <div className="absolute right-6 top-6 text-emerald-400/20 pointer-events-none">
          <BookOpen className="w-24 h-24" />
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <img
              src={participant.avatar}
              alt={participant.name}
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
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight">{participant.name}</h1>
            <p className="text-xs sm:text-sm text-emerald-100 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">{shelter.name}</span>
            </p>
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

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-4 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Shelter Tujuan:</span>
                <span className="font-semibold text-slate-800">{shelter.name}</span>
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

            {/* GPS Distance Adjustment Slider for Demo Testing */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-600">Simulasi Jarak Driver:</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="5"
                  max="150"
                  value={gpsSimulatedDistance}
                  onChange={(e) => setGpsSimulatedDistance(Number(e.target.value))}
                  className="w-28 accent-emerald-600 cursor-pointer"
                />
                <span className="w-12 text-right font-mono font-bold text-slate-700">{gpsSimulatedDistance}m</span>
              </div>
            </div>
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
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 mb-5">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-950">{shelter.name}</h4>
                  <p className="text-xs text-emerald-800 mt-0.5">{shelter.address}</p>
                  <div className="flex gap-4 mt-2 text-xs font-semibold text-emerald-900">
                    <span>Koordinat: {shelter.latitude}, {shelter.longitude}</span>
                    <span>Radius Toleransi: {shelter.radiusMeters} meter</span>
                  </div>
                </div>
              </div>
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
                  <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PROFIL SAYA */}
      {activeTab === 'profil' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Profil Driver Peserta</h2>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Nama Lengkap</span>
                <span className="font-bold text-slate-800">{participant.name}</span>
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
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Shelter Binaan</span>
                <span className="font-bold text-slate-800">{shelter.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Level Pembelajaran</span>
                <span className={`font-bold ${participant.currentLevel === 'Belum Dinilai' ? 'text-amber-700' : 'text-emerald-800'}`}>
                  {participant.currentLevel === 'Belum Dinilai' ? 'Belum Dinilai (Menunggu Ustadz)' : participant.currentLevel}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Tanggal Bergabung</span>
                <span className="font-bold text-slate-800">{participant.joinedDate}</span>
              </div>
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
    </div>
  );
};

