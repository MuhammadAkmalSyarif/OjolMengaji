/* ==========================================================================
   OJOL MENGAJI - APPLICATION LOGIC & CONTROLLER
   Clean, modern, robust mobile-first experience with GPS Geofencing
   ========================================================================== */

const app = {
  activeAdminTab: 'shelters',
  participantFilter: 'all',

  // --- Initialization ---
  init() {
    this.switchView('splash');
    this.renderShelterDropdowns();

    // Smooth transition from splash to main flow
    setTimeout(() => {
      const session = window.OjolStore.getSession();
      if (session) {
        if (session.role === 'admin') {
          window.location.href = 'admin.html';
          return;
        }
        this.routeUser(session);
      } else {
        this.switchView('login');
      }
    }, 900);
  },

  // --- View Switching ---
  switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
      target.classList.remove('hidden');
    }

    const header = document.getElementById('mainHeader');
    if (['teacher', 'participant'].includes(viewId)) {
      if (header) header.classList.remove('hidden');
    } else {
      if (header) header.classList.add('hidden');
    }

    // Scroll container to top
    const mainContent = document.getElementById('mainContent');
    if (mainContent) mainContent.scrollTop = 0;
  },

  routeUser(user) {
    if (!user) {
      this.switchView('login');
      return;
    }

    if (user.role === 'admin') {
      window.location.href = 'admin.html';
      return;
    } else if (user.role === 'guru') {
      this.initTeacherDashboard();
      this.switchView('teacher');
    } else {
      this.initParticipantDashboard();
      this.switchView('participant');
    }
  },

  // --- Authentication ---
  handleLogin(e) {
    e.preventDefault();
    const idInput = document.getElementById('loginId').value;
    const pwd = document.getElementById('loginPassword').value;

    this.toggleSpinner('btnLogin', true);

    setTimeout(() => {
      const user = window.OjolStore.getUserByIdentifier(idInput);

      if (!user) {
        this.showToast('Akun tidak ditemukan. Periksa kembali No. HP / Email Anda.', 'error');
        this.toggleSpinner('btnLogin', false);
        return;
      }

      if (user.password !== pwd) {
        this.showToast('Kata sandi salah. Silakan coba lagi.', 'error');
        this.toggleSpinner('btnLogin', false);
        return;
      }

      window.OjolStore.setSession(user);

      if (user.role === 'admin') {
        this.showToast(`Ahlan wa Sahlan, ${user.name}! Mengalihkan ke Halaman Admin...`);
        this.toggleSpinner('btnLogin', false);
        setTimeout(() => {
          window.location.href = 'admin.html';
        }, 400);
        return;
      }

      this.showToast(`Ahlan wa Sahlan, ${user.name}!`);
      this.toggleSpinner('btnLogin', false);
      this.routeUser(user);
    }, 400);
  },

  handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const provider = document.getElementById('regProvider').value;
    const region = document.getElementById('regRegion').value.trim();
    const shelterId = document.getElementById('regShelter').value;
    const password = document.getElementById('regPassword').value;

    if (!shelterId) {
      this.showToast('Silakan pilih shelter utama halaqah.', 'error');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const users = window.OjolStore.getUsers();
    const isDuplicate = users.find(u => (u.phone || '').replace(/\D/g, '') === cleanPhone);

    if (isDuplicate) {
      this.showToast('Nomor WhatsApp ini sudah terdaftar!', 'error');
      return;
    }

    this.toggleSpinner('btnRegister', true);

    setTimeout(() => {
      const newUser = {
        uid: 'u-driver-' + Date.now(),
        role: 'peserta',
        name,
        phone,
        email: `${cleanPhone}@ojolmengaji.id`,
        password,
        appProvider: provider,
        region,
        shelterId,
        learningCategory: 'A',
        status: 'pending', // Waiting admin verification
        createdAt: new Date().toISOString()
      };

      window.OjolStore.saveUser(newUser);
      window.OjolStore.setSession(newUser);

      this.showToast('Pendaftaran berhasil! Akun menunggu verifikasi admin.');
      this.toggleSpinner('btnRegister', false);
      this.routeUser(newUser);
    }, 500);
  },

  logout() {
    window.OjolStore.setSession(null);
    this.showToast('Berhasil keluar dari akun.');
    this.switchView('login');
  },

  togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
      input.type = 'password';
      btn.innerHTML = '<i class="fas fa-eye"></i>';
    }
  },

  // --- Dynamic Dropdown Options ---
  renderShelterDropdowns() {
    const shelters = window.OjolStore.getShelters().filter(s => s.isActive);
    const regSelect = document.getElementById('regShelter');
    const teacherCheckboxes = document.getElementById('addTeacherShelterCheckboxes');

    if (regSelect) {
      let opt = '<option value="">Pilih Shelter Utama...</option>';
      shelters.forEach(s => {
        opt += `<option value="${s.id}">${s.name} (${s.region})</option>`;
      });
      regSelect.innerHTML = opt;
    }

    if (teacherCheckboxes) {
      let cbs = '';
      shelters.forEach(s => {
        cbs += `
          <label class="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-emerald-50">
            <input type="checkbox" value="${s.id}" class="teacher-shelter-cb w-4 h-4 text-emerald-600 rounded">
            <div class="text-xs">
              <span class="font-bold text-slate-700">${s.name}</span>
              <span class="text-[10px] text-slate-400 block">${s.region} • R: ${s.radius}m</span>
            </div>
          </label>
        `;
      });
      teacherCheckboxes.innerHTML = cbs;
    }
  },

  // ========================================================
  // ADMIN DASHBOARD
  // ========================================================
  initAdminDashboard() {
    const session = window.OjolStore.getSession();
    const adminNameEl = document.getElementById('adminNameDisplay');
    if (adminNameEl && session) adminNameEl.innerText = session.name;

    this.updateAdminCounters();
    this.renderShelterDropdowns();
    this.switchAdminTab(this.activeAdminTab);
  },

  updateAdminCounters() {
    const shelters = window.OjolStore.getShelters();
    const users = window.OjolStore.getUsers();

    const teachers = users.filter(u => u.role === 'guru');
    const drivers = users.filter(u => u.role === 'peserta');
    const pendingDrivers = drivers.filter(d => d.status === 'pending');

    document.getElementById('statShelterCount').innerText = shelters.length;
    document.getElementById('statTeacherCount').innerText = teachers.length;
    document.getElementById('statDriverCount').innerText = drivers.length;
    document.getElementById('statPendingCount').innerText = pendingDrivers.length;

    const badge = document.getElementById('tabPendingBadge');
    if (badge) {
      if (pendingDrivers.length > 0) badge.classList.remove('hidden');
      else badge.classList.add('hidden');
    }
  },

  switchAdminTab(tabId) {
    this.activeAdminTab = tabId;

    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.classList.remove('text-emerald-700', 'border-emerald-600');
      btn.classList.add('text-slate-400', 'border-transparent');
    });

    const activeBtn = document.getElementById(`admin-tab-${tabId}`);
    if (activeBtn) {
      activeBtn.classList.remove('text-slate-400', 'border-transparent');
      activeBtn.classList.add('text-emerald-700', 'border-emerald-600');
    }

    document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.add('hidden'));
    const activeContent = document.getElementById(`admin-content-${tabId}`);
    if (activeContent) activeContent.classList.remove('hidden');

    if (tabId === 'shelters') this.renderAdminShelters();
    else if (tabId === 'teachers') this.renderAdminTeachers();
    else if (tabId === 'participants') this.renderAdminParticipants();
  },

  renderAdminShelters() {
    const list = document.getElementById('adminShelterList');
    const shelters = window.OjolStore.getShelters();

    if (shelters.length === 0) {
      list.innerHTML = `<div class="p-6 bg-white rounded-2xl text-center text-slate-400 text-xs">Belum ada titik shelter terdaftar.</div>`;
      return;
    }

    list.innerHTML = shelters.map(s => `
      <div class="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-2">
        <div class="flex justify-between items-start">
          <div class="flex items-start gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs mt-0.5">
              <i class="fas fa-mosque"></i>
            </div>
            <div>
              <h4 class="font-extrabold text-xs text-slate-800">${s.name}</h4>
              <p class="text-[11px] text-slate-500 mt-0.5"><i class="fas fa-location-dot text-emerald-600 mr-1 text-[10px]"></i>${s.region} • ${s.address || '-'}</p>
            </div>
          </div>
          <button onclick="app.deleteShelter('${s.id}')" class="text-slate-300 hover:text-red-500 p-1 text-xs" title="Hapus Shelter">
            <i class="fas fa-trash-can"></i>
          </button>
        </div>

        <div class="bg-slate-50 p-2 rounded-xl text-[10px] text-slate-600 flex flex-wrap justify-between items-center gap-1 font-mono">
          <span><i class="fas fa-satellite mr-1 text-teal-600"></i>${s.lat}, ${s.lng}</span>
          <span class="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-sans font-bold">Radius: ${s.radius}m</span>
        </div>

        ${s.schedule ? `<div class="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded-lg flex items-center gap-1.5"><i class="fas fa-clock text-[9px]"></i><span>${s.schedule}</span></div>` : ''}
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
      this.showToast('Koordinat Latitude dan Longitude harus berupa angka valid.', 'error');
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
    this.closeModal('modalShelter');
    this.updateAdminCounters();
    this.renderShelterDropdowns();
    this.renderAdminShelters();
  },

  getCurrentGpsForShelter() {
    if (!navigator.geolocation) {
      this.showToast('Browser Anda tidak mendukung geolokasi GPS.', 'error');
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
    if (!confirm('Hapus shelter ini?')) return;
    window.OjolStore.deleteShelter(id);
    this.showToast('Shelter telah dihapus.');
    this.updateAdminCounters();
    this.renderShelterDropdowns();
    this.renderAdminShelters();
  },

  renderAdminTeachers() {
    const list = document.getElementById('adminTeacherList');
    const teachers = window.OjolStore.getUsers().filter(u => u.role === 'guru');
    const shelters = window.OjolStore.getShelters();

    if (teachers.length === 0) {
      list.innerHTML = `<div class="p-6 bg-white rounded-2xl text-center text-slate-400 text-xs">Belum ada data guru / ustadz.</div>`;
      return;
    }

    list.innerHTML = teachers.map(t => {
      const assigned = (t.assignedShelters || []).map(sid => {
        const sh = shelters.find(s => s.id === sid);
        return sh ? sh.name : 'Unknown';
      }).join(', ') || 'Belum ada shelter penugasan';

      const cleanPhone = (t.phone || '').replace(/\D/g, '');

      return `
        <div class="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
              ${t.name.charAt(0)}
            </div>
            <div class="flex-1">
              <h4 class="font-extrabold text-xs text-slate-800">${t.name}</h4>
              <p class="text-[11px] text-slate-500 mt-0.5"><i class="fas fa-phone mr-1 text-[9px]"></i>${t.phone}</p>
            </div>
            <a href="https://wa.me/${cleanPhone}" target="_blank" class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center text-xs" title="Chat WhatsApp">
              <i class="fab fa-whatsapp"></i>
            </a>
          </div>

          <div class="bg-slate-50 p-2 rounded-xl text-[10px] text-slate-600">
            <span class="font-bold text-slate-700 block mb-0.5"><i class="fas fa-map-pin mr-1 text-teal-600"></i>Shelter Penugasan:</span>
            <span>${assigned}</span>
          </div>
        </div>
      `;
    }).join('');
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
      password,
      region: 'Jakarta',
      assignedShelters,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    window.OjolStore.saveUser(newTeacher);
    this.showToast('Akun guru mengaji berhasil dibuat!');
    this.closeModal('modalTeacher');
    this.updateAdminCounters();
    this.renderAdminTeachers();
  },

  filterParticipants(filter) {
    this.participantFilter = filter;
    document.querySelectorAll('.part-filter-btn').forEach(btn => {
      btn.classList.remove('bg-white', 'text-slate-800', 'shadow-sm');
      btn.classList.add('text-slate-600');
    });

    const activeBtn = document.getElementById(`btnFilter${filter.charAt(0).toUpperCase() + filter.slice(1)}`);
    if (activeBtn) {
      activeBtn.classList.remove('text-slate-600');
      activeBtn.classList.add('bg-white', 'text-slate-800', 'shadow-sm');
    }

    this.renderAdminParticipants();
  },

  renderAdminParticipants() {
    const list = document.getElementById('adminParticipantList');
    let drivers = window.OjolStore.getUsers().filter(u => u.role === 'peserta');
    const shelters = window.OjolStore.getShelters();

    if (this.participantFilter !== 'all') {
      drivers = drivers.filter(d => d.status === this.participantFilter);
    }

    if (drivers.length === 0) {
      list.innerHTML = `<div class="p-6 bg-white rounded-2xl text-center text-slate-400 text-xs">Tidak ada data peserta (${this.participantFilter}).</div>`;
      return;
    }

    list.innerHTML = drivers.map(d => {
      const sh = shelters.find(s => s.id === d.shelterId);
      const shelterName = sh ? sh.name : 'Belum Ditentukan';
      const isPending = d.status === 'pending';
      const cleanPhone = (d.phone || '').replace(/\D/g, '');

      const categoryInfo = window.LEARNING_CATEGORIES[d.learningCategory] || { name: 'Kategori ' + (d.learningCategory || 'A'), badgeClass: 'bg-slate-100 text-slate-700' };

      return `
        <div class="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
          <div class="flex items-start gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-sm shrink-0">
              ${d.name.charAt(0)}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <h4 class="font-extrabold text-xs text-slate-800 truncate">${d.name}</h4>
                <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">${d.appProvider || 'Ojol'}</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5"><i class="fas fa-mosque text-[10px] text-emerald-600 mr-1"></i>${shelterName}</p>
              
              <div class="flex items-center gap-1.5 mt-1.5">
                ${isPending 
                  ? `<span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800"><i class="fas fa-clock mr-1"></i>Menunggu Verifikasi</span>`
                  : `<span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800"><i class="fas fa-check-circle mr-1"></i>Terverifikasi</span>`
                }
                <span class="text-[9px] font-bold px-2 py-0.5 rounded-full ${categoryInfo.badgeClass}">Kat: ${d.learningCategory || 'A'}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 pt-1 border-t border-slate-100">
            <a href="https://wa.me/${cleanPhone}" target="_blank" class="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-[11px] font-semibold flex items-center gap-1 border border-slate-200">
              <i class="fab fa-whatsapp text-emerald-600"></i>
              <span>Hubungi</span>
            </a>

            ${isPending ? `
              <button onclick="app.verifyParticipant('${d.uid}')" class="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow flex items-center justify-center gap-1 transition">
                <i class="fas fa-check"></i>
                <span>Setujui Verifikasi</span>
              </button>
            ` : `
              <button onclick="app.demoteParticipant('${d.uid}')" class="text-[10px] text-slate-400 hover:text-amber-600 py-1 px-2">
                Batalkan
              </button>
            `}

            <button onclick="app.deleteParticipant('${d.uid}')" class="w-8 h-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center text-xs transition" title="Hapus Akun">
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
    this.updateAdminCounters();
    this.renderAdminParticipants();
  },

  demoteParticipant(uid) {
    if (!confirm('Kembalikan status peserta ini ke pending?')) return;
    window.OjolStore.updateUserStatus(uid, 'pending');
    this.showToast('Status peserta diubah ke pending.');
    this.updateAdminCounters();
    this.renderAdminParticipants();
  },

  deleteParticipant(uid) {
    if (!confirm('Hapus akun peserta ini?')) return;
    window.OjolStore.deleteUser(uid);
    this.showToast('Akun peserta telah dihapus.');
    this.updateAdminCounters();
    this.renderAdminParticipants();
  },

  // ========================================================
  // TEACHER DASHBOARD
  // ========================================================
  initTeacherDashboard() {
    const session = window.OjolStore.getSession();
    if (!session) return;

    const teacherGreeting = document.getElementById('teacherGreetingName');
    if (teacherGreeting) teacherGreeting.innerText = session.name;

    const myShelters = session.assignedShelters || [];
    const shelters = window.OjolStore.getShelters();
    const assignedNames = myShelters.map(sid => {
      const s = shelters.find(x => x.id === sid);
      return s ? s.name : sid;
    });

    const badge = document.getElementById('teacherAssignedSheltersBadge');
    if (badge) {
      badge.innerText = `${myShelters.length} Shelter (${assignedNames.join(', ')})`;
    }

    this.renderTeacherParticipants();
  },

  renderTeacherParticipants() {
    const session = window.OjolStore.getSession();
    const list = document.getElementById('teacherParticipantList');
    const myShelters = session.assignedShelters || [];

    const allDrivers = window.OjolStore.getUsers().filter(u => u.role === 'peserta');
    const myDrivers = allDrivers.filter(d => myShelters.includes(d.shelterId));

    const countEl = document.getElementById('teacherSantriCount');
    if (countEl) countEl.innerText = `${myDrivers.length} Santri`;

    if (myDrivers.length === 0) {
      list.innerHTML = `<div class="p-6 bg-white rounded-2xl text-center text-slate-400 text-xs">Belum ada peserta di shelter binaan Anda.</div>`;
      return;
    }

    const shelters = window.OjolStore.getShelters();

    list.innerHTML = myDrivers.map(d => {
      const sh = shelters.find(s => s.id === d.shelterId);
      const shelterName = sh ? sh.name : 'Unknown';
      const cleanPhone = (d.phone || '').replace(/\D/g, '');
      const cat = d.learningCategory || 'A';
      const categoryInfo = window.LEARNING_CATEGORIES[cat] || { name: 'Kategori ' + cat, badgeClass: 'bg-emerald-100 text-emerald-800' };

      return `
        <div class="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-extrabold text-sm">
              ${d.name.charAt(0)}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5">
                <h4 class="font-extrabold text-xs text-slate-800 truncate">${d.name}</h4>
                <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">${d.appProvider || 'Ojol'}</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5"><i class="fas fa-mosque mr-1 text-emerald-600 text-[10px]"></i>${shelterName}</p>
            </div>
            <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full ${categoryInfo.badgeClass}">Kat: ${cat}</span>
          </div>

          <div class="flex items-center gap-2 pt-1 border-t border-slate-100">
            <a href="https://wa.me/${cleanPhone}" target="_blank" class="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition">
              <i class="fab fa-whatsapp text-emerald-600"></i>
              <span>Hubungi</span>
            </a>

            <button onclick="app.openAssessmentModal('${d.uid}')" class="flex-1 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1.5 transition">
              <i class="fas fa-pen-to-square"></i>
              <span>Beri Penilaian</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  openAssessmentModal(participantId) {
    const part = window.OjolStore.getUserById(participantId);
    if (!part) return;

    document.getElementById('assessPartId').value = part.uid;
    document.getElementById('assessPartName').innerText = part.name;
    document.getElementById('assessCurrentCatBadge').innerText = `Kat Saat Ini: ${part.learningCategory || 'A'}`;
    document.getElementById('assessCategory').value = part.learningCategory || 'A';

    // Reset Sliders
    document.getElementById('assessScoreTajwid').value = 4;
    document.getElementById('assessTajwidLabel').innerText = '4 / 5';
    document.getElementById('assessScoreFluency').value = 4;
    document.getElementById('assessFluencyLabel').innerText = '4 / 5';
    document.getElementById('assessNotes').value = '';

    this.showModal('modalAssessment');
  },

  handleAssessmentSubmit(e) {
    e.preventDefault();
    const session = window.OjolStore.getSession();
    const partId = document.getElementById('assessPartId').value;
    const tajwid = parseInt(document.getElementById('assessScoreTajwid').value);
    const fluency = parseInt(document.getElementById('assessScoreFluency').value);
    const category = document.getElementById('assessCategory').value;
    const notes = document.getElementById('assessNotes').value.trim();

    this.toggleSpinner('btnSubmitAssessment', true);

    setTimeout(() => {
      window.OjolStore.saveAssessment({
        participantId: partId,
        teacherId: session.uid,
        teacherName: session.name,
        tajwidScore: tajwid,
        fluencyScore: fluency,
        category,
        notes: notes || 'Alhamdulillah bacaan berkembang baik. Terus istiqomah.'
      });

      this.showToast('Penilaian dan evaluasi berhasil disimpan!');
      this.toggleSpinner('btnSubmitAssessment', false);
      this.closeModal('modalAssessment');
      this.renderTeacherParticipants();
    }, 400);
  },

  // ========================================================
  // PARTICIPANT DASHBOARD (Driver Ojol)
  // ========================================================
  initParticipantDashboard() {
    const session = window.OjolStore.getSession();
    if (!session) return;

    // Refresh participant profile from storage
    const user = window.OjolStore.getUserById(session.uid) || session;

    document.getElementById('partAvatar').innerText = (user.name || 'D').charAt(0).toUpperCase();
    document.getElementById('partNameDisplay').innerText = user.name;
    document.getElementById('partPhoneDisplay').innerText = user.phone;
    document.getElementById('partAppProvider').innerText = user.appProvider || 'Ojek Online';

    const shelters = window.OjolStore.getShelters();
    const shelter = shelters.find(s => s.id === user.shelterId);

    document.getElementById('partShelterDisplay').innerText = shelter ? shelter.name : 'Belum Ditentukan';
    document.getElementById('partShelterSchedule').innerText = shelter && shelter.schedule ? shelter.schedule : '-';

    const statusBadge = document.getElementById('partStatusBadge');
    const categoryBadge = document.getElementById('partCategoryBadge');

    const cat = user.learningCategory || 'A';
    const catInfo = window.LEARNING_CATEGORIES[cat] || { name: 'Kategori ' + cat, badgeClass: 'bg-emerald-100 text-emerald-800' };

    categoryBadge.className = `text-[10px] font-bold px-2.5 py-0.5 rounded-full ${catInfo.badgeClass}`;
    categoryBadge.innerText = `Kat: ${cat}`;

    if (user.status === 'verified') {
      statusBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800';
      statusBadge.innerText = 'Akun Aktif';

      document.getElementById('partPendingNotice').classList.add('hidden');
      document.getElementById('partActiveFeatures').classList.remove('hidden');

      this.loadParticipantAttendances();
      this.loadParticipantAssessments();
      this.renderSurahCards();
    } else {
      statusBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800';
      statusBadge.innerText = 'Menunggu Verifikasi';

      document.getElementById('partPendingNotice').classList.remove('hidden');
      document.getElementById('partActiveFeatures').classList.add('hidden');
    }
  },

  doGpsAttendance() {
    const session = window.OjolStore.getSession();
    const user = window.OjolStore.getUserById(session.uid);
    const shelters = window.OjolStore.getShelters();
    const shelter = shelters.find(s => s.id === user.shelterId);

    const resultBox = document.getElementById('attendanceResultBox');
    resultBox.classList.remove('hidden');

    if (!shelter) {
      resultBox.className = 'mt-3 p-3 rounded-xl text-xs font-medium bg-red-50 text-red-700 border border-red-200';
      resultBox.innerHTML = '<i class="fas fa-circle-exclamation mr-1.5"></i> Shelter utama Anda belum diatur.';
      return;
    }

    const isSimulated = document.getElementById('chkSimulatedGps').checked;

    this.toggleSpinner('btnPresensi', true);
    resultBox.className = 'mt-3 p-3 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 animate-pulse';
    resultBox.innerHTML = '<i class="fas fa-spinner fa-spin mr-1.5"></i> Menghubungkan satelit GPS dan menghitung jarak ke shelter...';

    // Simulation Mode Check
    if (isSimulated) {
      setTimeout(() => {
        const simulatedDistance = Math.floor(Math.random() * 25) + 12; // 12-36 meters
        const record = window.OjolStore.recordAttendance({
          uid: user.uid,
          shelterId: shelter.id,
          status: 'present',
          distanceReported: simulatedDistance,
          accuracy: 5
        });

        this.toggleSpinner('btnPresensi', false);
        resultBox.className = 'mt-3 p-3 rounded-xl text-xs font-medium bg-emerald-100 text-emerald-900 border border-emerald-300 animate-fade-in';
        resultBox.innerHTML = `
          <div class="flex items-start gap-2">
            <i class="fas fa-check-circle text-emerald-600 text-base mt-0.5 shrink-0"></i>
            <div>
              <div class="font-bold text-emerald-800">Presensi Berhasil Dicatat!</div>
              <p class="text-[11px] text-emerald-700 mt-0.5">
                Lokasi Anda terverifikasi di area <strong>${shelter.name}</strong> (Jarak: <strong>${simulatedDistance} meter</strong>, Radius: ${shelter.radius}m).
              </p>
            </div>
          </div>
        `;

        this.showToast('✅ Presensi berhasil dicatat!');
        this.loadParticipantAttendances();
      }, 700);
      return;
    }

    // Real Hardware Geolocation Check
    if (!navigator.geolocation) {
      this.toggleSpinner('btnPresensi', false);
      resultBox.className = 'mt-3 p-3 rounded-xl text-xs font-medium bg-red-50 text-red-700 border border-red-200';
      resultBox.innerHTML = '<i class="fas fa-triangle-exclamation mr-1"></i> Perangkat tidak mendukung GPS Geolocation.';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);

        const distance = Math.round(window.calculateDistanceInMeters(userLat, userLng, shelter.lat, shelter.lng));
        const requiredRadius = shelter.radius || 100;

        this.toggleSpinner('btnPresensi', false);

        if (distance <= requiredRadius) {
          window.OjolStore.recordAttendance({
            uid: user.uid,
            shelterId: shelter.id,
            status: 'present',
            distanceReported: distance,
            accuracy
          });

          resultBox.className = 'mt-3 p-3 rounded-xl text-xs font-medium bg-emerald-100 text-emerald-900 border border-emerald-300 animate-fade-in';
          resultBox.innerHTML = `
            <div class="flex items-start gap-2">
              <i class="fas fa-check-circle text-emerald-600 text-base mt-0.5 shrink-0"></i>
              <div>
                <div class="font-bold text-emerald-800">Presensi Berhasil Dicatat!</div>
                <p class="text-[11px] text-emerald-700 mt-0.5">
                  Anda berada di dalam radius <strong>${shelter.name}</strong> (Jarak: <strong>${distance} meter</strong>, Akurasi GPS: ±${accuracy}m).
                </p>
              </div>
            </div>
          `;
          this.showToast('✅ Presensi berhasil!');
          this.loadParticipantAttendances();
        } else {
          resultBox.className = 'mt-3 p-3 rounded-xl text-xs font-medium bg-amber-50 text-amber-900 border border-amber-300 animate-fade-in';
          resultBox.innerHTML = `
            <div class="flex items-start gap-2">
              <i class="fas fa-location-arrow text-amber-600 text-base mt-0.5 shrink-0"></i>
              <div>
                <div class="font-bold text-amber-800">Di Luar Radius Shelter (${distance}m)</div>
                <p class="text-[11px] text-amber-700 mt-0.5">
                  Maksimal radius yang diizinkan adalah <strong>${requiredRadius}m</strong> dari ${shelter.name}. Dekati lokasi shelter atau aktifkan Mode Simulasi untuk pengujian.
                </p>
              </div>
            </div>
          `;
          this.showToast('Di luar radius shelter halaqah', 'warning');
        }
      },
      err => {
        this.toggleSpinner('btnPresensi', false);
        resultBox.className = 'mt-3 p-3 rounded-xl text-xs font-medium bg-red-50 text-red-700 border border-red-200';
        resultBox.innerHTML = `<i class="fas fa-triangle-exclamation mr-1.5"></i> Gagal membaca satelit GPS (${err.message}). Anda dapat mengaktifkan 'Simulasi GPS Shelter' untuk pengujian.`;
        this.showToast('Gagal membaca GPS', 'error');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  },

  loadParticipantAttendances() {
    const session = window.OjolStore.getSession();
    const list = document.getElementById('partAttendanceList');
    const records = window.OjolStore.getAttendancesByUser(session.uid);
    const shelters = window.OjolStore.getShelters();

    document.getElementById('partAttendCount').innerText = `${records.length} kali hadir`;

    if (records.length === 0) {
      list.innerHTML = `<div class="p-3 text-center text-slate-400 text-[11px]">Belum ada catatan presensi.</div>`;
      return;
    }

    list.innerHTML = records.slice(0, 3).map(r => {
      const d = new Date(r.date);
      const formatted = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
      const sh = shelters.find(s => s.id === r.shelterId);
      const shName = sh ? sh.name : 'Shelter';

      return `
        <div class="p-2 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center text-[11px]">
          <div>
            <span class="font-bold text-slate-700">${shName}</span>
            <span class="text-[10px] text-slate-400 block">${formatted}</span>
          </div>
          <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            ${r.distanceReported}m
          </span>
        </div>
      `;
    }).join('');
  },

  loadParticipantAssessments() {
    const session = window.OjolStore.getSession();
    const list = document.getElementById('partAssessmentList');
    const assessments = window.OjolStore.getAssessmentsByParticipant(session.uid);

    if (assessments.length === 0) {
      list.innerHTML = `<div class="text-center py-6 text-slate-400 text-xs">Belum ada evaluasi dari Ustadz Pembina.</div>`;
      return;
    }

    list.innerHTML = assessments.map(a => {
      const d = new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      const cat = a.category || 'A';
      const catInfo = window.LEARNING_CATEGORIES[cat] || { name: 'Kategori ' + cat, badgeClass: 'bg-emerald-100 text-emerald-800' };

      return `
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
          <div class="flex justify-between items-center">
            <span class="font-bold text-xs text-slate-700"><i class="fas fa-calendar mr-1 text-slate-400 text-[10px]"></i>${d}</span>
            <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full ${catInfo.badgeClass}">Kat: ${cat}</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px]">
            <div class="bg-white p-1.5 rounded-lg border border-slate-100">
              <span class="text-slate-400 text-[10px] block">Makhraj & Tajwid</span>
              <span class="font-extrabold text-emerald-700">${a.tajwidScore} / 5</span>
            </div>
            <div class="bg-white p-1.5 rounded-lg border border-slate-100">
              <span class="text-slate-400 text-[10px] block">Kelancaran</span>
              <span class="font-extrabold text-teal-700">${a.fluencyScore} / 5</span>
            </div>
          </div>

          <div class="bg-white p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600 italic">
            "${a.notes}"
            <div class="text-[10px] not-italic font-bold text-slate-400 mt-1 text-right">— ${a.teacherName || 'Ustadz Pembina'}</div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderSurahCards() {
    const grid = document.getElementById('surahCardGrid');
    if (!grid) return;

    grid.innerHTML = window.SHORT_SURAHS.map(s => `
      <button onclick="app.openSurahReader('${s.id}')" class="p-3 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200/80 hover:border-emerald-300 transition text-left group">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs font-bold text-slate-700 group-hover:text-emerald-800">${s.name}</span>
          <span class="font-arabic text-sm text-emerald-700">${s.arabicName}</span>
        </div>
        <p class="text-[10px] text-slate-400">${s.ayahCount} Ayat • ${s.meaning}</p>
      </button>
    `).join('');
  },

  openSurahReader(surahId) {
    const s = window.SHORT_SURAHS.find(x => x.id === surahId);
    if (!s) return;

    document.getElementById('mushafSurahTitle').innerText = `Surah ${s.name} (${s.arabicName})`;
    document.getElementById('mushafSurahMeta').innerText = `${s.ayahCount} Ayat • ${s.meaning}`;

    const list = document.getElementById('mushafAyahList');
    list.innerHTML = s.ayahs.map(a => `
      <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
        <div class="flex justify-between items-start gap-3">
          <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
            ${a.num}
          </span>
          <p class="font-arabic text-xl text-right leading-loose text-slate-900 select-text" dir="rtl">
            ${a.ar}
          </p>
        </div>
        <div class="pt-1.5 border-t border-slate-200/50">
          <p class="text-[11px] font-semibold text-emerald-800 italic">${a.tr}</p>
          <p class="text-[11px] text-slate-600 mt-0.5">${a.id}</p>
        </div>
      </div>
    `).join('');

    this.showModal('modalMushaf');
  },

  // ========================================================
  // UTILITIES & MODAL CONTROLLERS
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

    toast.className = `${bg} px-3.5 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold transform transition-all duration-300 opacity-0 -translate-y-2 pointer-events-auto`;
    toast.innerHTML = `
      <i class="fas ${icon} text-sm"></i>
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
  },

  toggleSpinner(btnId, show) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (show) {
      btn.dataset.original = btn.innerHTML;
      btn.innerHTML = '<div class="spinner"></div>';
      btn.disabled = true;
      btn.classList.add('opacity-75');
    } else {
      btn.innerHTML = btn.dataset.original || 'Simpan';
      btn.disabled = false;
      btn.classList.remove('opacity-75');
    }
  }
};

// Global Exposure for Inline Handlers
window.app = app;

// Auto Initialization
window.addEventListener('DOMContentLoaded', () => {
  app.init();
});
