'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  BookOpen, 
  Shield, 
  GraduationCap, 
  Bike, 
  ChevronDown, 
  RotateCcw,
  Sparkles,
  MapPin
} from 'lucide-react';
import { UserRole } from '@/types';

export const Navbar: React.FC = () => {
  const { currentUser, users, switchUser, quickSwitchRole, resetAllData, shelters } = useApp();

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Shield className="w-3.5 h-3.5" />
            Administrator Pusat
          </span>
        );
      case 'guru':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <GraduationCap className="w-3.5 h-3.5" />
            Guru Mengaji (Ustadz)
          </span>
        );
      case 'ojol':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <Bike className="w-3.5 h-3.5 text-amber-700" />
            Peserta Ojol
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Demo Bar for Easy Role Switching */}
      <div className="bg-emerald-900 text-white text-xs py-2 px-4 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-emerald-100">Mode Simulasi Interaktif:</span>
            <span className="text-emerald-200 hidden sm:inline">Pilih peran untuk menguji hak akses & modul:</span>
          </div>

          <div className="flex items-center flex-wrap gap-1.5">
            <button
              onClick={() => quickSwitchRole('admin')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                currentUser.role === 'admin' 
                  ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-300' 
                  : 'bg-emerald-800/80 text-emerald-100 hover:bg-emerald-700'
              }`}
            >
              <Shield className="w-3 h-3" />
              Admin
            </button>
            <button
              onClick={() => quickSwitchRole('guru')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                currentUser.role === 'guru' 
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300' 
                  : 'bg-emerald-800/80 text-emerald-100 hover:bg-emerald-700'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              Guru Mengaji
            </button>
            <button
              onClick={() => quickSwitchRole('ojol')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                currentUser.role === 'ojol' 
                  ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-300' 
                  : 'bg-emerald-800/80 text-emerald-100 hover:bg-emerald-700'
              }`}
            >
              <Bike className="w-3 h-3" />
              Peserta Ojol
            </button>

            <span className="text-emerald-400 mx-1">|</span>

            {/* Quick user selector */}
            <div className="relative inline-block">
              <select
                aria-label="Pilih akun simulasi"
                value={currentUser.id}
                onChange={(e) => switchUser(e.target.value)}
                className="bg-emerald-800 text-emerald-100 text-xs py-1 px-2 rounded border border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                    {u.role.toUpperCase()}: {u.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                if (confirm('Reset ulang data simulasi ke awal?')) {
                  resetAllData();
                }
              }}
              title="Reset data demo ke awal"
              className="p-1 rounded text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors ml-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Brand & Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <img
                src="/logo-ojol-mengaji.png"
                alt="Logo Ojol Mengaji"
                className="w-12 h-12 rounded-xl object-contain bg-white p-1 shadow-md border border-emerald-200"
                onError={(e) => {
                  // Fallback to stylized icon if image fails
                  (e.target as HTMLElement).style.display = 'none';
                  const fb = document.getElementById('navbar-logo-fallback');
                  if (fb) fb.style.display = 'flex';
                }}
              />
              <div 
                id="navbar-logo-fallback"
                style={{ display: 'none' }}
                className="items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-md shadow-emerald-500/20"
              >
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Ojol<span className="text-emerald-600">Mengaji</span>
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Berkah Dunia Akhirat
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Platform Pembinaan Al-Qur&apos;an &amp; Presensi Berbasis Shelter
              </p>
            </div>
          </div>

          {/* Current User Info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-800 leading-tight">
                {currentUser.name}
              </div>
              <div className="mt-0.5">
                {getRoleBadge(currentUser.role)}
              </div>
            </div>

            <div className="relative">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full border-2 border-emerald-500 object-cover shadow-sm ring-2 ring-emerald-100"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
