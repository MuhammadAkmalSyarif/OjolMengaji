'use client';

import React from 'react';
import { findBank, BankInfo } from '@/data/bankData';

interface BankLogoProps {
  bankName?: string;
  bankId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

const sizeMap = {
  xs: { box: 'w-5 h-5', text: 'text-[9px]', icon: 16 },
  sm: { box: 'w-7 h-7', text: 'text-[11px]', icon: 20 },
  md: { box: 'w-9 h-9', text: 'text-xs', icon: 24 },
  lg: { box: 'w-12 h-12', text: 'text-sm', icon: 32 },
  xl: { box: 'w-16 h-16', text: 'text-base', icon: 40 },
};

export const BankLogo: React.FC<BankLogoProps> = ({
  bankName,
  bankId,
  size = 'md',
  className = '',
  showBadge = false,
}) => {
  const bank: BankInfo | undefined = bankId
    ? findBank(bankId)
    : findBank(bankName);

  const id = bank?.id || 'other';
  const sizeConf = sizeMap[size] || sizeMap.md;

  // Render SVG based on bank identity
  const renderSvg = () => {
    switch (id) {
      // 1. BSI (Bank Syariah Indonesia) - Official Teal & Gold
      case 'bsi':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#00A39D" />
            {/* Islamic Gold Star / Radiant Crescent motif */}
            <circle cx="50" cy="36" r="14" fill="#F39200" />
            <circle cx="54" cy="34" r="12" fill="#00A39D" />
            <polygon points="56,26 58,32 64,32 59,36 61,42 56,38 51,42 53,36 48,32 54,32" fill="#FFC72C" />
            {/* Crisp BSI Typography */}
            <text x="50" y="74" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="24" textAnchor="middle" letterSpacing="1">
              BSI
            </text>
            <text x="50" y="87" fill="#E6F6F5" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="7.5" textAnchor="middle" letterSpacing="1.5">
              SYARIAH
            </text>
          </svg>
        );

      // 2. Bank Mandiri - Dark Navy & Golden Ribbon Wave
      case 'mandiri':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#002855" />
            {/* Golden wave ribbon */}
            <path d="M22 38C35 24 65 24 78 38C65 52 35 52 22 38Z" fill="#F5A623" />
            <path d="M28 42C38 32 62 32 72 42C62 50 38 50 28 42Z" fill="#FFD100" />
            {/* Mandiri typography */}
            <text x="50" y="74" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="16" textAnchor="middle" letterSpacing="0.5">
              mandiri
            </text>
          </svg>
        );

      // 3. Bank BCA - Classic Blue & Folded Diamond Logo
      case 'bca':
      case 'bca-syariah':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#003399" />
            {/* BCA Diamond Emblem */}
            <g transform="translate(50, 36) scale(0.85)">
              <polygon points="0,-18 16,-2 0,14 -16,-2" fill="#FFFFFF" opacity="0.95" />
              <polygon points="0,-13 11,-2 0,9 -11,-2" fill="#003399" />
              <polygon points="0,-8 6,-2 0,4 -6,-2" fill="#00A4E4" />
            </g>
            <text x="50" y="76" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="22" textAnchor="middle" letterSpacing="1.5">
              BCA
            </text>
            {id === 'bca-syariah' && (
              <text x="50" y="88" fill="#72C02C" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="7" textAnchor="middle" letterSpacing="1">
                SYARIAH
              </text>
            )}
          </svg>
        );

