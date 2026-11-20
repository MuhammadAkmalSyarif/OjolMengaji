'use client';

import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  RotateCw, 
  ShieldCheck, 
  Sparkles, 
  Bike, 
  MapPin, 
  Calendar, 
  QrCode, 
  CheckCircle2,
  Share2
} from 'lucide-react';
import { Participant, Shelter } from '@/types';

interface MemberCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: Partial<Participant>;
  shelter?: Shelter;
  isRegistrationPreview?: boolean;
}

export const MemberCardModal: React.FC<MemberCardModalProps> = ({
  isOpen,
  onClose,
  participant,
  shelter,
  isRegistrationPreview = false,
}) => {
  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');

  if (!isOpen) return null;

  const photo = participant.selfiePhoto || participant.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=driver';
  const name = participant.name || 'Nama Driver Peserta';
  const platform = participant.ojolPlatform || 'Gojek';
  const nik = participant.nik || participant.vehiclePlate || '317XXXXXXXXXXXXX';
  const shelterName = shelter?.name || 'Shelter Ojol Mengaji';
  const joinedDate = participant.joinedDate || new Date().toISOString().split('T')[0];
  const memberCode = participant.id 
    ? `OM-${platform.toUpperCase().slice(0, 2)}-${participant.id.slice(-6).toUpperCase()}`
    : `OM-${platform.toUpperCase().slice(0, 2)}-${(nik.replace(/\D/g, '') || '999999').slice(-6)}`;

  // Platform styling
  const platformColors: Record<string, { bg: string; text: string; border: string }> = {
    Gojek: { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-500' },
    Grab: { bg: 'bg-green-600', text: 'text-white', border: 'border-green-500' },
    Maxim: { bg: 'bg-amber-500', text: 'text-slate-950', border: 'border-amber-400' },
    InDrive: { bg: 'bg-cyan-600', text: 'text-white', border: 'border-cyan-500' },
    ShopeeFood: { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-400' },
  };

  const currentPlatformStyle = platformColors[platform] || platformColors.Gojek;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative print:shadow-none print:border-none print:max-w-none">
        
        {/* Top Modal Header (Hidden on print) */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <span>Kartu Tanda Anggota (KTA)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  {isRegistrationPreview ? 'Preview Pendaftaran' : 'Resmi Digital'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Kartu identitas resmi jamaah &amp; pembinaan Al-Qur&apos;an Ojol Mengaji
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls Bar (Hidden on print) */}
        <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap print:hidden">
          {/* Flip Side Toggle */}
          <div className="flex items-center p-0.5 bg-slate-200/80 rounded-xl">
            <button
              type="button"
              onClick={() => setCardSide('front')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                cardSide === 'front' 
                  ? 'bg-white text-emerald-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tampak Depan
            </button>
            <button
              type="button"
              onClick={() => setCardSide('back')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                cardSide === 'back' 
                  ? 'bg-white text-emerald-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tampak Belakang
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCardSide(cardSide === 'front' ? 'back' : 'front')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              title="Balik Kartu"
            >
              <RotateCw className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Balik</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-sm"
              title="Cetak atau Simpan sebagai PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>

        {/* Card Canvas Presentation Area */}
        <div className="p-4 sm:p-8 flex items-center justify-center bg-slate-100/70 overflow-auto">
          
          {/* THE MEMBER CARD COMPONENT (Formatted standard CR80 ISO Card Ratio: 85.6mm x 53.98mm) */}
          <div 
            id="ojol-member-card"
            className="w-full max-w-[440px] aspect-[1.586/1] rounded-2xl shadow-2xl border border-emerald-800/40 relative overflow-hidden text-white flex flex-col justify-between transition-all duration-300 transform select-none"
            style={{
              background: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%)',
            }}
          >
            {/* Subtle background luxury Islamic watermark & radial gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.25),transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.15),transparent_60%)] pointer-events-none" />
            
            {/* Top gold geometric line accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-300 relative z-10 shrink-0" />

            {/* CARD FRONT SIDE */}
            {cardSide === 'front' ? (
              <div className="p-3.5 sm:p-4.5 flex-1 flex flex-col justify-between relative z-10">
                
                {/* Header Section */}
                <div className="flex items-center justify-between pb-2 border-b border-emerald-600/40">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-lg border border-white/20 shadow-xs">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-white p-0.5 flex items-center justify-center">
                        <img 
                          src="/logo-ojol-mengaji.png" 
                          alt="Logo Ojol Mengaji" 
                          className="w-full h-full object-contain"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </div>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-white p-0.5 flex items-center justify-center">
                        <img 
                          src="/logo-dpw.jpg" 
                          alt="Logo DPW" 
                          className="w-full h-full object-contain"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-amber-300 drop-shadow-xs">
                        KARTU TANDA ANGGOTA
                      </h4>
                      <p className="text-[9px] sm:text-[10px] font-extrabold text-white tracking-tight uppercase">
                        OJOL MENGAJI • DPW DKI JAKARTA
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[8px] sm:text-[9px] font-mono tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-amber-400/40 text-amber-300">
                      {memberCode}
                    </span>
                  </div>
                </div>

                {/* Body Section: Selfie Photo & Member Credentials */}
                <div className="grid grid-cols-12 gap-3 items-center py-2">
                  
                  {/* Driver Selfie Photo Box */}
                  <div className="col-span-4 flex flex-col items-center">
                    <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden border-2 border-amber-400/70 shadow-lg relative bg-slate-800 shrink-0 ring-2 ring-emerald-500/40">
                      <img 
                        src={photo} 
                        alt={name} 
                        className="w-full h-full object-cover object-top"
                      />
                      {/* Holographic badge watermark on photo */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent py-0.5 text-center">
                        <span className="text-[8px] font-bold text-amber-300 tracking-wider">
                          RESMI
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Driver Information Details */}
                  <div className="col-span-8 space-y-1 text-left pl-1">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-emerald-300 font-semibold block">
                        Nama Lengkap Mitra
                      </span>
                      <h3 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase line-clamp-1 drop-shadow-xs">
                        {name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      <div>
                        <span className="text-[7.5px] uppercase tracking-wider text-emerald-300/80 font-medium block">
                          Nomor NIK / Plat
                        </span>
                        <p className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-100 truncate">
                          {nik}
                        </p>
                      </div>

                      <div>
                        <span className="text-[7.5px] uppercase tracking-wider text-emerald-300/80 font-medium block">
                          Aplikasi Mitra
                        </span>
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[8.5px] sm:text-[9px] font-extrabold uppercase ${currentPlatformStyle.bg} ${currentPlatformStyle.text}`}>
                          {platform}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      <div>
                        <span className="text-[7.5px] uppercase tracking-wider text-emerald-300/80 font-medium block">
                          Pangkalan Shelter
                        </span>
                        <p className="text-[9px] sm:text-[10px] font-bold text-emerald-200 truncate">
                          {shelterName}
                        </p>
                      </div>

                      <div>
                        <span className="text-[7.5px] uppercase tracking-wider text-emerald-300/80 font-medium block">
                          Status Anggota
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[8.5px] sm:text-[9px] font-bold text-emerald-300">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Aktif Binaan</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Section: Hologram Security Barcode & Signature */}
                <div className="pt-2 border-t border-emerald-600/30 flex items-center justify-between text-[8px] text-emerald-200/80">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-white text-slate-900 shadow-xs">
                      <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <div className="font-mono text-[7.5px] text-amber-300 font-bold">
                        VERIFIED OJOL MENGAJI
                      </div>
                      <div className="text-[7px] text-slate-300">
                        Bergabung: {joinedDate}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[7px] text-slate-300 uppercase tracking-wider">Dewan Pembina</div>
                    <div className="font-serif italic font-bold text-amber-200 text-[9px]">
                      DPW DKI Jakarta
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              /* CARD BACK SIDE */
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between relative z-10 text-xs">
                
                {/* Back Header */}
                <div className="text-center pb-2 border-b border-emerald-600/40">
                  <h4 className="text-[11px] font-extrabold uppercase text-amber-300 tracking-wider">
                    IKRAR &amp; KOMITMEN MITRA OJOL MENGAJI
                  </h4>
                  <p className="text-[8.5px] text-slate-300">
                    &quot;Sebaik-baik kalian adalah yang mempelajari Al-Qur&apos;an dan mengajarkannya&quot; (HR. Bukhari)
                  </p>
                </div>

                {/* Commitments List */}
                <div className="space-y-1.5 py-2 text-[8.5px] sm:text-[9px] leading-tight text-slate-200">
                  <div className="flex items-start gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-700 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[8px]">
                      1
                    </span>
                    <span>Menjaga shalat fardhu 5 waktu dan keselamatan penumpang di jalan raya.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-700 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[8px]">
                      2
                    </span>
                    <span>Istiqamah belajar tahsin &amp; tartil Al-Qur&apos;an di shelter binaan.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-700 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[8px]">
                      3
                    </span>
                    <span>Menjunjung tinggi adab, kejujuran rezeki, serta kerukunan sesama mitra driver.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-700 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[8px]">
                      4
                    </span>
                    <span>Menjadi duta dakwah yang bersahabat dan santun bagi masyarakat.</span>
                  </div>
                </div>

                {/* Back Footer */}
                <div className="pt-2 border-t border-emerald-600/30 flex items-center justify-between text-[7.5px] text-slate-300">
                  <div>
                    <span className="font-bold text-amber-300 block">Sekretariat Pusat:</span>
                    <span>Jl. Poltangan Raya No. 25, Jagakarsa, Jakarta Selatan</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-300 block">Layanan Jamaah:</span>
                    <span className="font-mono">wa.me/6281234567890</span>
                  </div>
                </div>

              </div>
            )}

            {/* Bottom gold bar accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-300 via-emerald-400 to-amber-400 relative z-10 shrink-0" />
          </div>

        </div>

        {/* Modal Footer Note (Hidden on print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 print:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              Foto selfie yang Anda unggah otomatis disesuaikan secara simetris untuk cetak kartu anggota (KTA).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kartu Fisik / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition shadow-2xs"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
