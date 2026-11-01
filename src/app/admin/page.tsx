'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { AdminPortal } from '@/components/admin/AdminPortal';
import { AdminAuth } from '@/components/admin/AdminAuth';
import { PortalSwitcher } from '@/components/layout/PortalSwitcher';
import { 
  Shield, 
  GraduationCap, 
  Bike, 
  RotateCcw, 
  ArrowLeft, 
  BookOpen, 
  LogOut,
  AlertCircle
} from 'lucide-react';

export default function AdminPage() {
  const { 
    currentUser, 
    shelters, 
    teachers, 
    participants, 
    logout,
    resetAllData 
  } = useApp();

  // Check if Administrator is logged in
  const isAdminLoggedIn = Boolean(currentUser && currentUser.role === 'admin');

  // If not logged in as admin
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100/70">
        <header className="bg-white border-b border-slate-200 shadow-xs py-3 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-800 p-0.5 shadow-sm">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-purple-700" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-base tracking-tight">
                    Ojol<span className="text-purple-600">Mengaji</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded border border-purple-200">
                    <Shield className="w-2.5 h-2.5 text-purple-700" />
                    Portal Administrator
                  </span>
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors shadow-2xs"
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Halaman Driver</span>
              </Link>
              <Link
                href="/guru"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors shadow-2xs"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Halaman Guru</span>
              </Link>
            </div>
          </div>
        </header>

        {/* 3-Page Switcher */}
        <PortalSwitcher activePortal="admin" />

        {/* Special banner if logged in as guru */}
        {currentUser?.role === 'guru' && (
          <div className="max-w-xl mx-auto mt-6 px-4">
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-teal-600 shrink-0" />
                <div>
                  <p className="font-bold">Anda sedang masuk sebagai Guru Mengaji ({currentUser.name})</p>
                  <p className="text-teal-700 text-[11px]">Halaman ini khusus Administrator Pusat. Anda dapat langsung membuka Halaman Guru.</p>
                </div>
              </div>
              <Link
                href="/guru"
                className="px-3 py-1.5 rounded-lg font-bold bg-teal-700 hover:bg-teal-800 text-white shrink-0 shadow-2xs transition"
              >
                Buka Halaman Guru &rarr;
              </Link>
            </div>
          </div>
        )}

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex items-center justify-center">
          <AdminAuth />
        </main>

        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          <p>Portal Khusus Administrator Pusat — Ojol Mengaji Platform</p>
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
            {/* Left: Brand & Admin Badge */}
            <div className="flex items-center gap-3">
              <Link 
                href="/admin" 
                className="flex items-center gap-2.5 group"
                title="Halaman Administrator Pusat"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-700 to-slate-900 p-0.5 shadow-sm group-hover:shadow-md transition-shadow">
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-700" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                      Ojol<span className="text-purple-600">Mengaji</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md border border-purple-200">
                      <Shield className="w-3 h-3 text-purple-700" />
                      Halaman 2: Admin Pusat
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 hidden sm:block">
                    Pusat Manajemen Operasional &amp; Master Data Seluruh Shelter Indonesia
                  </p>
                </div>
              </Link>
            </div>

            {/* Right: Actions, Master Data Stats, Profile, and Logout */}
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

              {/* Stats overview chip */}
              <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-purple-200 text-xs text-purple-900">
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                <span className="font-semibold">{shelters.length} Shelter</span>
                <span className="text-slate-300">•</span>
                <span className="font-semibold">{teachers.length} Guru</span>
                <span className="text-slate-300">•</span>
                <span className="font-semibold">{participants.length} Driver</span>
              </div>

              {/* Active User Avatar & Info */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {currentUser?.name || 'Administrator'}
                  </div>
                  <div className="text-[10px] text-purple-700 font-medium">
                    Administrator Pusat
                  </div>
                </div>

                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
                  alt={currentUser?.name || 'Admin'}
                  className="w-9 h-9 rounded-full border-2 border-purple-500 object-cover shadow-2xs ring-2 ring-purple-100"
                />

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Keluar dari portal administrator?')) {
                      logout();
                    }
                  }}
                  title="Keluar dari akun administrator"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200 shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Keluar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Page Switcher Bar */}
        <PortalSwitcher activePortal="admin" />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdminPortal />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-slate-700">Halaman 2: Portal Administrator Pusat Ojol Mengaji</span>
            <span>—</span>
            <span>Kewenangan Tunggal Master Data &amp; Tata Kelola</span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 transition-colors"
            >
              <Bike className="w-3.5 h-3.5" />
              Ke Halaman 1: Driver
            </Link>
            <span className="text-slate-300">|</span>
            <Link 
              href="/guru" 
              className="text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Ke Halaman 3: Guru Mengaji &rarr;
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
