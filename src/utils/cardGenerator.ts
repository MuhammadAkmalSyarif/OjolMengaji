import QRCode from 'qrcode';
import { Participant, Shelter } from '@/types';

/**
 * Standard CR80 ISO Card Dimensions in Pixels (at ~300 DPI)
 * Standard ID Card ratio is 85.60 mm x 53.98 mm = 1.5857 : 1
 */
export const CARD_WIDTH = 1050;
export const CARD_HEIGHT = 662;

// Platform color definitions
export const PLATFORM_STYLES: Record<string, { bg: string; text: string; hex: string }> = {
  Gojek: { bg: 'bg-emerald-600', text: 'text-white', hex: '#059669' },
  Grab: { bg: 'bg-green-600', text: 'text-white', hex: '#16a34a' },
  Maxim: { bg: 'bg-amber-500', text: 'text-slate-950', hex: '#f59e0b' },
  InDrive: { bg: 'bg-cyan-600', text: 'text-white', hex: '#0891b2' },
  ShopeeFood: { bg: 'bg-orange-500', text: 'text-white', hex: '#ea580c' },
};

/**
 * Helper to safely load an image from URL or Data URL.
 * Catches errors and CORS blocks gracefully.
 */
function loadImageSafely(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = () => {
      // Try again without crossOrigin in case it's a relative asset with header issue
      const fallback = new Image();
      fallback.onload = () => resolve(fallback);
      fallback.onerror = () => resolve(null);
      fallback.src = src;
    };
    img.src = src;
  });
}

/**
 * Cross-browser rounded rectangle helper for HTML5 Canvas
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | { tl?: number; tr?: number; br?: number; bl?: number }
) {
  const r = typeof radius === 'number'
    ? { tl: radius, tr: radius, br: radius, bl: radius }
    : { tl: radius.tl || 0, tr: radius.tr || 0, br: radius.br || 0, bl: radius.bl || 0 };

  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + width - r.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr);
  ctx.lineTo(x + width, y + height - r.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
  ctx.lineTo(x + r.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
}

/**
 * Generate official member ID code formatted as:
 * XXXX-XX-XX-XX
 * (No. Urut - No. Shelter - Bulan Bergabung - Tahun Bergabung)
 */
export function getMemberCode(
  participant: Partial<Participant>,
  shelter?: Shelter | null,
  allShelters?: Shelter[]
): string {
  // 1. No. Urut (XXXX - 4 digit nomor urut peserta)
  let seq = 1;
  if (typeof participant.memberNumber === 'number' && participant.memberNumber > 0) {
    seq = participant.memberNumber;
  } else if (participant.id) {
    const digits = participant.id.replace(/\D/g, '');
    if (digits) {
      if (digits.length <= 4) {
        seq = parseInt(digits, 10) || 1;
      } else {
        seq = parseInt(digits.slice(-4), 10) || 1;
      }
    }
  }
  const noUrut = String(seq).padStart(4, '0');

  // 2. No. Shelter (XX - 2 digit nomor shelter binaan)
  let shelterNum = 1;
  const targetShelterId = shelter?.id || participant.shelterId || '';
  if (targetShelterId) {
    const digits = targetShelterId.replace(/\D/g, '');
    if (digits) {
      shelterNum = parseInt(digits, 10) || 1;
    } else if (allShelters && allShelters.length > 0) {
      const idx = allShelters.findIndex(s => s.id === targetShelterId);
      if (idx !== -1) shelterNum = idx + 1;
    }
  }
  const noShelter = String(shelterNum).padStart(2, '0');

  // Penomoran anggota bagian setelah nomor urut dipersingkat: XXXX-XX
  return `${noUrut}-${noShelter}`;
}

/**
 * Draw Islamic geometric background pattern subtle watermark
 */
