/* ==========================================================================
   OJOL MENGAJI - ADMIN DPW PORTAL CONTROLLER
   Manajemen Shelter, Guru Mengaji (Asatidz), & Verifikasi Santri Driver
   ========================================================================== */

const adminApp = {
  activeTab: 'shelters',
  participantFilter: 'all',

  // --- Inisialisasi ---
  init() {
    this.checkSession();
  },

  checkSession() {
    const session = window.OjolStore.getSession();
    if (session && session.role === 'admin') {
      this.showSection('dashboard');
      this.initDashboard(session);
    } else {
      this.showSection('login');
    }
  },

  showSection(sectionName) {
    const loginSec = document.getElementById('adminLoginSection');
    const dashSec = document.getElementById('adminDashboardSection');

    if (sectionName === 'dashboard') {
      if (loginSec) loginSec.classList.add('hidden');
      if (dashSec) dashSec.classList.remove('hidden');
    } else {
      if (loginSec) loginSec.classList.remove('hidden');
      if (dashSec) dashSec.classList.add('hidden');
    }
  },

  // --- Otentikasi Admin ---
  handleLogin(e) {
    e.preventDefault();
    const idInput = document.getElementById('adminLoginId').value.trim();
    const pwdInput = document.getElementById('adminLoginPassword').value;

    const btn = document.getElementById('btnAdminLogin');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<div class="spinner"></div><span>Memeriksa Akses...</span>`;
    }

    setTimeout(() => {
      const user = window.OjolStore.getUserByIdentifier(idInput);

      if (!user) {
        this.showToast('Akun tidak ditemukan. Gunakan email / WhatsApp admin yang terdaftar.', 'error');
        this.resetLoginBtn();
        return;
      }

      if (user.role !== 'admin') {
        this.showToast('Akun ini bukan Pengurus DPW / Admin. Silakan masuk melalui halaman santri.', 'error');
        this.resetLoginBtn();
        return;
      }

      if (user.password !== pwdInput) {
        this.showToast('Kata sandi admin salah. Silakan periksa kembali.', 'error');
        this.resetLoginBtn();
        return;
      }

      window.OjolStore.setSession(user);
      this.resetLoginBtn();
      this.showToast(`Ahlan wa Sahlan, ${user.name}!`);
      this.showSection('dashboard');
      this.initDashboard(user);
    }, 450);
  },

  resetLoginBtn() {
    const btn = document.getElementById('btnAdminLogin');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-arrow-right-to-bracket"></i><span>Masuk Sebagai Pengurus</span>`;
    }
  },

  logout() {
    if (!confirm('Apakah Anda yakin ingin keluar dari Portal Admin DPW?')) return;
    window.OjolStore.setSession(null);
    this.showToast('Berhasil keluar dari Portal Admin.');
    this.showSection('login');
    const pwd = document.getElementById('adminLoginPassword');
    if (pwd) pwd.value = '';
  },

  togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPwd = input.type === 'password';
    input.type = isPwd ? 'text' : 'password';
    btn.innerHTML = isPwd ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
  },

  // --- Dashboard Controller ---
  initDashboard(adminUser) {
    const nameEl = document.getElementById('adminNameDisplay');
    if (nameEl && adminUser) nameEl.innerText = adminUser.name || 'Dewan Pengurus DPW';

    this.updateCounters();
    this.switchTab(this.activeTab);
  },

  updateCounters() {
    const shelters = window.OjolStore.getShelters();
    const users = window.OjolStore.getUsers();

    const teachers = users.filter(u => u.role === 'guru');
    const drivers = users.filter(u => u.role === 'peserta');
    const pendingDrivers = drivers.filter(d => d.status === 'pending');

    const countShelterEl = document.getElementById('statShelterCount');
    const countTeacherEl = document.getElementById('statTeacherCount');
    const countDriverEl = document.getElementById('statDriverCount');
    const countPendingEl = document.getElementById('statPendingCount');

    if (countShelterEl) countShelterEl.innerText = shelters.length;
    if (countTeacherEl) countTeacherEl.innerText = teachers.length;
    if (countDriverEl) countDriverEl.innerText = drivers.length;
    if (countPendingEl) countPendingEl.innerText = pendingDrivers.length;

    const badge = document.getElementById('tabPendingBadge');
    if (badge) {
      if (pendingDrivers.length > 0) {
        badge.classList.remove('hidden');
        badge.innerText = pendingDrivers.length;
      } else {
        badge.classList.add('hidden');
      }
    }
  },

  switchTab(tabId) {
    this.activeTab = tabId;

    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.classList.remove('text-emerald-700', 'border-emerald-600', 'bg-emerald-50');
      btn.classList.add('text-slate-500', 'border-transparent');
    });

    const activeBtn = document.getElementById(`admin-tab-${tabId}`);
    if (activeBtn) {
      activeBtn.classList.remove('text-slate-500', 'border-transparent');
      activeBtn.classList.add('text-emerald-700', 'border-emerald-600', 'bg-emerald-50');
    }

    document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.add('hidden'));
    const activeContent = document.getElementById(`admin-content-${tabId}`);
    if (activeContent) activeContent.classList.remove('hidden');

    if (tabId === 'shelters') this.renderShelters();
    else if (tabId === 'teachers') this.renderTeachers();
    else if (tabId === 'participants') this.renderParticipants();
  },

  // ========================================================
  // TAB 1: SHELTERS & GPS GEOFENCING
  // ========================================================
  renderShelters() {
    const list = document.getElementById('adminShelterList');
    if (!list) return;

    const shelters = window.OjolStore.getShelters();

    if (shelters.length === 0) {
      list.innerHTML = `
        <div class="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
          <i class="fas fa-mosque text-3xl mb-2 text-slate-300"></i>
          <p class="text-xs">Belum ada titik shelter terdaftar.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = shelters.map(s => `
      <div class="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-3">
        <div class="flex justify-between items-start gap-3">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-base shrink-0 border border-emerald-100">
              <i class="fas fa-mosque"></i>
            </div>
            <div>
              <h4 class="font-extrabold text-sm text-slate-800">${s.name}</h4>
              <p class="text-xs text-slate-500 mt-0.5">
                <i class="fas fa-location-dot text-emerald-600 mr-1 text-[11px]"></i>
                <span class="font-semibold text-slate-700">${s.region}</span> • ${s.address || '-'}
              </p>
            </div>
          </div>
          <button onclick="adminApp.deleteShelter('${s.id}')" class="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg text-xs transition" title="Hapus Shelter">
            <i class="fas fa-trash-can"></i>
          </button>
        </div>

        <div class="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 flex flex-wrap justify-between items-center gap-2 font-mono border border-slate-100">
          <div class="flex items-center gap-1.5">
            <i class="fas fa-satellite text-teal-600"></i>
            <span>${s.lat}, ${s.lng}</span>
            <a href="https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}" target="_blank" class="text-[10px] text-blue-600 hover:underline font-sans font-bold ml-1 flex items-center gap-0.5">
              <i class="fas fa-arrow-up-right-from-square text-[9px]"></i> Peta
            </a>
          </div>
          <span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-sans font-bold text-[11px]">
            Radius: ${s.radius}m
          </span>
        </div>

        ${s.schedule ? `
          <div class="text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1.5 rounded-lg flex items-center gap-2 border border-amber-100">
            <i class="fas fa-clock text-amber-600 text-xs"></i>
            <span><strong>Jadwal:</strong> ${s.schedule}</span>
          </div>
        ` : ''}
      </div>
    `).join('');
  },

  handleAddShelter(e) {
    e.preventDefault();
    const name = document.getElementById('addShelterName').value.trim();
    const region = document.getElementById('addShelterRegion').value.trim();
    const address = document.getElementById('addShelterAddress').value.trim();
    const lat = parseFloat(document.getElementById('addShelterLat').value);
    const lng = parseFloat(document.getElementById('addShelterLng').value);
    const radius = parseInt(document.getElementById('addShelterRadius').value) || 100;
    const schedule = document.getElementById('addShelterSchedule').value.trim();

    if (isNaN(lat) || isNaN(lng)) {
      this.showToast('Koordinat Latitude dan Longitude harus berupa angka yang valid.', 'error');
      return;
    }

    const newShelter = {
      id: 'sh-' + Date.now(),
      name,
      region,
      address,
      lat,
      lng,
      radius,
      isActive: true,
      schedule: schedule || 'Senin & Kamis (13.00 - 14.30 WIB)'
    };

    window.OjolStore.saveShelter(newShelter);
    this.showToast('Shelter baru berhasil disimpan!');
    this.closeModal('modalAddShelter');
    e.target.reset();
    document.getElementById('addShelterRadius').value = '100';
    this.updateCounters();
    this.renderShelters();
  },

  getCurrentGpsForShelter() {
    if (!navigator.geolocation) {
      this.showToast('Browser tidak mendukung geolokasi GPS.', 'error');
      return;
    }

    this.showToast('Mengakses satelit GPS...', 'info');

    navigator.geolocation.getCurrentPosition(
      pos => {
        document.getElementById('addShelterLat').value = pos.coords.latitude.toFixed(6);
        document.getElementById('addShelterLng').value = pos.coords.longitude.toFixed(6);
        this.showToast('Koordinat GPS berhasil diperoleh!');
      },
      err => {
        this.showToast(`Gagal membaca GPS: ${err.message}`, 'error');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  },

  deleteShelter(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus titik shelter ini?')) return;
    window.OjolStore.deleteShelter(id);
    this.showToast('Shelter telah dihapus.');
    this.updateCounters();
    this.renderShelters();
  },

  // ========================================================
  // TAB 2: GURU MENGAJI (ASATIDZ)
  // ========================================================
  renderTeachers() {
    const list = document.getElementById('adminTeacherList');
    if (!list) return;

    const teachers = window.OjolStore.getUsers().filter(u => u.role === 'guru');
    const shelters = window.OjolStore.getShelters();

    if (teachers.length === 0) {
      list.innerHTML = `
        <div class="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
          <i class="fas fa-chalkboard-user text-3xl mb-2 text-slate-300"></i>
          <p class="text-xs">Belum ada data ustadz / guru mengaji.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = teachers.map(t => {
      const assigned = (t.assignedShelters || []).map(sid => {
        const sh = shelters.find(s => s.id === sid);
        return sh ? sh.name : 'Unknown';
      }).join(', ') || 'Belum ada shelter penugasan';

      const cleanPhone = (t.phone || '').replace(/\D/g, '');

      return `
        <div class="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black text-base border border-teal-100 shrink-0">
              ${t.name.charAt(0)}
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-extrabold text-sm text-slate-800 truncate">${t.name}</h4>
              <p class="text-xs text-slate-500 mt-0.5">
                <i class="fas fa-phone mr-1 text-[10px] text-teal-600"></i>${t.phone || '-'}
              </p>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <a href="https://wa.me/${cleanPhone}" target="_blank" class="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1.5 border border-emerald-200" title="Chat WhatsApp">
                <i class="fab fa-whatsapp text-sm"></i>
                <span class="hidden sm:inline">WhatsApp</span>
              </a>
              <button onclick="adminApp.deleteTeacher('${t.uid}')" class="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg text-xs transition" title="Hapus Akun Guru">
                <i class="fas fa-trash-can"></i>
              </button>
            </div>
          </div>

          <div class="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 border border-slate-100">
            <span class="font-bold text-slate-700 block mb-1">
              <i class="fas fa-map-pin mr-1 text-teal-600"></i>Shelter Penugasan:
            </span>
            <span class="text-slate-600">${assigned}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  openAddTeacherModal() {
    const container = document.getElementById('addTeacherShelterCheckboxes');
    if (container) {
      const shelters = window.OjolStore.getShelters();
      if (shelters.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 p-2">Belum ada shelter. Tambah shelter terlebih dahulu.</p>';
      } else {
        container.innerHTML = shelters.map(s => `
          <label class="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg cursor-pointer text-xs">
            <input type="checkbox" value="${s.id}" class="teacher-shelter-cb rounded text-emerald-600 focus:ring-emerald-500">
            <span class="font-semibold text-slate-700">${s.name}</span>
            <span class="text-[10px] text-slate-400 font-mono">(${s.region})</span>
          </label>
        `).join('');
      }
    }
    this.showModal('modalAddTeacher');
  },

  handleAddTeacher(e) {
    e.preventDefault();
    const name = document.getElementById('addTeacherName').value.trim();
    const phone = document.getElementById('addTeacherPhone').value.trim();
    const password = document.getElementById('addTeacherPassword').value.trim();

    const checkedBoxes = document.querySelectorAll('.teacher-shelter-cb:checked');
    const assignedShelters = Array.from(checkedBoxes).map(cb => cb.value);

    if (assignedShelters.length === 0) {
      this.showToast('Pilih minimal 1 shelter penugasan untuk ustadz.', 'error');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const newTeacher = {
      uid: 'u-guru-' + Date.now(),
      role: 'guru',
      name,
      phone,
      email: `${cleanPhone}@ojolmengaji.id`,
      password: password || 'guru123',
      region: 'Jakarta',
      assignedShelters,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    window.OjolStore.saveUser(newTeacher);
    this.showToast('Akun guru mengaji berhasil dibuat!');
    this.closeModal('modalAddTeacher');
    e.target.reset();
    document.getElementById('addTeacherPassword').value = 'guru123';
    this.updateCounters();
    this.renderTeachers();
  },

  deleteTeacher(uid) {
    if (!confirm('Apakah Anda yakin ingin menghapus akun guru ini?')) return;
    window.OjolStore.deleteUser(uid);
    this.showToast('Akun guru telah dihapus.');
    this.updateCounters();
    this.renderTeachers();
  },

  // ========================================================
  // TAB 3: SANTRI DRIVER (PESERTA)
  // ========================================================
  filterParticipants(filter) {
    this.participantFilter = filter;
    document.querySelectorAll('.part-filter-btn').forEach(btn => {
      btn.classList.remove('bg-emerald-600', 'text-white', 'shadow-sm');
      btn.classList.add('bg-white', 'text-slate-600', 'hover:bg-slate-50');
    });

    const activeBtn = document.getElementById(`btnFilter${filter.charAt(0).toUpperCase() + filter.slice(1)}`);
    if (activeBtn) {
      activeBtn.classList.remove('bg-white', 'text-slate-600', 'hover:bg-slate-50');
      activeBtn.classList.add('bg-emerald-600', 'text-white', 'shadow-sm');
    }

    this.renderParticipants();
  },

  renderParticipants() {
    const list = document.getElementById('adminParticipantList');
    if (!list) return;

    let drivers = window.OjolStore.getUsers().filter(u => u.role === 'peserta');
    const shelters = window.OjolStore.getShelters();

    if (this.participantFilter !== 'all') {
      drivers = drivers.filter(d => d.status === this.participantFilter);
    }

    if (drivers.length === 0) {
      list.innerHTML = `
        <div class="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
          <i class="fas fa-motorcycle text-3xl mb-2 text-slate-300"></i>
          <p class="text-xs">Tidak ada data santri driver (${this.participantFilter}).</p>
        </div>
      `;
      return;
    }

    list.innerHTML = drivers.map(d => {
      const sh = shelters.find(s => s.id === d.shelterId);
      const shelterName = sh ? sh.name : 'Belum Ditentukan';
      const isPending = d.status === 'pending';
      const cleanPhone = (d.phone || '').replace(/\D/g, '');

      const categoryInfo = window.LEARNING_CATEGORIES[d.learningCategory] || {
        name: 'Kategori ' + (d.learningCategory || 'A'),
        badgeClass: 'bg-slate-100 text-slate-700'
      };

      return `
        <div class="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-3">
          <div class="flex items-start gap-3">
            <div class="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-base shrink-0 border border-emerald-200">
              ${d.name.charAt(0)}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h4 class="font-extrabold text-sm text-slate-800 truncate">${d.name}</h4>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  ${d.appProvider || 'Ojol'}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                <i class="fas fa-mosque text-[11px] text-emerald-600 mr-1"></i>${shelterName}
              </p>
              
              <div class="flex items-center gap-2 mt-2">
                ${isPending 
                  ? `<span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200"><i class="fas fa-clock mr-1"></i>Menunggu Verifikasi</span>`
                  : `<span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200"><i class="fas fa-check-circle mr-1"></i>Terverifikasi</span>`
                }
                <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full ${categoryInfo.badgeClass}">
                  Kat: ${d.learningCategory || 'A'}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions Bar -->
          <div class="flex items-center gap-2 pt-2 border-t border-slate-100">
            <a href="https://wa.me/${cleanPhone}" target="_blank" class="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition">
              <i class="fab fa-whatsapp text-emerald-600 text-sm"></i>
              <span>Hubungi</span>
            </a>

            ${isPending ? `
              <button onclick="adminApp.verifyParticipant('${d.uid}')" class="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition">
                <i class="fas fa-check"></i>
                <span>Setujui Verifikasi</span>
              </button>
            ` : `
              <button onclick="adminApp.demoteParticipant('${d.uid}')" class="text-xs text-slate-400 hover:text-amber-600 py-1.5 px-3 rounded-lg hover:bg-amber-50 font-medium transition">
                Batalkan Verifikasi
              </button>
            `}

            <button onclick="adminApp.deleteParticipant('${d.uid}')" class="w-8 h-8 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center text-xs transition" title="Hapus Akun Santri">
              <i class="fas fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  verifyParticipant(uid) {
    window.OjolStore.updateUserStatus(uid, 'verified');
    this.showToast('Santri berhasil diverifikasi & akun kini aktif!');
    this.updateCounters();
    this.renderParticipants();
  },

  demoteParticipant(uid) {
    if (!confirm('Kembalikan status peserta ini ke pending (menunggu verifikasi)?')) return;
    window.OjolStore.updateUserStatus(uid, 'pending');
    this.showToast('Status santri dikembalikan ke antrean pending.');
    this.updateCounters();
    this.renderParticipants();
  },

  deleteParticipant(uid) {
    if (!confirm('Hapus data santri ini secara permanen?')) return;
    window.OjolStore.deleteUser(uid);
    this.showToast('Data santri telah dihapus.');
    this.updateCounters();
    this.renderParticipants();
  },

  // ========================================================
  // UTILITIES & MODALS
  // ========================================================
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const bg = type === 'success' 
      ? 'bg-emerald-700 text-white' 
      : type === 'error' 
        ? 'bg-rose-600 text-white' 
        : 'bg-amber-600 text-white';

    const icon = type === 'success' 
      ? 'fa-circle-check' 
      : type === 'error' 
        ? 'fa-circle-exclamation' 
        : 'fa-triangle-exclamation';

    toast.className = `${bg} px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold transform transition-all duration-300 opacity-0 -translate-y-2 pointer-events-auto`;
    toast.innerHTML = `
      <i class="fas ${icon} text-base"></i>
      <span class="flex-1">${message}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('opacity-0', '-translate-y-2');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', '-translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
};

// Auto-run saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  adminApp.init();
});
