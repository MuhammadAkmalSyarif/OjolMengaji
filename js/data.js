/* ==========================================================================
   OJOL MENGAJI - DATA STORE & STATE ENGINE
   Zero-dependency, offline-ready LocalStorage engine with realistic seed data
   ========================================================================== */

const STORAGE_KEYS = {
  USERS: 'ojol_data_users_v3',
  SHELTERS: 'ojol_data_shelters_v3',
  ATTENDANCE: 'ojol_data_attendance_v3',
  ASSESSMENTS: 'ojol_data_assessments_v3',
  SESSION: 'ojol_active_session_v3'
};

// Curriculum Categories (A, B, C, D)
const LEARNING_CATEGORIES = {
  'A': {
    code: 'A',
    name: 'Kategori A: Pengenalan Huruf',
    desc: 'Mengenal 28 huruf hijaiyyah tunggal & makhorijul huruf dasar.',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  'B': {
    code: 'B',
    name: 'Kategori B: Harakat & Sambung',
    desc: 'Menguasai tanda baca harakat, tanwin, sukun, dan menyambung huruf.',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-300'
  },
  'C': {
    code: 'C',
    name: 'Kategori C: Tajwid Dasar',
    desc: 'Hukum nun mati/tanwin (idzhar, idgham, iqlab, ikhfa) & mad thobi\'i.',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  'D': {
    code: 'D',
    name: 'Kategori D: Al-Qur\'an & Tartil',
    desc: 'Membaca mushaf Al-Qur\'an dengan tartil, waqaf ibtida\', & mad far\'i.',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300'
  }
};

// Seed Shelters
const DEFAULT_SHELTERS = [
  {
    id: 'sh-gambir',
    name: 'Shelter Al-Ikhlas Gambir',
    region: 'Jakarta Pusat',
    address: 'Selasar Masjid Baitul Ihsan / Jl. Medan Merdeka Timur No. 16, Gambir',
    lat: -6.1764,
    lng: 106.8306,
    radius: 100, // meters
    isActive: true,
    schedule: 'Senin & Kamis (13.00 - 14.30 WIB)'
  },
  {
    id: 'sh-tebet',
    name: 'Shelter An-Nur Tebet Eco Park',
    region: 'Jakarta Selatan',
    address: 'Pangkalan Mitra Ojol Tebet Barat Raya No. 42 (Dekat Taman Tebet)',
    lat: -6.2384,
    lng: 106.8533,
    radius: 120,
    isActive: true,
    schedule: 'Selasa & Jum\'at (16.30 - 17.45 WIB)'
  },
  {
    id: 'sh-margonda',
    name: 'Shelter Al-Barokah Margonda UI',
    region: 'Depok',
    address: 'Halte & Selasar Masjid Ukhuwah Islamiyah / Jl. Margonda Raya',
    lat: -6.3728,
    lng: 106.8288,
    radius: 150,
    isActive: true,
    schedule: 'Rabu & Sabtu (10.00 - 11.30 WIB)'
  },
  {
    id: 'sh-blokm',
    name: 'Shelter Al-Muhajirin Blok M',
    region: 'Jakarta Selatan',
    address: 'Pangkalan Ojol Terminal Blok M Jalur Selatan, Kebayoran Baru',
    lat: -6.2443,
    lng: 106.7978,
    radius: 80,
    isActive: true,
    schedule: 'Rabu & Ahad (14.00 - 15.30 WIB)'
  }
];

// Seed Users
const DEFAULT_USERS = [
  {
    uid: 'u-admin-1',
    role: 'admin',
    name: 'Ustadz Haris Wijaya',
    phone: '081110002000',
    email: 'admin@ojolmengaji.id',
    password: 'admin123',
    region: 'DPW DKI Jakarta',
    shelterId: null,
    status: 'active',
    createdAt: '2026-01-01T08:00:00.000Z'
  },
  {
    uid: 'u-guru-1',
    role: 'guru',
    name: 'Ustadz Ahmad Fauzi, Lc',
    phone: '081299990001',
    email: 'guru@ojolmengaji.id',
    password: 'guru123',
    region: 'Jakarta Pusat & Selatan',
    assignedShelters: ['sh-gambir', 'sh-tebet'],
    status: 'active',
    createdAt: '2026-01-05T09:00:00.000Z'
  },
  {
    uid: 'u-driver-1',
    role: 'peserta',
    name: 'Bambang Pamungkas',
    phone: '081234567890',
    email: 'bambang.driver@gmail.com',
    password: 'ojol123',
    appProvider: 'Gojek',
    region: 'Jakarta Pusat',
    shelterId: 'sh-gambir',
    learningCategory: 'B',
    status: 'verified',
    createdAt: '2026-01-10T10:30:00.000Z'
  },
  {
    uid: 'u-driver-2',
    role: 'peserta',
    name: 'Rudi Hartono',
    phone: '081234567891',
    email: 'rudi.driver@gmail.com',
    password: 'ojol123',
    appProvider: 'Grab',
    region: 'Jakarta Selatan',
    shelterId: 'sh-tebet',
    learningCategory: 'A',
    status: 'pending', // Waiting for admin verification
    createdAt: '2026-01-15T14:15:00.000Z'
  },
  {
    uid: 'u-driver-3',
    role: 'peserta',
    name: 'Agus Santoso',
    phone: '081234567892',
    email: 'agus.driver@gmail.com',
    password: 'ojol123',
    appProvider: 'ShopeeFood',
    region: 'Jakarta Pusat',
    shelterId: 'sh-gambir',
    learningCategory: 'C',
    status: 'verified',
    createdAt: '2026-01-18T11:00:00.000Z'
  }
];

// Seed Attendance Records
const DEFAULT_ATTENDANCES = [
  {
    id: 'att-1',
    uid: 'u-driver-1',
    shelterId: 'sh-gambir',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'present',
    distanceReported: 24,
    accuracy: 8
  },
  {
    id: 'att-2',
    uid: 'u-driver-3',
    shelterId: 'sh-gambir',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'present',
    distanceReported: 35,
    accuracy: 10
  }
];

// Seed Assessments
const DEFAULT_ASSESSMENTS = [
  {
    id: 'ass-1',
    participantId: 'u-driver-1',
    teacherId: 'u-guru-1',
    teacherName: 'Ustadz Ahmad Fauzi, Lc',
    tajwidScore: 4,
    fluencyScore: 4,
    category: 'B',
    notes: 'Alhamdulillah sudah lancar membedakan panjang pendek 2 harakat (Mad Thobi\'i). Terus pertahankan kelancaran membaca setiap istirahat narik.',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ass-2',
    participantId: 'u-driver-3',
    teacherId: 'u-guru-1',
    teacherName: 'Ustadz Ahmad Fauzi, Lc',
    tajwidScore: 4,
    fluencyScore: 5,
    category: 'C',
    notes: 'Penerapan Idgham Bighunnah sangat baik dan dengungnya pas. Siap melanjutkan ke materi Mad Far\'i.',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Mushaf Surah Pendek Data
const SHORT_SURAHS = [
  {
    id: 'fatihah',
    name: 'Al-Fatihah',
    arabicName: 'الفاتحة',
    ayahCount: 7,
    meaning: 'Pembukaan',
    ayahs: [
      { num: 1, ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', tr: 'Bismillāhir-raḥmānir-raḥīm', id: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.' },
      { num: 2, ar: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', tr: 'Al-ḥamdu lillāhi rabbil-\'ālamīn', id: 'Segala puji bagi Allah, Tuhan seluruh alam,' },
      { num: 3, ar: 'الرَّحْمَٰنِ الرَّحِيمِ', tr: 'Ar-raḥmānir-raḥīm', id: 'Yang Maha Pengasih, Maha Penyayang,' },
      { num: 4, ar: 'مَالِكِ يَوْمِ الدِّينِ', tr: 'Māliki yaumid-dīn', id: 'Pemilik hari pembalasan.' },
      { num: 5, ar: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', tr: 'Iyyāka na\'budu wa iyyāka nasta\'īn', id: 'Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami memohon pertolongan.' },
      { num: 6, ar: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', tr: 'Ihdinaṣ-ṣirāṭal-mustaqīm', id: 'Tunjukilah kami jalan yang lurus,' },
      { num: 7, ar: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', tr: 'Ṣirāṭallażīna an\'amta \'alaihim gairil-magḍūbi \'alaihim wa laḍ-ḍāllīn', id: '(yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat.' }
    ]
  },
  {
    id: 'ikhlas',
    name: 'Al-Ikhlas',
    arabicName: 'الإخلاص',
    ayahCount: 4,
    meaning: 'Kemurnian Keesaan Allah',
    ayahs: [
      { num: 1, ar: 'قُلْ هُوَ اللَّهُ أَحَدٌ', tr: 'Qul huwallāhu aḥad', id: 'Katakanlah (Muhammad), "Dialah Allah, Yang Maha Esa."' },
      { num: 2, ar: 'اللَّهُ الصَّمَدُ', tr: 'Allāhuṣ-ṣamad', id: 'Allah tempat meminta segala sesuatu.' },
      { num: 3, ar: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', tr: 'Lam yalid wa lam yūlad', id: '(Allah) tidak beranak dan tidak pula diperanakkan,' },
      { num: 4, ar: 'وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ', tr: 'Wa lam yakul lahū kufuwan aḥad', id: 'Dan tidak ada sesuatu yang setara dengan Dia.' }
    ]
  },
  {
    id: 'falaq',
    name: 'Al-Falaq',
    arabicName: 'الفلق',
    ayahCount: 5,
    meaning: 'Waktu Subuh',
    ayahs: [
      { num: 1, ar: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', tr: 'Qul a\'ūżu birabbil-falaq', id: 'Katakanlah, "Aku berlindung kepada Tuhan yang menguasai subuh (fajar),"' },
      { num: 2, ar: 'مِنْ شَرِّ مَا خَلَقَ', tr: 'Min syarri mā khalaq', id: 'dari kejahatan (makhluk yang) Dia ciptakan,' },
      { num: 3, ar: 'وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ', tr: 'Wa min syarri gāsiqin iżā waqab', id: 'dan dari kejahatan malam apabila telah gelap gulita,' },
      { num: 4, ar: 'وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', tr: 'Wa min syarrin-naffāṡāti fil-\'uqad', id: 'dan dari kejahatan (perempuan-perempuan) penyihir yang meniup pada buhul-buhul (talinya),' },
      { num: 5, ar: 'وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ', tr: 'Wa min syarri ḥāsidin iżā ḥasad', id: 'dan dari kejahatan orang yang dengki apabila dia dengki."' }
    ]
  },
  {
    id: 'nas',
    name: 'An-Nas',
    arabicName: 'الناس',
    ayahCount: 6,
    meaning: 'Manusia',
    ayahs: [
      { num: 1, ar: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', tr: 'Qul a\'ūżu birabbin-nās', id: 'Katakanlah, "Aku berlindung kepada Tuhannya manusia,"' },
      { num: 2, ar: 'مَلِكِ النَّاسِ', tr: 'Malikin-nās', id: '"Raja manusia,"' },
      { num: 3, ar: 'إِلَٰهِ النَّاسِ', tr: 'Ilāhin-nās', id: '"Sembahan manusia,"' },
      { num: 4, ar: 'مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ', tr: 'Min syarril-waswāsil-khannās', id: '"Dari kejahatan (bisikan) setan yang bersembunyi,"' },
      { num: 5, ar: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ', tr: 'Allażī yuwaswisu fī ṣudūrin-nās', id: '"yang membisikkan (kejahatan) ke dalam dada manusia,"' },
      { num: 6, ar: 'مِنَ الْجِنَّةِ وَالنَّاسِ', tr: 'Minal-jinnati wan-nās', id: '"dari (golongan) jin dan manusia."' }
    ]
  }
];

// --- Haversine Geolocation Utility ---
function calculateDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --- LocalStorage Store Implementation ---
class OjolDataStore {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.SHELTERS)) {
      this.resetToDefaults();
    }
  }

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem(STORAGE_KEYS.SHELTERS, JSON.stringify(DEFAULT_SHELTERS));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(DEFAULT_ATTENDANCES));
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(DEFAULT_ASSESSMENTS));
  }

  // --- Users ---
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    } catch {
      return [];
    }
  }

  getUserById(uid) {
    return this.getUsers().find(u => u.uid === uid) || null;
  }

  getUserByIdentifier(identifier) {
    if (!identifier) return null;
    const cleanId = identifier.trim().toLowerCase();
    const normalize = (p) => {
      if (!p) return '';
      let d = p.replace(/\D/g, '');
      if (d.startsWith('62')) d = '0' + d.slice(2);
      else if (d.startsWith('8')) d = '0' + d;
      return d;
    };
    const normInput = normalize(cleanId);
    return this.getUsers().find(u => {
      const uEmail = (u.email || '').toLowerCase();
      const uNormPhone = normalize(u.phone || '');
      return uEmail === cleanId || (normInput && uNormPhone === normInput);
    }) || null;
  }

  saveUser(user) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.uid === user.uid);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return user;
  }

  updateUserStatus(uid, status) {
    const users = this.getUsers();
    const user = users.find(u => u.uid === uid);
    if (user) {
      user.status = status;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      // Update session if it's the logged-in user
      const session = this.getSession();
      if (session && session.uid === uid) {
        this.setSession({ ...session, status });
      }
      return true;
    }
    return false;
  }

  updateUserCategory(uid, category) {
    const users = this.getUsers();
    const user = users.find(u => u.uid === uid);
    if (user) {
      user.learningCategory = category;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return true;
    }
    return false;
  }

  deleteUser(uid) {
    let users = this.getUsers().filter(u => u.uid !== uid);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return true;
  }

  // --- Shelters ---
  getShelters() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SHELTERS)) || [];
    } catch {
      return [];
    }
  }

  getShelterById(id) {
    return this.getShelters().find(s => s.id === id) || null;
  }

  saveShelter(shelter) {
    const shelters = this.getShelters();
    const idx = shelters.findIndex(s => s.id === shelter.id);
    if (idx >= 0) {
      shelters[idx] = { ...shelters[idx], ...shelter };
    } else {
      shelters.push(shelter);
    }
    localStorage.setItem(STORAGE_KEYS.SHELTERS, JSON.stringify(shelters));
    return shelter;
  }

  deleteShelter(id) {
    let shelters = this.getShelters().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SHELTERS, JSON.stringify(shelters));
    return true;
  }

  // --- Attendance ---
  getAttendances() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) || [];
    } catch {
      return [];
    }
  }

  getAttendancesByUser(uid) {
    return this.getAttendances()
      .filter(a => a.uid === uid)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  recordAttendance(record) {
    const list = this.getAttendances();
    const newRecord = {
      id: 'att-' + Date.now(),
      date: new Date().toISOString(),
      ...record
    };
    list.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(list));
    return newRecord;
  }

  // --- Assessments ---
  getAssessments() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSESSMENTS)) || [];
    } catch {
      return [];
    }
  }

  getAssessmentsByParticipant(participantId) {
    return this.getAssessments()
      .filter(a => a.participantId === participantId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  saveAssessment(assessment) {
    const list = this.getAssessments();
    const newAss = {
      id: 'ass-' + Date.now(),
      date: new Date().toISOString(),
      ...assessment
    };
    list.unshift(newAss);
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(list));
    
    // Also update participant learningCategory
    if (assessment.category) {
      this.updateUserCategory(assessment.participantId, assessment.category);
    }
    return newAss;
  }

  // --- Session ---
  getSession() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION)) || null;
    } catch {
      return null;
    }
  }

  setSession(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  }
}

// Global instance attached to window
window.OjolStore = new OjolDataStore();
window.LEARNING_CATEGORIES = LEARNING_CATEGORIES;
window.SHORT_SURAHS = SHORT_SURAHS;
window.calculateDistanceInMeters = calculateDistanceInMeters;
