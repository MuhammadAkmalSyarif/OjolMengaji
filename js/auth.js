/* ==========================================================================
   OJOL MENGAJI - AUTHENTICATION & ONBOARDING CONTROLLER
   Handles Login, Driver Registration, OTP Verification, Biometrics & Modals
   ========================================================================== */

const appAuth = {
  verifiedPhone: null,
  simulatedOtp: '749215',
  otpTimer: null,
  otpCountdown: 60,

  init() {
    this.initPasswordListeners();
    this.initQuickDemoCheck();
  },

  // --- Password Strength & Matching ---
  initPasswordListeners() {
    const pwdInput = document.getElementById('regPassword');
    if (pwdInput) {
      pwdInput.addEventListener('input', () => this.evaluatePassword(pwdInput.value));
    }

    const confirmInput = document.getElementById('regConfirmPassword');
    if (confirmInput) {
      confirmInput.addEventListener('input', () => this.checkPasswordMatch());
    }
  },

  evaluatePassword(val) {
    const bar1 = document.getElementById('bar-1');
    const bar2 = document.getElementById('bar-2');
    const bar3 = document.getElementById('bar-3');
    const minCharCheck = document.getElementById('minCharCheck');

    if (!bar1 || !bar2 || !bar3) return;

    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/[0-9]/.test(val) || /[^A-Za-z0-9]/.test(val)) score++;

    // Reset bars
    [bar1, bar2, bar3].forEach(b => {
      b.className = 'h-1.5 rounded-full bg-slate-200 transition-all duration-300';
    });

    if (val.length === 0) {
      if (minCharCheck) {
        minCharCheck.className = 'text-[11px] font-semibold text-slate-400 flex items-center gap-1';
        minCharCheck.innerHTML = '<i class="far fa-circle"></i> Min. 8 Karakter';
      }
      return;
    }

    if (score === 1) {
      bar1.className = 'h-1.5 rounded-full bg-amber-500 transition-all duration-300';
    } else if (score === 2) {
      bar1.className = 'h-1.5 rounded-full bg-emerald-500 transition-all duration-300';
      bar2.className = 'h-1.5 rounded-full bg-emerald-500 transition-all duration-300';
    } else if (score >= 3) {
      bar1.className = 'h-1.5 rounded-full bg-emerald-600 transition-all duration-300';
      bar2.className = 'h-1.5 rounded-full bg-emerald-600 transition-all duration-300';
      bar3.className = 'h-1.5 rounded-full bg-emerald-600 transition-all duration-300';
    }

    if (minCharCheck) {
      if (val.length >= 8) {
        minCharCheck.className = 'text-[11px] font-bold text-emerald-600 flex items-center gap-1';
        minCharCheck.innerHTML = '<i class="fas fa-check-circle"></i> Min. 8 Karakter';
      } else {
        minCharCheck.className = 'text-[11px] font-semibold text-amber-600 flex items-center gap-1';
        minCharCheck.innerHTML = '<i class="fas fa-exclamation-circle"></i> Min. 8 Karakter';
      }
    }
  },

  checkPasswordMatch() {
    const pwd = document.getElementById('regPassword')?.value || '';
    const confirm = document.getElementById('regConfirmPassword')?.value || '';
    const matchHint = document.getElementById('confirmMatchHint');
    if (!matchHint) return;

    if (!confirm) {
      matchHint.classList.add('hidden');
      return;
    }

    matchHint.classList.remove('hidden');
    if (pwd === confirm) {
      matchHint.className = 'text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1';
      matchHint.innerHTML = '<i class="fas fa-check-circle"></i> Kata sandi cocok';
    } else {
      matchHint.className = 'text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1';
      matchHint.innerHTML = '<i class="fas fa-times-circle"></i> Kata sandi tidak cocok';
    }
  },

  togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPwd = input.type === 'password';
    input.type = isPwd ? 'text' : 'password';
    
    // Switch icon between eye and eye-slash
    const icon = btn.querySelector('i');
    if (icon) {
      if (isPwd) {
        icon.className = 'far fa-eye text-emerald-700 text-base';
      } else {
        icon.className = 'far fa-eye-slash text-slate-400 text-base';
      }
    }
  },

  // --- LOGIN FLOW ---
  handleLogin(e) {
    e.preventDefault();
    const idInput = document.getElementById('loginId')?.value.trim();
    const pwd = document.getElementById('loginPassword')?.value;
    const btn = document.getElementById('btnLogin');

    if (!idInput) {
      this.showToast('Masukkan nomor WhatsApp atau Email Anda.', 'error');
      return;
    }
    if (!pwd) {
      this.showToast('Masukkan kata sandi akun Anda.', 'error');
      return;
    }

    this.setButtonLoading(btn, true, 'Memverifikasi...');

    setTimeout(() => {
      // Find user via OjolStore
      let user = null;
      if (window.OjolStore) {
        user = window.OjolStore.getUserByIdentifier(idInput);
      } else {
        // Fallback check
        const users = JSON.parse(localStorage.getItem('ojol_data_users_v3') || '[]');
        user = users.find(u => {
          const uEmail = (u.email || '').toLowerCase();
          const cleanPhone = (u.phone || '').replace(/\D/g, '');
          const cleanInput = idInput.replace(/\D/g, '');
          return uEmail === idInput.toLowerCase() || (cleanInput && cleanPhone.includes(cleanInput));
        });
      }

      if (!user) {
        this.setButtonLoading(btn, false, 'Masuk Sekarang <i class="fas fa-arrow-right text-xs"></i>');
        this.showToast('Akun tidak ditemukan. Periksa kembali nomor WA atau Email Anda.', 'error');
        return;
      }

      if (user.password !== pwd) {
        this.setButtonLoading(btn, false, 'Masuk Sekarang <i class="fas fa-arrow-right text-xs"></i>');
        this.showToast('Kata sandi yang Anda masukkan salah.', 'error');
        return;
      }

      // Success Login
      if (window.OjolStore) {
        window.OjolStore.setSession(user);
      } else {
        localStorage.setItem('ojol_active_session_v3', JSON.stringify(user));
      }

      this.showToast(`Ahlan wa Sahlan, ${user.name}!`, 'success');

      setTimeout(() => {
        if (user.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'index.html';
        }
      }, 700);
    }, 600);
  },

  // --- BIOMETRIC / FACE ID SIMULATION ---
  handleBiometricLogin() {
    const modal = document.getElementById('biometricModal');
    if (!modal) return;
    modal.classList.remove('hidden');

    const statusText = document.getElementById('bioStatusText');
    const bioIcon = document.getElementById('bioIcon');
    if (statusText) statusText.textContent = 'Memindai Sidik Jari / Face ID...';
    if (bioIcon) bioIcon.className = 'fas fa-fingerprint text-5xl text-emerald-600 animate-pulse';

    setTimeout(() => {
      // Check last known session or default driver
      let user = null;
      if (window.OjolStore) {
        const users = window.OjolStore.getUsers();
        user = users.find(u => u.role === 'peserta' && u.status === 'verified') || users[0];
      }

      if (user) {
        if (statusText) statusText.textContent = `Sidik jari cocok! Selamat datang, ${user.name}`;
        if (bioIcon) bioIcon.className = 'fas fa-check-circle text-5xl text-emerald-600';

        if (window.OjolStore) {
          window.OjolStore.setSession(user);
        }

        setTimeout(() => {
          modal.classList.add('hidden');
          this.showToast(`Biometrik Berhasil! Masuk sebagai ${user.name}`, 'success');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 600);
        }, 800);
      } else {
        if (statusText) statusText.textContent = 'Biometrik belum terdaftar. Silakan masuk manual.';
        setTimeout(() => modal.classList.add('hidden'), 1500);
      }
    }, 1200);
  },

  closeBiometricModal() {
    const modal = document.getElementById('biometricModal');
    if (modal) modal.classList.add('hidden');
  },

  // --- GOOGLE SIGN IN SIMULATION ---
  handleGoogleLogin() {
    this.showToast('Menghubungkan dengan Akun Google...', 'info');
    setTimeout(() => {
      let user = null;
      if (window.OjolStore) {
        user = window.OjolStore.getUserByIdentifier('bambang.driver@gmail.com');
      }
      if (user) {
        if (window.OjolStore) window.OjolStore.setSession(user);
        this.showToast(`Masuk via Google sebagai ${user.name}`, 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 700);
      } else {
        this.showToast('Simulasi Google: Bambang Pamungkas (Driver Gojek)', 'success');
      }
    }, 700);
  },

  // --- FORGOT PASSWORD MODAL ---
  openForgotPasswordModal() {
    const modal = document.getElementById('forgotPwdModal');
    if (modal) modal.classList.remove('hidden');
  },

  closeForgotPasswordModal() {
    const modal = document.getElementById('forgotPwdModal');
    if (modal) modal.classList.add('hidden');
  },

  submitForgotPassword(e) {
    e.preventDefault();
    const phoneInput = document.getElementById('forgotPhoneInput')?.value.trim();
    if (!phoneInput) {
      this.showToast('Masukkan nomor WhatsApp Anda.', 'error');
      return;
    }
    this.closeForgotPasswordModal();
    this.showToast(`Tautan reset kata sandi telah dikirim ke WhatsApp +62 ${phoneInput}`, 'success');
  },

  // --- OTP VERIFICATION FLOW ---
  triggerOtpModal() {
    const phoneInput = document.getElementById('regPhone')?.value.trim();
    if (!phoneInput) {
      this.showToast('Silakan isi Nomor WhatsApp Aktif terlebih dahulu.', 'error');
      document.getElementById('regPhone')?.focus();
      return;
    }

    // Generate random 6-digit OTP
    this.simulatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const cleanPhone = phoneInput.replace(/^0+/, '').replace(/\D/g, '');

    const targetPhoneSpan = document.getElementById('otpTargetPhone');
    if (targetPhoneSpan) {
      targetPhoneSpan.textContent = `+62 ${cleanPhone}`;
    }

    const modal = document.getElementById('otpModal');
    if (modal) modal.classList.remove('hidden');

    // Focus first OTP field
    const firstOtp = document.getElementById('otp-1');
    if (firstOtp) {
      setTimeout(() => firstOtp.focus(), 150);
    }

    // Start countdown
    this.startOtpCountdown();

    // Show simulated toast containing the OTP for instant testability
    setTimeout(() => {
      this.showToast(`[WhatsApp Bot Ojol Mengaji] Kode OTP Anda: ${this.simulatedOtp}`, 'info', 7000);
    }, 800);
  },

  startOtpCountdown() {
    clearInterval(this.otpTimer);
    this.otpCountdown = 60;
    const timerEl = document.getElementById('otpCountdownTimer');
    const resendBtn = document.getElementById('btnResendOtp');

    if (resendBtn) resendBtn.classList.add('pointer-events-none', 'opacity-50');

    this.otpTimer = setInterval(() => {
      this.otpCountdown--;
      if (timerEl) {
        timerEl.textContent = `(${this.otpCountdown}s)`;
      }

      if (this.otpCountdown <= 0) {
        clearInterval(this.otpTimer);
        if (timerEl) timerEl.textContent = '';
        if (resendBtn) resendBtn.classList.remove('pointer-events-none', 'opacity-50');
      }
    }, 1000);
  },

  resendOtp() {
    this.simulatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    this.startOtpCountdown();
    this.showToast(`Kode OTP baru dikirim via WA: ${this.simulatedOtp}`, 'info', 6000);
  },

  handleOtpInput(input, index) {
    // Only numbers
    input.value = input.value.replace(/\D/g, '');
    if (input.value && index < 6) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) next.focus();
    }
  },

  handleOtpKeydown(e, index) {
    if (e.key === 'Backspace' && !e.target.value && index > 1) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) {
        prev.focus();
        prev.value = '';
      }
    }
  },

  verifyOtpCode() {
    let enteredCode = '';
    for (let i = 1; i <= 6; i++) {
      enteredCode += (document.getElementById(`otp-${i}`)?.value || '');
    }

    if (enteredCode.length < 6) {
      this.showToast('Masukkan 6 digit kode OTP secara lengkap.', 'error');
      return;
    }

    if (enteredCode !== this.simulatedOtp && enteredCode !== '123456') {
      this.showToast('Kode OTP tidak sesuai. Periksa kembali.', 'error');
      return;
    }

    // Success OTP
    clearInterval(this.otpTimer);
    const modal = document.getElementById('otpModal');
    if (modal) modal.classList.add('hidden');

    const phoneInput = document.getElementById('regPhone');
    this.verifiedPhone = phoneInput?.value.trim();

    // Update WhatsApp verification button in UI
    const otpTriggerBtn = document.getElementById('btnOtpTrigger');
    if (otpTriggerBtn) {
      otpTriggerBtn.innerHTML = '<i class="fas fa-check-circle text-emerald-600"></i> <span class="text-emerald-700 font-bold">Terverifikasi</span>';
      otpTriggerBtn.classList.remove('text-[#059669]', 'hover:text-[#047857]');
      otpTriggerBtn.classList.add('text-emerald-700', 'pointer-events-none');
    }

    this.showToast('Nomor WhatsApp Berhasil Diverifikasi! ✓', 'success');
  },

  closeOtpModal() {
    clearInterval(this.otpTimer);
    const modal = document.getElementById('otpModal');
    if (modal) modal.classList.add('hidden');
  },

  // --- DRIVER REGISTRATION FLOW ---
  handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('regName')?.value.trim();
    const phone = document.getElementById('regPhone')?.value.trim();
    const email = document.getElementById('regEmail')?.value.trim();
    const pwd = document.getElementById('regPassword')?.value;
    const confirmPwd = document.getElementById('regConfirmPassword')?.value;
    const agreement = document.getElementById('regAgreement')?.checked;
    const btn = document.getElementById('btnRegister');

    if (!name) {
      this.showToast('Masukkan nama lengkap sesuai KTP/KK.', 'error');
      document.getElementById('regName')?.focus();
      return;
    }

    if (!phone) {
      this.showToast('Masukkan nomor WhatsApp aktif Anda.', 'error');
      document.getElementById('regPhone')?.focus();
      return;
    }

    if (!email) {
      this.showToast('Masukkan alamat email aktif Anda.', 'error');
      document.getElementById('regEmail')?.focus();
      return;
    }

    if (!pwd || pwd.length < 8) {
      this.showToast('Kata sandi harus minimal 8 karakter.', 'error');
      document.getElementById('regPassword')?.focus();
      return;
    }

    if (pwd !== confirmPwd) {
      this.showToast('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.', 'error');
      document.getElementById('regConfirmPassword')?.focus();
      return;
    }

    if (!agreement) {
      this.showToast('Anda harus menyetujui Syarat & Ketentuan serta Prinsip Muamalah Berkah.', 'error');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    let existingUser = null;
    if (window.OjolStore) {
      existingUser = window.OjolStore.getUserByIdentifier(phone) || window.OjolStore.getUserByIdentifier(email);
    }

    if (existingUser) {
      this.showToast('Nomor WhatsApp atau Email ini sudah terdaftar!', 'error');
      return;
    }

    this.setButtonLoading(btn, true, 'Mendaftarkan...');

    setTimeout(() => {
      const newUser = {
        uid: 'u-driver-' + Date.now(),
        role: 'peserta',
        name: name,
        phone: '0' + cleanPhone.replace(/^62/, '').replace(/^0/, ''),
        email: email,
        password: pwd,
        appProvider: 'Mitra Ojol',
        region: 'DKI Jakarta',
        shelterId: 'sh-gambir', // Default shelter, can be re-assigned by admin
        learningCategory: 'A',
        status: 'pending', // Waiting admin verification as per business rule
        createdAt: new Date().toISOString()
      };

      if (window.OjolStore) {
        window.OjolStore.saveUser(newUser);
        window.OjolStore.setSession(newUser);
      } else {
        const users = JSON.parse(localStorage.getItem('ojol_data_users_v3') || '[]');
        users.push(newUser);
        localStorage.setItem('ojol_data_users_v3', JSON.stringify(users));
        localStorage.setItem('ojol_active_session_v3', JSON.stringify(newUser));
      }

      this.showToast('Pendaftaran Berhasil! Selamat bergabung, Mitra Driver Berkah.', 'success');

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 900);
    }, 700);
  },

  // --- MODALS FOR TERMS & MUAMALAH ---
  showTermsModal() {
    const modal = document.getElementById('termsModal');
    if (modal) modal.classList.remove('hidden');
  },

  closeTermsModal() {
    const modal = document.getElementById('termsModal');
    if (modal) modal.classList.add('hidden');
  },

  showMuamalahModal() {
    const modal = document.getElementById('muamalahModal');
    if (modal) modal.classList.remove('hidden');
  },

  closeMuamalahModal() {
    const modal = document.getElementById('muamalahModal');
    if (modal) modal.classList.add('hidden');
  },

  // --- UI HELPERS ---
  setButtonLoading(btn, isLoading, text) {
    if (!btn) return;
    if (isLoading) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin text-sm"></i> <span>${text}</span>`;
      btn.classList.add('opacity-80', 'cursor-not-allowed');
    } else {
      btn.disabled = false;
      btn.innerHTML = text;
      btn.classList.remove('opacity-80', 'cursor-not-allowed');
    }
  },

  showToast(message, type = 'success', duration = 3500) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-11/12 max-w-sm pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgStyles = {
      success: 'bg-emerald-900/95 text-white border-emerald-500/40',
      error: 'bg-red-900/95 text-white border-red-500/40',
      info: 'bg-slate-900/95 text-white border-emerald-500/40'
    };

    const icons = {
      success: 'fas fa-check-circle text-emerald-400',
      error: 'fas fa-exclamation-circle text-red-400',
      info: 'fas fa-info-circle text-amber-400'
    };

    toast.className = `p-3.5 rounded-2xl shadow-xl backdrop-blur-md border text-xs font-semibold flex items-center gap-3 transition-all transform duration-300 pointer-events-auto opacity-0 translate-y-[-10px] ${bgStyles[type] || bgStyles.info}`;
    toast.innerHTML = `
      <i class="${icons[type] || icons.info} text-base shrink-0"></i>
      <span class="flex-1 leading-snug">${message}</span>
      <button onclick="this.parentElement.remove()" class="text-white/60 hover:text-white ml-1"><i class="fas fa-times"></i></button>
    `;

    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove('opacity-0', 'translate-y-[-10px]');
    }, 10);

    // Animate out & remove
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-[-10px]');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // Helper for quick testing
  fillDemoAccount(identifier, password) {
    const idInput = document.getElementById('loginId');
    const pwdInput = document.getElementById('loginPassword');
    if (idInput) idInput.value = identifier;
    if (pwdInput) pwdInput.value = password;
    this.showToast(`Kredensial demo terisi: ${identifier}`, 'info');
  },

  initQuickDemoCheck() {
    // Check if query param ?demo=driver is present
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'driver') {
      this.fillDemoAccount('081234567890', 'ojol123');
    }
  }
};

// Auto initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  appAuth.init();
});

