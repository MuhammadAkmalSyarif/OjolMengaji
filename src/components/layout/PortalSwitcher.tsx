'use client';

import React from 'react';
import Link from 'next/link';
import { Bike, Shield, GraduationCap, ArrowRight } from 'lucide-react';

interface PortalSwitcherProps {
  activePortal: 'user' | 'admin' | 'guru';
}

export const PortalSwitcher: React.FC<PortalSwitcherProps> = ({ activePortal }) => {
  const portals = [
    {
      id: 'user',
      number: '1',
      title: 'Halaman User',
      subtitle: 'Peserta & Driver Ojol',
      href: '/',
      icon: Bike,
      activeColor: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-300',
      activeBadge: 'bg-emerald-800/80 text-emerald-100',
      badge: 'Driver / Jamaah'
    },
    {
      id: 'admin',
      number: '2',
      title: 'Halaman Admin',
      subtitle: 'Administrator Pusat',
      href: '/admin',
      icon: Shield,
      activeColor: 'bg-purple-700 text-white shadow-md shadow-purple-700/30 ring-2 ring-purple-300',
      activeBadge: 'bg-purple-900/80 text-purple-100',
      badge: 'Master Data & KPI'
    },
    {
      id: 'guru',
      number: '3',
      title: 'Halaman Guru',
      subtitle: 'Dewan Guru (Ustadz)',
      href: '/guru',
      icon: GraduationCap,
      activeColor: 'bg-teal-700 text-white shadow-md shadow-teal-700/30 ring-2 ring-teal-300',
      activeBadge: 'bg-teal-900/80 text-teal-100',
      badge: 'Evaluasi & Presensi'
    }
  ];

  return (
    <div className="w-full bg-white/90 backdrop-blur-sm border-b border-slate-200/90 py-2 sm:py-2.5 px-3 sm:px-6 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden lg:inline">
            Navigasi 3 Halaman:
          </span>
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto w-full md:w-auto">
            {portals.map((portal) => {
              const Icon = portal.icon;
              const isActive = activePortal === portal.id;

              return (
                <Link
                  key={portal.id}
                  href={portal.href}
                  className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? portal.activeColor
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {portal.number}
                  </span>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="leading-tight">{portal.title}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md hidden sm:inline ${
                    isActive ? portal.activeBadge : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    {portal.badge}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Status text */}
        <div className="text-right text-[11px] text-slate-500 hidden md:block">
          {activePortal === 'user' && (
            <span>Halaman 1: Akses Presensi Mandiri, Jadwal &amp; Setoran Hafalan Driver</span>
          )}
          {activePortal === 'admin' && (
            <span>Halaman 2: Pusat Master Data, Manajemen Shelter &amp; Kebijakan Pusat</span>
          )}
          {activePortal === 'guru' && (
            <span>Halaman 3: Portal Ustadz untuk Penilaian Rubrik 6 Aspek &amp; Presensi Kelas</span>
          )}
        </div>
      </div>
    </div>
  );
};