      // 4. Bank BRI - Royal Blue & Bright Orange
      case 'bri':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#00529C" />
            {/* Orange dynamic arc */}
            <path d="M18 28C40 18 70 20 82 40" stroke="#FF7300" strokeWidth="6" strokeLinecap="round" />
            <circle cx="82" cy="40" r="4" fill="#FF7300" />
            <text x="50" y="72" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="26" textAnchor="middle" letterSpacing="2">
              BRI
            </text>
            <text x="50" y="85" fill="#FFA34D" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="6.5" textAnchor="middle" letterSpacing="1">
              MELAYANI SETULUS HATI
            </text>
          </svg>
        );

      // 5. Bank BNI - Deep Teal & Orange 46 Sail
      case 'bni':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#005E6A" />
            {/* Iconic Orange 46 Sail */}
            <path d="M58 20L78 40H64L50 26L58 20Z" fill="#F15A24" />
            <path d="M42 34L64 56H50L34 40L42 34Z" fill="#F7941D" />
            <text x="50" y="76" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="24" textAnchor="middle" letterSpacing="2">
              BNI
            </text>
          </svg>
        );

      // 6. Bank Muamalat - Purple & Golden Star
      case 'muamalat':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#7B2082" />
            {/* Golden 8-pointed star */}
            <g transform="translate(50, 36) scale(0.8)">
              <rect x="-12" y="-12" width="24" height="24" fill="#DAA520" rx="2" />
              <rect x="-12" y="-12" width="24" height="24" fill="#FFD700" rx="2" transform="rotate(45)" />
              <circle cx="0" cy="0" r="5" fill="#7B2082" />
            </g>
            <text x="50" y="73" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="13.5" textAnchor="middle">
              Muamalat
            </text>
            <text x="50" y="85" fill="#DAA520" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="6.5" textAnchor="middle" letterSpacing="1">
              PERTAMA MURNI
            </text>
          </svg>
        );

      // 7. Bank BTN - Navy Blue & Red Arc
      case 'btn':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#003B70" />
            <path d="M25 36C40 25 60 25 75 36" stroke="#D9251D" strokeWidth="6" strokeLinecap="round" />
            <circle cx="50" cy="30" r="4" fill="#FDB813" />
            <text x="50" y="74" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="24" textAnchor="middle" letterSpacing="1">
              BTN
            </text>
            <text x="50" y="86" fill="#A4C7E8" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="6.5" textAnchor="middle">
              SAHABAT KELUARGA
            </text>
          </svg>
        );

      // 8. Bank CIMB Niaga - Crimson Red & Forward Triangle
      case 'cimb':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#ED1B2D" />
            {/* Forward Triangle motif */}
            <polygon points="36,25 68,40 36,55" fill="#FFFFFF" />
            <polygon points="46,32 68,40 46,48" fill="#800D15" opacity="0.6" />
            <text x="50" y="76" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="17" textAnchor="middle" letterSpacing="1">
              CIMB
            </text>
            <text x="50" y="88" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="8" textAnchor="middle">
              NIAGA
            </text>
          </svg>
        );

      // 9. Bank Danamon - Orange & Navy Blue
      case 'danamon':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#002D62" />
            {/* Danamon Prism Stripe */}
            <path d="M22 28L45 42H78L55 28H22Z" fill="#FF7900" />
            <path d="M22 46L45 60H78L55 46H22Z" fill="#FFA040" opacity="0.8" />
            <text x="50" y="82" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="13" textAnchor="middle">
              Danamon
            </text>
          </svg>
        );

      // 10. Bank Permata - Emerald Green Prism
      case 'permata':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#009A44" />
            {/* Gem / Diamond Prism */}
            <g transform="translate(50, 36) scale(0.9)">
              <polygon points="0,-16 16,0 0,16 -16,0" fill="#FFFFFF" />
              <polygon points="0,-16 16,0 0,0" fill="#0072BC" />
              <polygon points="0,0 16,0 0,16" fill="#F7941D" />
              <polygon points="-16,0 0,-16 0,0" fill="#ED1C24" />
              <polygon points="-16,0 0,0 0,16" fill="#8DC63F" />
            </g>
            <text x="50" y="76" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="14" textAnchor="middle">
              Permata
            </text>
          </svg>
        );

      // 11. Bank Jago - Vibrant Orange & Cheerful Smile
      case 'jago':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#FF6600" />
            {/* Jago Smile */}
            <path d="M28 36C38 52 62 52 72 36" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
            <circle cx="34" cy="26" r="4.5" fill="#FFFFFF" />
            <circle cx="66" cy="26" r="4.5" fill="#FFFFFF" />
            <text x="50" y="78" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="21" textAnchor="middle" letterSpacing="0.5">
              jago
            </text>
          </svg>
        );

      // 12. SeaBank - Warm Shopee Orange & Ocean Waves
      case 'seabank':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#FF5722" />
            {/* Wave lines */}
            <path d="M22 36C32 30 42 42 52 36C62 30 72 42 82 36" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M22 48C32 42 42 54 52 48C62 42 72 54 82 48" stroke="#FFE0B2" strokeWidth="5.5" strokeLinecap="round" />
            <text x="50" y="78" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="15" textAnchor="middle" letterSpacing="0.5">
              SeaBank
            </text>
          </svg>
        );

      // 13. Bank BTPN / Jenius - Turquoise Cyan & Orange Exclamation Loop
      case 'jenius':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#00A4E4" />
            {/* Jenius loop ribbon */}
            <circle cx="50" cy="36" r="14" fill="#F58220" />
            <circle cx="50" cy="36" r="8" fill="#00A4E4" />
            <circle cx="50" cy="36" r="4" fill="#FFFFFF" />
            <text x="50" y="77" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="17" textAnchor="middle">
              jenius
            </text>
          </svg>
        );

      // 14. Blu by BCA Digital - Bright Cyan-Blue & Green Dot
      case 'blu':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#00C3FF" />
            <circle cx="68" cy="34" r="5" fill="#76FF03" />
            <text x="46" y="60" fill="#003399" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="32" textAnchor="middle">
              blu
            </text>
            <text x="50" y="80" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="9" textAnchor="middle" letterSpacing="1">
              by BCA Digital
            </text>
          </svg>
        );

      // 15. Bank Neo Commerce - Bright Yellow Cat Shield
      case 'neo':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#FFD100" />
            <circle cx="50" cy="36" r="15" fill="#1C1C1E" />
            <circle cx="44" cy="34" r="2.5" fill="#FFD100" />
            <circle cx="56" cy="34" r="2.5" fill="#FFD100" />
            <polygon points="41,23 45,28 38,28" fill="#1C1C1E" />
            <polygon points="59,23 62,28 55,28" fill="#1C1C1E" />
            <text x="50" y="76" fill="#1C1C1E" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="18" textAnchor="middle">
              neo
            </text>
          </svg>
        );

      // 16. Bank Mega - Orange M ribbon
      case 'mega':
      case 'mega-syariah':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill={id === 'mega-syariah' ? '#008444' : '#F58220'} />
            <path d="M26 50L38 24L50 44L62 24L74 50H62L50 32L38 50H26Z" fill="#FFFFFF" />
            <text x="50" y="76" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="16" textAnchor="middle">
              MEGA
            </text>
          </svg>
        );

      // 17. Bank OCBC NISP - Red Sailing Boat
      case 'ocbc':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#EE3124" />
            <polygon points="30,46 50,22 70,46" fill="#FFFFFF" />
            <polygon points="35,52 65,52 50,58" fill="#FFFFFF" opacity="0.9" />
            <text x="50" y="78" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="16" textAnchor="middle">
              OCBC
            </text>
          </svg>
        );

      // 18. Bank Panin - Green & Orange Cross
      case 'panin':
      case 'panin-dubai-syariah':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#008752" />
            <rect x="38" y="22" width="24" height="24" fill="#FFFFFF" rx="4" />
            <circle cx="50" cy="34" r="7" fill="#F58220" />
            <text x="50" y="76" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="18" textAnchor="middle">
              panin
            </text>
          </svg>
        );

      // 19. Bank Sinarmas - Red Waves
      case 'sinarmas':
      case 'nano-syariah':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill={id === 'nano-syariah' ? '#00A859' : '#ED1C24'} />
            <circle cx="50" cy="34" r="14" fill="#FFFFFF" />
            <path d="M40 34H60M38 30H62M38 38H62" stroke={id === 'nano-syariah' ? '#00A859' : '#ED1C24'} strokeWidth="2.5" strokeLinecap="round" />
            <text x="50" y="74" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="11" textAnchor="middle" letterSpacing="0.5">
              {id === 'nano-syariah' ? 'NANO' : 'SINARMAS'}
            </text>
          </svg>
        );

      // 20. Bank DKI - Jakarta Monas Motif
      case 'dki':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#F26522" />
            {/* Monas silhouette */}
            <path d="M48 20L52 20L53 38L57 44H43L47 38L48 20Z" fill="#FFFFFF" />
            <rect x="40" y="44" width="20" height="4" fill="#FFFFFF" rx="1" />
            <text x="50" y="76" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="22" textAnchor="middle">
              DKI
            </text>
          </svg>
        );

      // 21. Bank BJB - Royal Blue Winged Emblem
      case 'bjb':
      case 'bjb-syariah':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#0066B2" />
            <polygon points="50,18 64,34 50,50 36,34" fill="#FDB813" />
            <polygon points="50,24 58,34 50,44 42,34" fill="#0066B2" />
            <text x="50" y="76" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="22" textAnchor="middle">
              bjb
            </text>
          </svg>
        );

      // 22. Bank Jateng
      case 'jateng':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#E30613" />
            <circle cx="50" cy="34" r="12" fill="#FDB813" />
            <polygon points="50,24 54,34 64,34 56,40 59,50 50,44 41,50 44,40 36,34 46,34" fill="#E30613" />
            <text x="50" y="75" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13" textAnchor="middle">
              JATENG
            </text>
          </svg>
        );

      // 23. Bank Jatim
      case 'jatim':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#E30613" />
            <polygon points="50,20 66,42 34,42" fill="#FFFFFF" />
            <text x="50" y="75" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="15" textAnchor="middle">
              JATIM
            </text>
          </svg>
        );

      // 24. Allo Bank - Magenta / Purple
      case 'allo':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#E20074" />
            <circle cx="50" cy="36" r="14" fill="#FFFFFF" opacity="0.2" />
            <text x="50" y="65" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="24" textAnchor="middle">
              allo
            </text>
            <text x="50" y="80" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="8" textAnchor="middle" letterSpacing="2">
              BANK
            </text>
          </svg>
        );

      // 25. Gojek / GoPay - Official Green Pin
      case 'gopay':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#00AA13" />
            {/* White Ring */}
            <circle cx="50" cy="38" r="16" stroke="#FFFFFF" strokeWidth="6" />
            <circle cx="50" cy="38" r="5" fill="#FFFFFF" />
            <text x="50" y="78" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="16" textAnchor="middle">
              gopay
            </text>
          </svg>
        );

      // 26. OVO - Royal Purple
      case 'ovo':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#4C3494" />
            <circle cx="50" cy="34" r="14" stroke="#FFFFFF" strokeWidth="6" />
            <text x="50" y="78" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="24" textAnchor="middle" letterSpacing="1">
              ovo
            </text>
          </svg>
        );

      // 27. DANA - DANA Sky Blue
      case 'dana':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#118EEA" />
            <circle cx="50" cy="36" r="14" fill="#FFFFFF" />
            <polygon points="46,28 58,36 46,44" fill="#118EEA" />
            <text x="50" y="78" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="17" textAnchor="middle" letterSpacing="1.5">
              DANA
            </text>
          </svg>
        );

      // 28. ShopeePay - Shopee Orange Bag
      case 'shopeepay':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#EE4D2D" />
            {/* Bag icon */}
            <path d="M38 34C38 27 43 22 50 22C57 22 62 27 62 34" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
            <rect x="32" y="32" width="36" height="30" rx="6" fill="#FFFFFF" />
            <text x="50" y="54" fill="#EE4D2D" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="20" textAnchor="middle">
              S
            </text>
            <text x="50" y="82" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="10.5" textAnchor="middle">
              ShopeePay
            </text>
          </svg>
        );

      // 29. LinkAja - Red Connected Ribbon
      case 'linkaja':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#ED1C24" />
            <circle cx="42" cy="36" r="10" stroke="#FFFFFF" strokeWidth="5" />
            <circle cx="58" cy="36" r="10" stroke="#FFFFFF" strokeWidth="5" />
            <text x="50" y="77" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="14" textAnchor="middle">
              LinkAja!
            </text>
          </svg>
        );

      // 30. Default / Bank Lainnya - Universal Bank Pillars
      default:
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="100" height="100" rx="22" fill="#334155" />
            {/* Bank facade */}
            <polygon points="50,18 80,34 20,34" fill="#F8FAFC" />
            <rect x="25" y="38" width="8" height="24" rx="2" fill="#F8FAFC" />
            <rect x="46" y="38" width="8" height="24" rx="2" fill="#F8FAFC" />
            <rect x="67" y="38" width="8" height="24" rx="2" fill="#F8FAFC" />
            <rect x="18" y="66" width="64" height="6" rx="2" fill="#F8FAFC" />
            <text x="50" y="86" fill="#CBD5E1" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="9" textAnchor="middle" letterSpacing="1">
              BANK
            </text>
          </svg>
        );
    }
  };

  const content = (
    <div
      className={`inline-flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-xs transition-transform ${sizeConf.box} ${className}`}
      title={bank?.name || bankName || 'Bank'}
    >
      {renderSvg()}
    </div>
  );

  if (!showBadge) {
    return content;
  }

  return (
    <div className="inline-flex items-center gap-2">
      {content}
      <div className="flex flex-col min-w-0">
        <span className={`font-bold truncate text-slate-800 ${sizeConf.text}`}>
          {bank?.shortName || bankName || 'Bank'}
        </span>
        {bank?.code && (
          <span className="text-[10px] text-slate-400 font-mono">
            Kode: {bank.code}
          </span>
        )}
      </div>
    </div>
  );
};
