'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/layout/Navbar';
import { OjolPortal } from '@/components/ojol/OjolPortal';
import { DriverAuth } from '@/components/ojol/DriverAuth';
import { BookOpen } from 'lucide-react';

export default function Home() {
  const { currentUser } = useApp();

  const isDriverLoggedIn = currentUser && currentUser.role === 'ojol';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header Khusus Pengguna / Peserta Ojol */}
      <Navbar />

      {/* Main Content: Driver Auth (Daftar & Login) jika belum masuk, atau OjolPortal jika sudah masuk */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isDriverLoggedIn ? (
          <OjolPortal />
        ) : (
          <DriverAuth />
        )}
      </main>

      {/* Footer Khusus Peserta Ojol (Tanpa Link Portal Admin & Guru) */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Brand Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-2xs">
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
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-400 flex flex-wrap items-center justify-center gap-2">
            <span>Dirancang dengan standar SRS / PRD Resmi Ojol Mengaji</span>
            <span>•</span>
            <span>Aplikasi Pembinaan Al-Qur&apos;an Driver Ojol</span>
            <span>•</span>
            <span>Responsive Web &amp; Progressive Web App (PWA)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
