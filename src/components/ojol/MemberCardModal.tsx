'use client';

import React, { useState, useEffect } from 'react';
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
  Share2,
  Loader2,
  FileImage,
  Layers,
  Check,
  ChevronDown,
  Info
} from 'lucide-react';
import QRCode from 'qrcode';
import { Participant, Shelter } from '@/types';
import { 
  downloadCardImage, 
  shareCardImage, 
  getMemberCode, 
  PLATFORM_STYLES 
} from '@/utils/cardGenerator';

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
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const photo = participant.selfiePhoto || participant.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=driver';
  const name = participant.name || 'Nama Driver Peserta';
  const platform = participant.ojolPlatform || 'Gojek';
  const nik = participant.nik || participant.vehiclePlate || '317XXXXXXXXXXXXX';
  const shelterName = shelter?.name || 'Shelter Ojol Mengaji';
  const joinedDate = participant.joinedDate || new Date().toISOString().split('T')[0];
  const memberCode = getMemberCode(participant, shelter);
  const currentPlatformStyle = PLATFORM_STYLES[platform] || PLATFORM_STYLES.Gojek;

  // Generate real live QR Code for preview modal
  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(`https://ojolmengaji.id/verify/${memberCode}`, {
        margin: 1,
        width: 140,
        color: {
          dark: '#022c22',
          light: '#ffffff',
        },
      })
        .then(setQrCodeDataUrl)
        .catch((err) => console.warn('Preview QR Code generation error:', err));
    }
  }, [isOpen, memberCode]);

  // Clear feedback after 4.5 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  if (!isOpen) return null;

  // Action: Download Single Side (Front or Back)
  const handleDownloadSide = async (side: 'front' | 'back') => {
    try {
      setIsDownloading(side);
      setShowDownloadMenu(false);
      const sideName = side === 'front' ? 'Tampak Depan' : 'Tampak Belakang';
      const fileName = await downloadCardImage(participant, shelter, side);
      setFeedback({
        type: 'success',
        message: `✓ KTA (${sideName}) berhasil diunduh: ${fileName}. Gambar tersimpan dalam kualitas resolusi tinggi (HD).`
      });
    } catch (err) {
      console.error(err);
      setFeedback({
        type: 'error',
        message: 'Gagal mengunduh kartu. Silakan coba kembali atau gunakan tombol Cetak / PDF.'
      });
    } finally {
      setIsDownloading(null);
    }
  };

  // Action: Download Complete Sheet (Front + Back side-by-side ready to print)
  const handleDownloadBoth = async () => {
    try {
      setIsDownloading('both');
      setShowDownloadMenu(false);
      const fileName = await downloadCardImage(participant, shelter, 'both');
      setFeedback({
        type: 'success',
        message: `✓ Lembar Lengkap (Depan & Belakang) berhasil diunduh: ${fileName}. Siap dicetak atau dilaminating!`
      });
    } catch (err) {
      console.error(err);
      setFeedback({
        type: 'error',
        message: 'Gagal mengunduh lembar lengkap. Silakan coba kembali.'
      });
    } finally {
      setIsDownloading(null);
    }
  };

  // Action: Share via Web Share API (WhatsApp, Instagram, Gallery)
  const handleShare = async () => {
    try {
      setIsDownloading('share');
      setShowDownloadMenu(false);
      const res = await shareCardImage(participant, shelter, cardSide);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.shared 
            ? '✓ Berhasil membuka menu bagikan (WhatsApp/Media Sosial)!' 
            : res.message
        });
      }
    } catch (err) {
      console.error(err);
      setFeedback({
        type: 'error',
        message: 'Tidak dapat membagikan kartu. Kartu dapat diunduh manual melalui tombol Download.'
      });
    } finally {
      setIsDownloading(null);
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    const cleanName = (participant.name || 'Driver').trim().replace(/[/\\?%*:|"<>]/g, '_');
    const memberCode = getMemberCode(participant, shelter);
    document.title = `KTA-Ojol-Mengaji-${cleanName}-${memberCode}`;

    const restoreTitle = () => {
      document.title = originalTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };
    window.addEventListener('afterprint', restoreTitle);

    window.print();

    setTimeout(restoreTitle, 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative print:shadow-none print:border-none print:max-w-none max-h-[96vh] sm:max-h-[92vh]">
        
        {/* Top Modal Header (Hidden on print) */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-2 flex-wrap">
                <span>Kartu Member Ojol Mengaji</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  {isRegistrationPreview ? 'Preview Pendaftaran' : 'Resmi Digital'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Identitas resmi binaan Al-Qur&apos;an Ojol Mengaji DPW Hidayatullah DKI Jakarta • Format: {memberCode}
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert Bar */}
        {feedback && (
          <div className={`px-4 py-2.5 text-xs font-medium flex items-center justify-between shrink-0 print:hidden ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200' 
              : feedback.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-b border-rose-200'
              : 'bg-blue-50 text-blue-800 border-b border-blue-200'
          }`}>
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="leading-snug">{feedback.message}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setFeedback(null)} 
              className="text-slate-400 hover:text-slate-700 ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Controls Toolbar (Hidden on print) */}
        <div className="px-3 sm:px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap shrink-0 print:hidden">
          
          {/* Flip Side Toggle */}
          <div className="flex items-center p-0.5 bg-slate-200/90 rounded-xl">
            <button
              type="button"
              onClick={() => setCardSide('front')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                cardSide === 'front' 
                  ? 'bg-white text-emerald-950 shadow-xs' 
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
                  ? 'bg-white text-emerald-950 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tampak Belakang
            </button>
          </div>

          {/* Quick Actions (Rotate, Download, Share, Print) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setCardSide(cardSide === 'front' ? 'back' : 'front')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              title="Balik Sisi Kartu"
            >
              <RotateCw className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Balik</span>
            </button>

            {/* DOWNLOAD DROPDOWN BUTTON */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                disabled={!!isDownloading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm transition active:scale-95 disabled:opacity-50"
                title="Pilihan Download Kartu Anggota"
              >
                {isDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>Download Kartu Member</span>
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
              </button>

              {/* Download Options Menu Popover */}
              {showDownloadMenu && (
                <div 
                  className="absolute right-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-fadeIn text-xs"
                  onMouseLeave={() => setShowDownloadMenu(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Pilihan Format Download (PNG HD)
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleDownloadSide('front')}
                    className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 font-medium flex items-center justify-between transition"
                  >
                    <span className="flex items-center gap-2">
                      <FileImage className="w-4 h-4 text-emerald-600" />
                      <span>Download Sisi Depan</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">HD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadSide('back')}
                    className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 font-medium flex items-center justify-between transition"
                  >
                    <span className="flex items-center gap-2">
                      <FileImage className="w-4 h-4 text-emerald-600" />
                      <span>Download Sisi Belakang</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">HD</span>
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    type="button"
                    onClick={handleDownloadBoth}
                    className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-emerald-900 font-bold flex items-center justify-between transition bg-emerald-50/40"
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-500" />
                      <span>Lembar Lengkap (Depan + Belakang)</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">Siap Cetak</span>
                  </button>
                </div>
              )}
            </div>

            {/* Share to WhatsApp / Native Share Button */}
            <button
              type="button"
              onClick={handleShare}
              disabled={!!isDownloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition shadow-2xs active:scale-95 disabled:opacity-50"
              title="Bagikan ke WhatsApp atau Media Sosial"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">Bagikan</span>
            </button>

            {/* Print / PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              title="Cetak Fisik atau Simpan sebagai Dokumen PDF (Nama file otomatis sesuai nama peserta)"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Cetak / PDF</span>
            </button>
          </div>
        </div>

        {/* Card Canvas Presentation Area */}
        <div className="p-3 sm:p-8 flex-1 flex flex-col items-center justify-center bg-slate-100/70 overflow-y-auto">
          
          <div id="ojol-kta-print-area" className="w-full flex justify-center">
            {/* THE MEMBER CARD COMPONENT (CR80 ISO Card Ratio: 85.6mm x 53.98mm = ~1.586:1) */}
            <div 
              id="ojol-member-card"
              className="w-full max-w-[440px] aspect-[1.586/1] rounded-2xl shadow-2xl border border-emerald-800/40 relative overflow-hidden text-white flex flex-col justify-between transition-all duration-300 transform select-none print:shadow-none print:border-emerald-800"
              style={{
                background: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #091e2b 100%)',
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
                      <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md p-1 rounded-lg border border-white/20 shadow-xs">
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
                            src="/logo-dpw-emblem.png" 
                            alt="Logo DPW Hidayatullah" 
                            className="w-full h-full object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/logo-dpw.png'; }}
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-amber-300 drop-shadow-xs">
                          KARTU TANDA ANGGOTA OJOL MENGAJI
                        </h4>
                        <p className="text-[8.5px] sm:text-[9.5px] font-extrabold text-white tracking-tight uppercase">
                          DPW HIDAYATULLAH DKI JAKARTA
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="text-[8px] sm:text-[9px] font-mono tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-amber-400/50 text-amber-300 shadow-xs">
                        {memberCode}
                      </span>
                      <span className="text-[7px] text-emerald-200 mt-0.5 font-sans">
                        No. Anggota
                      </span>
                    </div>
                  </div>

                  {/* Body Section: Selfie Photo & Member Credentials */}
                  <div className="grid grid-cols-12 gap-3 items-center py-2">
                    
                    {/* Driver Selfie Photo Box */}
                    <div className="col-span-4 flex flex-col items-center">
                      <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden border-2 border-amber-400/80 shadow-lg relative bg-slate-800 shrink-0 ring-2 ring-emerald-500/40">
                        <img 
                          src={photo} 
                          alt={name} 
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=driver';
                          }}
                        />
                        {/* Holographic badge watermark on photo */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent py-0.5 text-center">
                          <span className="text-[8px] font-black text-amber-300 tracking-wider">
                            ★ RESMI ★
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Driver Information Details */}
                    <div className="col-span-8 space-y-1.5 text-left pl-1">
                      <div>
                        <span className="text-[8px] uppercase tracking-wider text-emerald-300 font-semibold block">
                          Nama Lengkap Mitra
                        </span>
                        <h3 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase line-clamp-1 drop-shadow-xs">
                          {name}
                        </h3>
                      </div>

                      <div className="pt-0.5">
                        <span className="text-[7.5px] uppercase tracking-wider text-emerald-300/80 font-medium block">
                          Pangkalan Shelter
                        </span>
                        <p className="text-[9.5px] sm:text-[10.5px] font-bold text-amber-200 truncate">
                          {shelterName}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        <div>
                          <span className="text-[7.5px] uppercase tracking-wider text-emerald-300/80 font-medium block">
                            Aplikasi Mitra
                          </span>
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[8.5px] sm:text-[9px] font-extrabold uppercase ${currentPlatformStyle.bg} ${currentPlatformStyle.text}`}>
                            {platform}
                          </span>
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

                  {/* Footer Section: Hologram Security Barcode (Bottom-right signature removed as requested) */}
                  <div className="pt-2 border-t border-emerald-600/30 flex items-center justify-between text-[8px] text-emerald-200/80">
                    <div className="flex items-center gap-2">
                      <div className="p-0.5 rounded bg-white text-slate-900 shadow-xs w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center overflow-hidden">
                        {qrCodeDataUrl ? (
                          <img src={qrCodeDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                        ) : (
                          <QrCode className="w-5 h-5 text-slate-900" />
                        )}
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
                      <span className="text-[7px] font-mono text-emerald-300/60">
                        ID: {memberCode}
                      </span>
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
                  <div className="pt-2 border-t border-emerald-600/30 flex items-center justify-between text-[7.5px] text-slate-300 gap-2">
                    <div className="text-left">
                      <span className="font-bold text-amber-300 block">Sekretariat:</span>
                      <span className="block leading-tight">Jl. Poltangan III No. 3A, RT. 02/10, Pejaten Timur, Pasar Minggu, Jakarta Selatan 12510</span>
                      <span className="block text-slate-400 mt-0.5">Email: info@ojolmengaji.id • Web: https://ojolmengaji.id</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-emerald-300 block">Call Center:</span>
                      <span className="font-mono text-white font-bold text-[8.5px]">0812-4747-5178</span>
                    </div>
                  </div>

                </div>
              )}

              {/* Bottom gold bar accent */}
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-300 via-emerald-400 to-amber-400 relative z-10 shrink-0" />
            </div>
          </div>

          {/* Quick Download Action Pills below card preview */}
          <div className="mt-4 flex items-center gap-2 flex-wrap justify-center print:hidden">
            <button
              type="button"
              onClick={() => handleDownloadSide(cardSide)}
              disabled={!!isDownloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-50 transition shadow-xs disabled:opacity-50"
            >
              <Download className="w-3 h-3 text-emerald-700" />
              <span>Download {cardSide === 'front' ? 'Tampak Depan (PNG)' : 'Tampak Belakang (PNG)'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadBoth}
              disabled={!!isDownloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-800 text-amber-300 hover:bg-emerald-900 transition shadow-xs disabled:opacity-50"
            >
              <Layers className="w-3 h-3 text-amber-300" />
              <span>Download Lembar Lengkap (Depan &amp; Belakang)</span>
            </button>
          </div>

        </div>

        {/* Modal Footer (Hidden on print) */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              KTA otomatis di-render dalam resolusi tinggi (HD 300 DPI) siap cetak kartu fisik atau dibagikan ke WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Fisik / PDF</span>
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