function drawIslamicPattern(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
  ctx.lineWidth = 1.5;

  const step = 70;
  for (let x = -step; x < width + step; x += step) {
    for (let y = -step; y < height + step; y += step) {
      // Draw 8-pointed star hint
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x - 18, y);
      ctx.lineTo(x + 18, y);
      ctx.moveTo(x, y - 18);
      ctx.lineTo(x, y + 18);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * Render Front Side of the KTA on given Canvas Context
 */
export async function renderFrontCard(
  ctx: CanvasRenderingContext2D,
  participant: Partial<Participant>,
  shelter?: Shelter,
  offsetX = 0,
  offsetY = 0
): Promise<void> {
  const name = (participant.name || 'Nama Driver Peserta').toUpperCase();
  const platform = participant.ojolPlatform || 'Gojek';
  const nik = participant.nik || participant.vehiclePlate || '317XXXXXXXXXXXXX';
  const shelterName = shelter?.name || 'Shelter Ojol Mengaji';
  const joinedDate = participant.joinedDate || new Date().toISOString().split('T')[0];
  const memberCode = getMemberCode(participant, shelter);
  const platformStyle = PLATFORM_STYLES[platform] || PLATFORM_STYLES.Gojek;

  ctx.save();
  ctx.translate(offsetX, offsetY);

  // 1. Base Card Clip & Background
  drawRoundedRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 28);
  ctx.clip();

  // Luxury Dark Emerald to Navy Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  bgGrad.addColorStop(0, '#022c22');
  bgGrad.addColorStop(0.48, '#064e3b');
  bgGrad.addColorStop(1, '#091e2b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Corner Radial Glows
  const glow1 = ctx.createRadialGradient(CARD_WIDTH - 60, 60, 10, CARD_WIDTH - 60, 60, 380);
  glow1.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
  glow1.addColorStop(1, 'transparent');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const glow2 = ctx.createRadialGradient(60, CARD_HEIGHT - 60, 10, 60, CARD_HEIGHT - 60, 340);
  glow2.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
  glow2.addColorStop(1, 'transparent');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Watermark pattern
  drawIslamicPattern(ctx, CARD_WIDTH, CARD_HEIGHT);

  // Top Gold Accent Bar
  const goldTop = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0);
  goldTop.addColorStop(0, '#f59e0b');
  goldTop.addColorStop(0.5, '#34d399');
  goldTop.addColorStop(1, '#fbbf24');
  ctx.fillStyle = goldTop;
  ctx.fillRect(0, 0, CARD_WIDTH, 10);

  // Bottom Gold Accent Bar
  ctx.fillStyle = goldTop;
  ctx.fillRect(0, CARD_HEIGHT - 10, CARD_WIDTH, 10);

  // 2. Pre-load Images (Logos, Photo, QR)
  const [logoOjol, logoDpw, photoImg] = await Promise.all([
    loadImageSafely('/logo-ojol-mengaji.png'),
    loadImageSafely('/logo-dpw-emblem.png').then((img) => img || loadImageSafely('/logo-dpw.png') || loadImageSafely('/logo-dpw.jpg')),
    loadImageSafely(participant.selfiePhoto || participant.avatar || ''),
  ]);

  // Generate Real QR Code
  const qrUrl = `https://ojolmengaji.id/verify/${memberCode}`;
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(qrUrl, {
      margin: 1,
      width: 240,
      color: {
        dark: '#022c22',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.warn('QR Code generation failed, using fallback:', err);
  }
  const qrImg = qrDataUrl ? await loadImageSafely(qrDataUrl) : null;

  // 3. Header Section (y: 20 -> 110)
  // Logos container
  const logoContainerX = 36;
  const logoContainerY = 24;
  drawRoundedRect(ctx, logoContainerX, logoContainerY, 150, 72, 14);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // White box for Logo Ojol
  drawRoundedRect(ctx, logoContainerX + 8, logoContainerY + 8, 62, 56, 10);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  if (logoOjol) {
    const boxW = 56;
    const boxH = 50;
    const ratio = logoOjol.width / logoOjol.height;
    let dW = boxW;
    let dH = boxH;
    if (ratio > boxW / boxH) {
      dW = boxW;
      dH = boxW / ratio;
    } else {
      dH = boxH;
      dW = boxH * ratio;
    }
    const dX = logoContainerX + 11 + (boxW - dW) / 2;
    const dY = logoContainerY + 11 + (boxH - dH) / 2;
    ctx.drawImage(logoOjol, dX, dY, dW, dH);
  } else {
    ctx.fillStyle = '#064e3b';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OJOL', logoContainerX + 39, logoContainerY + 36);
  }

  // White box for Logo DPW
  drawRoundedRect(ctx, logoContainerX + 78, logoContainerY + 8, 62, 56, 10);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  if (logoDpw) {
    const boxW = 56;
    const boxH = 50;
    const ratio = logoDpw.width / logoDpw.height;
    let dW = boxW;
    let dH = boxH;
    if (ratio > boxW / boxH) {
      dW = boxW;
      dH = boxW / ratio;
    } else {
      dH = boxH;
      dW = boxH * ratio;
    }
    const dX = logoContainerX + 81 + (boxW - dW) / 2;
    const dY = logoContainerY + 11 + (boxH - dH) / 2;
    ctx.drawImage(logoDpw, dX, dY, dW, dH);
  } else {
    ctx.fillStyle = '#064e3b';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DPW', logoContainerX + 109, logoContainerY + 36);
  }

  // Header Title beside Logos
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fde68a'; // Amber 200
  ctx.font = '900 20px sans-serif';
  ctx.fillText('KARTU TANDA ANGGOTA OJOL MENGAJI', 202, 50);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 15px sans-serif';
  ctx.fillText('DPW HIDAYATULLAH DKI JAKARTA', 202, 75);

  ctx.fillStyle = 'rgba(209, 250, 229, 0.85)';
  ctx.font = '500 12px sans-serif';
  ctx.fillText('Komunitas & Pembinaan Al-Qur\'an Pengemudi Ojek Online', 202, 96);

  // Header Right: Member Code Pill (Format: XXXX-XX)
  const codePillWidth = 230;
  const codePillX = CARD_WIDTH - codePillWidth - 36;
  const codePillY = 26;
  drawRoundedRect(ctx, codePillX, codePillY, codePillWidth, 54, 14);
  ctx.fillStyle = 'rgba(2, 44, 34, 0.9)';
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#a7f3d0';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('NO. KARTU ANGGOTA', codePillX + codePillWidth / 2, codePillY + 18);

  ctx.fillStyle = '#fef08a';
  ctx.font = '900 18px monospace';
  ctx.fillText(memberCode, codePillX + codePillWidth / 2, codePillY + 41);

  // Header Separator Line
  ctx.beginPath();
  ctx.moveTo(36, 114);
  ctx.lineTo(CARD_WIDTH - 36, 114);
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 4. Middle Section: Driver Photo & Credentials
  const photoX = 40;
  const photoY = 136;
  const photoW = 205;
  const photoH = 265;

  // Outer Photo Shadow & Ring
  drawRoundedRect(ctx, photoX - 4, photoY - 4, photoW + 8, photoH + 8, 22);
  ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw Driver Photo
  ctx.save();
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 18);
  ctx.clip();
  if (photoImg) {
    // Fill background first in case of transparency
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(photoX, photoY, photoW, photoH);
    ctx.drawImage(photoImg, photoX, photoY, photoW, photoH);
  } else {
    // Fallback if image failed to load / cors issue
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(photoX, photoY, photoW, photoH);
    // Draw initial / driver silhouette
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(photoX + photoW / 2, photoY + 95, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(photoX + photoW / 2, photoY + 225, 75, 55, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    const initial = (participant.name || 'D').charAt(0).toUpperCase();
    ctx.fillText(initial, photoX + photoW / 2, photoY + 108);
  }

  // Hologram ribbon watermark on photo
  const ribbonH = 32;
  const ribbonY = photoY + photoH - ribbonH;
  const ribbonGrad = ctx.createLinearGradient(photoX, ribbonY, photoX + photoW, ribbonY);
  ribbonGrad.addColorStop(0, 'rgba(2, 44, 34, 0.95)');
  ribbonGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.88)');
  ribbonGrad.addColorStop(1, 'rgba(2, 44, 34, 0.95)');
  ctx.fillStyle = ribbonGrad;
  ctx.fillRect(photoX, ribbonY, photoW, ribbonH);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★ ANGGOTA RESMI ★', photoX + photoW / 2, ribbonY + 21);
  ctx.restore();

  // 5. Driver Details (Right of Photo)
  const infoX = 278;

  // Nama Driver
  ctx.textAlign = 'left';
  ctx.fillStyle = '#6ee7b7'; // Emerald 300
  ctx.font = '700 13px sans-serif';
  ctx.fillText('NAMA LENGKAP MITRA', infoX, 160);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 30px sans-serif';
  // Truncate name if too long
  let displayName = name;
  if (ctx.measureText(displayName).width > 480) {
    displayName = displayName.slice(0, 24) + '...';
  }
  ctx.fillText(displayName, infoX, 204);

  // Pangkalan Shelter Binaan
  const row1Y = 262;
  ctx.fillStyle = 'rgba(167, 243, 208, 0.85)';
  ctx.font = '600 13px sans-serif';
  ctx.fillText('PANGKALAN SHELTER BINAAN', infoX, row1Y);

  ctx.fillStyle = '#fde68a';
  ctx.font = 'bold 22px sans-serif';
  let displayShelter = shelterName;
  if (ctx.measureText(displayShelter).width > 460) {
    displayShelter = displayShelter.slice(0, 30) + '...';
  }
  ctx.fillText(displayShelter, infoX, row1Y + 32);

  // Aplikasi Mitra & Status Anggota
  const row2Y = 345;
  ctx.fillStyle = 'rgba(167, 243, 208, 0.85)';
  ctx.font = '600 12px sans-serif';
  ctx.fillText('APLIKASI MITRA', infoX, row2Y);

  // Platform colored badge
  const platWidth = 140;
  drawRoundedRect(ctx, infoX, row2Y + 8, platWidth, 32, 8);
  ctx.fillStyle = platformStyle.hex;
  ctx.fill();

  ctx.fillStyle = platform === 'Maxim' ? '#0f172a' : '#ffffff';
  ctx.font = '900 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(platform.toUpperCase(), infoX + platWidth / 2, row2Y + 29);

  // Status Badge
  const colStatusX = infoX + platWidth + 24;
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(167, 243, 208, 0.85)';
  ctx.font = '600 12px sans-serif';
  ctx.fillText('STATUS KEANGGOTAAN', colStatusX, row2Y);

  const statusWidth = 160;
  drawRoundedRect(ctx, colStatusX, row2Y + 8, statusWidth, 32, 16);
  ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
  ctx.fill();
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#6ee7b7';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✓ AKTIF BINAAN', colStatusX + statusWidth / 2, row2Y + 29);

  // 6. Bottom Footer Section (y: 450 -> 640)
  ctx.beginPath();
  ctx.moveTo(36, 442);
  ctx.lineTo(CARD_WIDTH - 36, 442);
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // QR Code Box
  const qrBoxX = 40;
  const qrBoxY = 460;
  const qrBoxSize = 160;
  drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 14);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.stroke();

  if (qrImg) {
    ctx.drawImage(qrImg, qrBoxX + 6, qrBoxY + 6, qrBoxSize - 12, qrBoxSize - 12);
  }

  // QR Code Details beside it
  const qrTextX = qrBoxX + qrBoxSize + 22;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 17px monospace';
  ctx.fillText('VERIFIED OJOL MENGAJI', qrTextX, 510);

  ctx.fillStyle = '#ffffff';
  ctx.font = '500 13px sans-serif';
  ctx.fillText(`Bergabung: ${joinedDate}`, qrTextX, 538);

  ctx.fillStyle = 'rgba(209, 250, 229, 0.75)';
  ctx.font = '400 12px sans-serif';
  ctx.fillText('Pindai QR untuk verifikasi keaslian keanggotaan', qrTextX, 564);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '400 11px monospace';
  ctx.fillText(`No. Anggota: ${memberCode}`, qrTextX, 590);

  // Thin outer border
  ctx.restore();
  ctx.save();
  ctx.translate(offsetX, offsetY);
  drawRoundedRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 28);
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

/**
 * Render Back Side of the KTA on given Canvas Context
 */
export async function renderBackCard(
  ctx: CanvasRenderingContext2D,
  participant: Partial<Participant>,
  shelter?: Shelter,
  offsetX = 0,
  offsetY = 0
): Promise<void> {
  ctx.save();
  ctx.translate(offsetX, offsetY);

  // 1. Base Card Clip & Background
  drawRoundedRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 28);
  ctx.clip();

  // Deep Luxury Islamic Emerald Palette
  const bgGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  bgGrad.addColorStop(0, '#022c22');
  bgGrad.addColorStop(0.5, '#064e3b');
  bgGrad.addColorStop(1, '#091e2b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Radial overlays
  const glow = ctx.createRadialGradient(CARD_WIDTH / 2, CARD_HEIGHT / 2, 10, CARD_WIDTH / 2, CARD_HEIGHT / 2, 450);
  glow.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Watermark
  drawIslamicPattern(ctx, CARD_WIDTH, CARD_HEIGHT);

  // Top & Bottom Gold Accent Bars
  const goldTop = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0);
  goldTop.addColorStop(0, '#f59e0b');
  goldTop.addColorStop(0.5, '#34d399');
  goldTop.addColorStop(1, '#fbbf24');
  ctx.fillStyle = goldTop;
  ctx.fillRect(0, 0, CARD_WIDTH, 10);
  ctx.fillRect(0, CARD_HEIGHT - 10, CARD_WIDTH, 10);

  // 2. Back Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fde68a';
  ctx.font = '900 24px sans-serif';
  ctx.fillText('IKRAR & KOMITMEN MITRA OJOL MENGAJI', CARD_WIDTH / 2, 60);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'italic 500 15px serif';
  ctx.fillText('"Sebaik-baik kalian adalah yang mempelajari Al-Qur\'an dan mengajarkannya"', CARD_WIDTH / 2, 92);

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('(HR. Bukhari No. 5027)', CARD_WIDTH / 2, 114);

  // Divider
  ctx.beginPath();
  ctx.moveTo(60, 134);
  ctx.lineTo(CARD_WIDTH - 60, 134);
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 3. 4 Commitments (Ikrar) Cards
  const commitments = [
    {
      num: '1',
      title: 'Menjaga Shalat 5 Waktu & Keselamatan',
      desc: 'Senantiasa mendirikan shalat fardhu tepat waktu dan mengutamakan keselamatan penumpang di jalan raya.',
    },
    {
      num: '2',
      title: 'Istiqamah Belajar Al-Qur\'an',
      desc: 'Disiplin menghadiri sesi tahsin, tilawah, dan talaqqi Al-Qur\'an di shelter binaan secara berkelanjutan.',
    },
    {
      num: '3',
      title: 'Adab Mulia & Rezeki Halal',
      desc: 'Menjunjung tinggi adab Islami, kejujuran dalam mencari nafkah, serta menjaga kerukunan sesama mitra driver.',
    },
    {
      num: '4',
      title: 'Duta Dakwah di Jalan Raya',
      desc: 'Menjadi teladan kebaikan yang ramah, santun, dan membawa citra positif mitra ojek online di mata masyarakat.',
    },
  ];

  let cardY = 154;
  const cardW = CARD_WIDTH - 100;
  const cardH = 68;
  const gap = 16;

  commitments.forEach((item) => {
    // Card background
    drawRoundedRect(ctx, 50, cardY, cardW, cardH, 14);
    ctx.fillStyle = 'rgba(2, 44, 34, 0.7)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.28)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Number Badge Circle
    ctx.beginPath();
    ctx.arc(92, cardY + cardH / 2, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#065f46';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.num, 92, cardY + cardH / 2 + 6);

    // Title & Desc
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(item.title, 130, cardY + 28);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '400 13px sans-serif';
    ctx.fillText(item.desc, 130, cardY + 50);

    cardY += cardH + gap;
  });

  // 4. Footer Section
  const footerY = 510;
  ctx.beginPath();
  ctx.moveTo(60, footerY);
  ctx.lineTo(CARD_WIDTH - 60, footerY);
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Left: Secretariat
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('SEKRETARIAT:', 60, footerY + 36);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '400 13px sans-serif';
  ctx.fillText('Jl. Poltangan III No. 3A, RT. 02/10, Pejaten Timur, Pasar Minggu, Jakarta Selatan 12510', 60, footerY + 62);
  ctx.fillText('Email: info@ojolmengaji.id • Web: https://ojolmengaji.id', 60, footerY + 86);

  // Right: Hotline & Social
  const rightX = CARD_WIDTH - 60;
  ctx.textAlign = 'right';
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('CALL CENTER:', rightX, footerY + 36);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('0812-4747-5178', rightX, footerY + 62);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '400 12px sans-serif';
  ctx.fillText('Bimbingan Gratis Tanpa Dipungut Biaya', rightX, footerY + 86);

  ctx.restore();
  ctx.save();
  ctx.translate(offsetX, offsetY);
  drawRoundedRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 28);
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

/**
 * Generate a combined printable sheet (Front + Back in 1 layout)
 */
export async function renderBothCardsSheet(
  ctx: CanvasRenderingContext2D,
  participant: Partial<Participant>,
  shelter?: Shelter
): Promise<void> {
  const sheetWidth = 1200;
  const sheetHeight = 1660;

  // Background
  const bg = ctx.createLinearGradient(0, 0, sheetWidth, sheetHeight);
  bg.addColorStop(0, '#061c16');
  bg.addColorStop(0.5, '#0b2b22');
  bg.addColorStop(1, '#021510');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, sheetWidth, sheetHeight);

  // Watermark
  drawIslamicPattern(ctx, sheetWidth, sheetHeight);

  // Header Title
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fbbf24';
  ctx.font = '900 32px sans-serif';
  ctx.fillText('KARTU TANDA ANGGOTA (KTA) RESMI', sheetWidth / 2, 65);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 18px sans-serif';
  ctx.fillText('KOMUNITAS PEMBINAAN AL-QUR\'AN OJOL MENGAJI • DPW HIDAYATULLAH DKI JAKARTA', sheetWidth / 2, 102);

  const memberCode = getMemberCode(participant, shelter);
  const name = (participant.name || 'Nama Driver Peserta').toUpperCase();
  const platform = participant.ojolPlatform || 'Gojek';
  ctx.fillStyle = '#a7f3d0';
  ctx.font = '600 15px sans-serif';
  ctx.fillText(`Nama Mitra: ${name}  |  Aplikasi: ${platform}  |  No. Kartu Member: ${memberCode}`, sheetWidth / 2, 134);

  // Separator
  ctx.beginPath();
  ctx.moveTo(80, 156);
  ctx.lineTo(sheetWidth - 80, 156);
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Render Front Card (Centered)
  const cardX = (sheetWidth - CARD_WIDTH) / 2;
  const frontY = 210;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('▶ TAMPAK DEPAN (FRONT SIDE)', cardX, frontY - 14);

  await renderFrontCard(ctx, participant, shelter, cardX, frontY);

  // Render Back Card (Centered)
  const backY = frontY + CARD_HEIGHT + 75;

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('▶ TAMPAK BELAKANG (BACK SIDE)', cardX, backY - 14);

  await renderBackCard(ctx, participant, shelter, cardX, backY);

  // Bottom Notice
  const footerY = sheetHeight - 50;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.font = '400 13px sans-serif';
  ctx.fillText('Ukuran Standar ID Card ISO 7810 (85.6 mm x 54 mm) • Dicetak untuk identitas resmi komunitas Ojol Mengaji', sheetWidth / 2, footerY);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`Generated by Ojol Mengaji Platform • ${new Date().toLocaleDateString('id-ID')}`, sheetWidth / 2, footerY + 22);
}

