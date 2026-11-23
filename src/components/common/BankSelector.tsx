'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, Check, Building2, Sparkles, ChevronDown, HelpCircle } from 'lucide-react';
import { ALL_BANKS, BANK_CATEGORIES, findBank, BankInfo } from '@/data/bankData';
import { BankLogo } from './BankLogo';
import { PaymentAccountType } from '@/types';

interface BankSelectorProps {
  value?: string; // Selected bank name
  accountType?: PaymentAccountType;
  onChange: (bankName: string, accountType?: PaymentAccountType) => void;
  error?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export const BankSelector: React.FC<BankSelectorProps> = ({
  value = '',
  accountType,
  onChange,
  error,
  label = 'Pilih Nama Bank / E-Wallet',
  required = false,
  placeholder = '-- Klik untuk Pilih Nama Bank Lengkap & Logo --',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [customBankInput, setCustomBankInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const selectedBank: BankInfo | undefined = useMemo(() => {
    return findBank(value);
  }, [value]);

  // Filtered banks
  const filteredBanks = useMemo(() => {
    let list = ALL_BANKS;

    if (selectedCategory !== 'Semua') {
      list = list.filter(b => b.category === selectedCategory);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(b => {
        return (
          b.name.toLowerCase().includes(q) ||
          b.shortName.toLowerCase().includes(q) ||
          (b.code && b.code.toLowerCase().includes(q)) ||
          b.aliases.some(a => a.toLowerCase().includes(q))
        );
      });
    }

    return list;
  }, [search, selectedCategory]);

  // Frequently used quick picks
  const quickPicks = useMemo(() => {
    return ['bsi', 'mandiri', 'bca', 'bri', 'bni', 'muamalat', 'jago', 'gopay', 'dana']
      .map(id => ALL_BANKS.find(b => b.id === id))
      .filter((b): b is BankInfo => Boolean(b));
  }, []);

  const handleSelectBank = (bank: BankInfo) => {
    if (bank.id === 'other') {
      setShowCustomInput(true);
      return;
    }
    setShowCustomInput(false);
    const resolvedType: PaymentAccountType = bank.type === 'E-Wallet' 
      ? (bank.shortName === 'GoPay' ? 'Gojek' : bank.shortName as any)
      : 'Bank';

    onChange(bank.name, resolvedType);
    setIsOpen(false);
    setSearch('');
  };

  const handleSaveCustomBank = () => {
    if (customBankInput.trim()) {
      onChange(customBankInput.trim(), 'Bank');
      setIsOpen(false);
      setCustomBankInput('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-slate-700">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {selectedBank && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: selectedBank.bgLight,
                color: selectedBank.textColor,
              }}
            >
              {selectedBank.category}
            </span>
          )}
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className={`w-full p-2.5 sm:p-3 text-left rounded-2xl border transition-all flex items-center justify-between gap-3 bg-white shadow-2xs hover:border-emerald-500 ${
          error
            ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20'
            : value
              ? 'border-emerald-300 ring-1 ring-emerald-500/20'
              : 'border-slate-300 hover:bg-slate-50'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {value ? (
            <>
              <BankLogo bankName={value} size="md" className="shrink-0" />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-black text-slate-900 truncate flex items-center gap-2">
                  <span>{selectedBank?.name || value}</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="font-semibold text-emerald-700">
                    {selectedBank?.category || 'Bank / E-Wallet'}
                  </span>
                  {selectedBank?.code && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-slate-400">Kode: {selectedBank.code}</span>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5 text-slate-400 text-xs sm:text-sm font-medium">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Building2 className="w-4 h-4" />
              </div>
              <span>{placeholder}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hidden sm:inline-block">
            {value ? 'Ganti Bank' : 'Pilih Bank'}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </button>

      {error && (
        <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
          <span>{error}</span>
        </p>
      )}

      {/* Modern Bank Selector Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div 
            className="fixed inset-0"
            onClick={() => {
              setIsOpen(false);
              setShowCustomInput(false);
            }} 
          />

          <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-hidden shadow-2xl flex flex-col z-10 border border-slate-200">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Building2 className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                    <span>Pilih Bank / E-Wallet Resmi</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 font-bold">
                      {ALL_BANKS.length} Opsi
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Lengkap dengan logo bank resmi di Indonesia untuk pencairan insentif
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowCustomInput(false);
                }}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Ketik nama bank (contoh: BSI, Mandiri, BCA, BRI, Jago, GoPay)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {BANK_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Picks (Shown when not searching and on "Semua") */}
            {!search && selectedCategory === 'Semua' && (
              <div className="px-4 py-3 bg-emerald-50/50 border-b border-emerald-100">
                <div className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pilihan Populer Mitra Driver:</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {quickPicks.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectBank(b)}
                      className={`p-2 rounded-xl border bg-white text-left transition-all hover:scale-[1.02] flex items-center gap-2 shadow-2xs ${
                        value === b.name
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <BankLogo bankName={b.name} size="xs" />
                      <div className="truncate">
                        <span className="text-[11px] font-black text-slate-900 block truncate">
                          {b.shortName}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Bank Manual Input Option (if picked "Bank Lainnya") */}
            {showCustomInput && (
              <div className="p-4 bg-amber-50 border-b border-amber-200 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950">
                    Ketik Nama Bank Lainnya (BPR / Koperasi):
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="text-amber-800 text-xs hover:underline"
                  >
                    Batal
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: BPR Danagung Bakti"
                    value={customBankInput}
                    onChange={(e) => setCustomBankInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveCustomBank}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition"
                  >
                    Gunakan Bank Ini
                  </button>
                </div>
              </div>
            )}

            {/* Bank List Body */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-slate-100">
              {filteredBanks.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 space-y-3">
                  <p>Bank &quot;{search}&quot; tidak ditemukan di daftar.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomBankInput(search);
                      setShowCustomInput(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition"
                  >
                    <span>Gunakan &quot;{search}&quot; sebagai Bank Lainnya</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredBanks.map((b) => {
                    const isSelected = value === b.name;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleSelectBank(b)}
                        className={`w-full text-left p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <BankLogo bankName={b.name} size="sm" className="shrink-0" />
                          <div className="min-w-0">
                            <div className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                              {b.name}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span
                                className="font-bold px-1.5 py-0.2 rounded text-[10px]"
                                style={{ backgroundColor: b.bgLight, color: b.textColor }}
                              >
                                {b.category}
                              </span>
                              {b.code && (
                                <span className="font-mono text-slate-400">
                                  {b.code}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 flex items-center justify-between">
              <span>Menampilkan {filteredBanks.length} pilihan bank &amp; dompet digital</span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowCustomInput(false);
                }}
                className="font-bold text-emerald-800 hover:text-emerald-900"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
