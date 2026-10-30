'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { AdminPortal } from '@/components/admin/AdminPortal';
import { GuruPortal } from '@/components/guru/GuruPortal';
import { 
  Shield, 
  GraduationCap, 
  Bike, 
  RotateCcw, 
  ArrowLeft, 
  Sparkles,
  BookOpen, 
  Users, 
  MapPin, 
  CheckCircle2, 
  Volume2,
  FileCheck
} from 'lucide-react';
import { UserRole } from '@/types';

export default function AdminPage() {
  const { 
    currentUser, 
    users, 
    teachers, 
    submissions, 
    tasks, 
    shelters, 
    participants, 
    switchUser, 
    quickSwitchRole, 
    resetAllData 
  } = useApp();

  // Active module tab inside Admin: 'admin' | 'guru'
  const [managementTab, setManagementTab] = useState<'admin' | 'guru'>('admin');

  // Ensure current user is in management (admin or guru), default to admin if coming from ojol or not logged in
  useEffect(() => {
    if (!currentUser || currentUser.role === 'ojol') {
      const adminUser = users.find(u => u.role === 'admin') || users[0];
      if (adminUser) switchUser(adminUser.id);
    }
  }, [currentUser, users, switchUser]);

  // When managementTab switches, adjust currentUser accordingly if appropriate
  const handleTabChange = (tab: 'admin' | 'guru') => {
    setManagementTab(tab);
    if (tab === 'admin') {
      const adminUser = users.find(u => u.role === 'admin');
      if (adminUser) switchUser(adminUser.id);
    } else {
      const guruUser = users.find(u => u.role === 'guru');
      if (guruUser) switchUser(guruUser.id);
    }
  };

  // Find active teacher profile for guru view
  const currentTeacher = teachers.find(t => t.userId === currentUser.id) || teachers[0];

  // Count pending submissions waiting for review
  const pendingSubmissionsCount = submissions.filter(s => s.status === 'menunggu_pemeriksaan').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70">
      {/* Top Admin Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Left: Brand & Admin Badge */}
            <div className="flex items-center gap-3">
              <Link 
                href="/" 
                className="flex items-center gap-2.5 group"
                title="Kembali ke Halaman Peserta Ojol"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-800 p-0.5 shadow-sm group-hover:shadow-md transition-shadow">
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-emerald-700" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                      Ojol<span className="text-emerald-600">Mengaji</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md border border-purple-200">
                      <Shield className="w-3 h-3 text-purple-700" />
                      Portal Pengelola Terpadu
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 hidden sm:block">
                    Pusat Manajemen Operasional Administrator &amp; Guru Mengaji (Ustadz)
                  </p>
                </div>
              </Link>
            </div>

            {/* Right: Quick Navigation, Simulation User Selector & Profile */}
            <div className="flex items-center gap-2.5">
              {/* Back to Ojol Driver App Link */}
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs transition-colors"
                title="Buka Halaman Pengguna / Peserta Ojol"
              >
                <Bike className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden md:inline">Halaman Peserta Ojol</span>
                <span className="md:hidden">Mode Ojol</span>
                <ArrowLeft className="w-3 h-3 text-emerald-600 rotate-180" />
              </Link>

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

              {/* Active Admin / Guru User Selector */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-purple-700 font-medium">
                    {currentUser.role === 'admin' ? 'Administrator Pusat' : 'Guru Mengaji (Ustadz)'}
                  </div>
                </div>

                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full border-2 border-purple-500 object-cover shadow-2xs ring-2 ring-purple-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Combined Main Switcher Header */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Primary Toggle: Admin vs Guru Mengaji */}
            <div className="inline-flex p-1 rounded-xl bg-slate-200/80 border border-slate-300 shadow-inner">
              <button
                onClick={() => handleTabChange('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  managementTab === 'admin'
                    ? 'bg-purple-700 text-white shadow-md ring-2 ring-purple-300'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Portal Administrator Pusat</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  managementTab === 'admin' ? 'bg-purple-900/60 text-purple-100' : 'bg-slate-300 text-slate-700'
                }`}>
                  Master Data
                </span>
              </button>

              <button
                onClick={() => handleTabChange('guru')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  managementTab === 'guru'
                    ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-300'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Portal Guru Mengaji (Ustadz)</span>
                {pendingSubmissionsCount > 0 ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 font-black animate-pulse">
                    {pendingSubmissionsCount} Tugas
                  </span>
                ) : (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    managementTab === 'guru' ? 'bg-emerald-900/60 text-emerald-100' : 'bg-slate-300 text-slate-700'
                  }`}>
                    Evaluasi
                  </span>
                )}
              </button>
            </div>

            {/* Contextual Selector based on Active Tab */}
            <div className="flex items-center gap-3">
              {managementTab === 'guru' && (
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs text-xs">
                  <span className="text-emerald-800 font-semibold flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    Pilih Ustadz:
                  </span>
                  <select
                    value={currentUser.id}
                    onChange={(e) => switchUser(e.target.value)}
                    className="bg-transparent font-bold text-emerald-950 focus:outline-none cursor-pointer"
                  >
                    {users.filter(u => u.role === 'guru').map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {managementTab === 'admin' && (
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-purple-200 shadow-2xs text-xs text-purple-900">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span className="font-semibold">Akses Administrator Penuh:</span>
                  <span className="text-purple-700">
                    {shelters.length} Shelter • {teachers.length} Guru • {participants.length} Santri Ojol
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {managementTab === 'admin' && (
          <div className="space-y-4">
            <AdminPortal />
          </div>
        )}

        {managementTab === 'guru' && (
          <div className="space-y-4">
            <GuruPortal />
          </div>
        )}
      </main>

      {/* Admin Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-slate-700">Portal Manajemen Terpadu Ojol Mengaji</span>
            <span>—</span>
            <span>Mengintegrasikan Admin Pusat &amp; Pembina Al-Qur&apos;an</span>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 transition-colors"
            >
              <Bike className="w-3.5 h-3.5" />
              Beralih ke Tampilan Peserta Ojol &rarr;
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