/**
 * Generate Card Image Data URL
 */
export async function generateCardDataUrl(
  participant: Partial<Participant>,
  shelter?: Shelter,
  side: 'front' | 'back' | 'both' = 'front'
): Promise<string> {
  const canvas = document.createElement('canvas');

  if (side === 'both') {
    canvas.width = 1200;
    canvas.height = 1660;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    await renderBothCardsSheet(ctx, participant, shelter);
  } else {
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    if (side === 'front') {
      await renderFrontCard(ctx, participant, shelter);
    } else {
      await renderBackCard(ctx, participant, shelter);
    }
  }

  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Trigger direct download of Member Card
 */
export async function downloadCardImage(
  participant: Partial<Participant>,
  shelter?: Shelter,
  side: 'front' | 'back' | 'both' = 'front'
): Promise<string> {
  const dataUrl = await generateCardDataUrl(participant, shelter, side);
  const cleanName = (participant.name || 'Driver').trim().replace(/[/\\?%*:|"<>]/g, '_');
  const platform = participant.ojolPlatform || 'Gojek';
  const sideName = side === 'front' ? 'Depan' : side === 'back' ? 'Belakang' : 'Lengkap';
  const memberCode = getMemberCode(participant, shelter);
  const fileName = `KTA-Ojol-Mengaji-${cleanName}-${memberCode}-${sideName}.png`;

  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return fileName;
}

/**
 * Share Card to WhatsApp / Mobile Native Share API
 */
export async function shareCardImage(
  participant: Partial<Participant>,
  shelter?: Shelter,
  side: 'front' | 'back' | 'both' = 'front'
): Promise<{ success: boolean; shared: boolean; message: string }> {
  try {
    const dataUrl = await generateCardDataUrl(participant, shelter, side);
    const cleanName = (participant.name || 'Driver').trim().replace(/[/\\?%*:|"<>]/g, '_');
    const sideName = side === 'front' ? 'Depan' : side === 'back' ? 'Belakang' : 'Lengkap';
    const memberCode = getMemberCode(participant, shelter);
    const fileName = `KTA-Ojol-Mengaji-${cleanName}-${memberCode}-${sideName}.png`;

    // Convert Data URL to Blob
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], fileName, { type: 'image/png' });

    if (
      typeof navigator !== 'undefined' &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        title: `Kartu Member Ojol Mengaji - ${memberCode} - ${participant.name}`,
        text: `Kartu Member Resmi Komunitas Ojol Mengaji DPW DKI Jakarta atas nama ${participant.name} (${participant.ojolPlatform}) - No. Kartu: ${memberCode}`,
        files: [file],
      });
      return { success: true, shared: true, message: 'Berhasil dibagikan!' };
    } else {
      // Fallback: trigger normal download
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { 
        success: true, 
        shared: false, 
        message: 'Browser tidak mendukung share langsung. File Kartu Member otomatis diunduh ke galeri/perangkat Anda!' 
      };
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { success: false, shared: false, message: 'Berbagi dibatalkan.' };
    }
    console.error('Error sharing card:', err);
    throw err;
  }
}
