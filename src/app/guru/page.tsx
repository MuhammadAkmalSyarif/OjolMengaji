'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { GuruPortal } from '@/components/guru/GuruPortal';
import { GuruAuth } from '@/components/guru/GuruAuth';
import { 
  GraduationCap, 
  RotateCcw, 
  ArrowLeft, 
  BookOpen, 
  LogOut,
  Sparkles
} from 'lucide-react';

export default function GuruPage() {
  const { 
    currentUser, 
    users, 
    teachers, 
    shelters, 
    switchUser, 
    logout,
    resetAllData 
  } = useApp();

  // Check if Guru (or Admin) is logged in
  const isGuruLoggedIn = Boolean(currentUser && (currentUser.role === 'guru' || currentUser.role === 'admin'));

  // Current active teacher
  const currentTeacher = teachers.find(t => t.userId === currentUser?.id) || (currentUser?.role === 'admin' ? teachers[0] : null);

  // If not logged in as guru/admin, show GuruAuth
  if (!isGuruLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100/70">
        <header className="bg-white border-b border-slate-200 shadow-xs py-3 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-800 p-0.5 shadow-sm">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-teal-700" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-base tracking-tight">
                    Ojol<span className="text-teal-600">Mengaji</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded border border-teal-200">
                    <GraduationCap className="w-2.5 h-2.5 text-teal-700" />
                    Portal Guru Mengaji
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex items-center justify-center">
          <GuruAuth />
        </main>

        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          <p>Portal Khusus Dewan Guru Mengaji (Ustadz) — Ojol Mengaji Platform</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Left: Brand & Guru Badge */}
            <div className="flex items-center gap-3">
              <Link 
                href="/guru" 
                className="flex items-center gap-2.5 group"
                title="Halaman Guru Mengaji (Ustadz)"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 via-emerald-700 to-indigo-800 p-0.5 shadow-sm group-hover:shadow-md transition-shadow">
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-teal-700" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                      Ojol<span className="text-teal-600">Mengaji</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-md border border-teal-200">
                      <GraduationCap className="w-3 h-3 text-teal-700" />
                      Portal Guru Mengaji
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 hidden sm:block">
                    Pusat Bimbingan, Evaluasi Tahsin 6 Aspek &amp; Presensi Mitra Driver
                  </p>
                </div>
              </Link>
            </div>

            {/* Right: Actions, Teacher Selector, Profile, and Logout */}
            <div className="flex items-center gap-2.5">
              {/* Reset Data Button */}
              <button
                onClick={() => {
                  if (confirm('Reset ulang seluruh data demo ke kondisi awal?')) {
                    resetAllData();
                  }
                }}
                title="Reset seluruh data ke awal"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Teacher Info or Admin Simulation Selector */}
              {currentUser?.role === 'admin' ? (
                <div className="hidden sm:flex items-center gap-2 bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-200 text-xs">
                  <span className="text-purple-800 font-semibold flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                    Simulasi Guru (Admin):
                  </span>
                  <select
                    value={currentUser?.id || ''}
                    onChange={(e) => switchUser(e.target.value)}
                    className="bg-transparent font-bold text-purple-950 focus:outline-none cursor-pointer"
                  >
                    {users.filter(u => u.role === 'guru').map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 text-xs">
                  <GraduationCap className="w-3.5 h-3.5 text-teal-700" />
                  <span className="font-bold text-teal-950">{currentUser?.name}</span>
                  <span className="text-teal-400">•</span>
                  <span className="text-teal-700 font-medium">
                    {currentTeacher?.shelterIds?.length 
                      ? `${currentTeacher.shelterIds.length} Shelter Ditunjuk Admin` 
                      : 'Belum Ada Penugasan Shelter'}
                  </span>
                </div>
              )}

              {/* Active User Avatar & Info */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {currentUser?.name || 'Ustadz Pembina'}
                  </div>
                  <div className="text-[10px] text-teal-700 font-medium">
                    Dewan Guru Mengaji
                  </div>
                </div>

                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                  alt={currentUser?.name || 'User'}
                  className="w-9 h-9 rounded-full border-2 border-teal-500 object-cover shadow-2xs ring-2 ring-teal-100"
                />

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Keluar dari portal dewan guru?')) {
                      logout();
                    }
                  }}
                  title="Keluar dari akun guru"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200 shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Keluar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <GuruPortal />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-teal-600" />
            <span className="font-semibold text-slate-700">Halaman Guru: Portal Dewan Guru Mengaji (Ustadz)</span>
            <span>—</span>
            <span>Mendampingi Pembinaan Al-Qur&apos;an Mitra Driver Ojol</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

