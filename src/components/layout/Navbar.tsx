'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  BookOpen, 
  Bike, 
  Sparkles,
  LogOut,
  UserCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, logout, shelters, participants } = useApp();

  const isDriverLoggedIn = currentUser && currentUser.role === 'ojol';
  const activeParticipant = isDriverLoggedIn 
    ? (participants.find(p => p.userId === currentUser.id) || participants[0])
    : null;
  const activeShelter = activeParticipant 
    ? shelters.find(s => s.id === activeParticipant.shelterId)
    : null;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center">
              <img
                src="/logo-ojol-mengaji.png"
                alt="Logo Ojol Mengaji"
                style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-contain bg-white p-1 shadow-md border border-emerald-200 group-hover:scale-105 transition-transform"
                onError={(e) => {
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
                <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  Ojol<span className="text-emerald-600">Mengaji</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Peserta Ojol
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Platform Pembinaan Al-Qur&apos;an &amp; Presensi Berbasis Shelter
              </p>
            </div>
          </Link>

          {/* Right: Driver Status & Logout (No Admin portal link, No simulation switcher) */}
          <div className="flex items-center gap-3">
            {isDriverLoggedIn && currentUser ? (
              <div className="flex items-center gap-3">
                {/* Current Ojol Participant Info */}
                <div className="flex items-center gap-2.5">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-slate-800 leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-emerald-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>{activeShelter ? activeShelter.name.split('(')[0].trim() : 'Peserta Ojol'}</span>
                    </div>
                  </div>

                  <div className="relative">
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full border-2 border-emerald-500 object-cover shadow-xs ring-2 ring-emerald-100"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin keluar dari akun driver?')) {
                      logout();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs"
                  title="Keluar dari akun driver"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80">
                <Bike className="w-4 h-4 text-emerald-600" />
                <span>Portal Driver</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
