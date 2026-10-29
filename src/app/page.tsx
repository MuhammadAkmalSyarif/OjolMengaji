'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/layout/Navbar';
import { AdminPortal } from '@/components/admin/AdminPortal';
import { GuruPortal } from '@/components/guru/GuruPortal';
import { OjolPortal } from '@/components/ojol/OjolPortal';
import { BookOpen, Shield, GraduationCap, Bike, Heart } from 'lucide-react';

export default function Home() {
  const { currentUser, quickSwitchRole } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentUser.role === 'admin' && <AdminPortal />}
        {currentUser.role === 'guru' && <GuruPortal />}
        {currentUser.role === 'ojol' && <OjolPortal />}
      </main>

      {/* Professional Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  Ojol Mengaji <span className="text-emerald-600">Platform</span>
                </div>
                <div className="text-xs text-slate-500">
                  Mendukung Pembinaan Al-Qur&apos;an Driver Ojol Berbasis Shelter di Seluruh Indonesia
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Beralih Peran:</span>
              <button
                onClick={() => quickSwitchRole('admin')}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
              >
                Admin
              </button>
              <button
                onClick={() => quickSwitchRole('guru')}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
              >
                Guru
              </button>
              <button
                onClick={() => quickSwitchRole('ojol')}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
              >
                Peserta Ojol
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
            <span>Dirancang dengan standar SRS / PRD Resmi Ojol Mengaji</span>
            <span>•</span>
            <span>Responsive Web &amp; Progressive Web App (PWA)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

