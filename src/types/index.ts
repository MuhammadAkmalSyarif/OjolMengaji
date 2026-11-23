export type UserRole = 'admin' | 'guru' | 'ojol';

export type PaymentAccountType = 'Bank' | 'Gojek' | 'Ovo' | 'Dana' | 'ShopeePay' | 'LinkAja';

export type ParticipantLevel = 
  | 'Belum Dinilai'
  | 'Iqro 1-3' 
  | 'Iqro 4-6' 
  | 'Al-Qur\'an Dasar' 
  | 'Al-Qur\'an Mahir / Tajwid';

export interface LevelOption {
  id: 'Iqro 1-3' | 'Iqro 4-6' | 'Al-Qur\'an Dasar' | 'Al-Qur\'an Mahir / Tajwid';
  title: string;
  badge: string;
  desc: string;
  icon: string;
}

export const LEVEL_OPTIONS: LevelOption[] = [
  {
    id: 'Iqro 1-3',
    title: 'Iqro 1 - 3',
    badge: 'Pemula Dasar',
    desc: 'Mengenal huruf hijaiyah tunggal & harakat dasar',
    icon: '🌱',
  },
  {
    id: 'Iqro 4-6',
    title: 'Iqro 4 - 6',
    badge: 'Menengah',
    desc: 'Menyambung huruf, tanda sukun, tasydid, & mad panjang',
    icon: '🌿',
  },
  {
    id: 'Al-Qur\'an Dasar',
    title: 'Al-Qur\'an Dasar',
    badge: 'Lancar Mushaf',
    desc: 'Mulai tilawah membaca langsung dari mushaf Al-Qur\'an',
    icon: '📖',
  },
  {
    id: 'Al-Qur\'an Mahir / Tajwid',
    title: 'Tahsin & Tajwid',
    badge: 'Tingkat Mahir',
    desc: 'Pendalaman makharijul huruf, hukum tajwid & waqaf',
    icon: '🌟',
  },
];

export interface User {
  id: string;
  name: string;
  username?: string; // Username resmi (digenerate admin untuk guru / pengelola)
  email: string;
  address?: string; // Alamat tempat tinggal / domisili
  role: UserRole;
  avatar?: string;
  phone: string;
  password?: string;
  nik?: string;
  isActive: boolean;
  accountType?: PaymentAccountType;
  bankName?: string;
  bankAccount?: string;
}

export interface RegisterDriverData {
  name: string;
  email?: string;
  phone: string;
  address?: string; // Alamat tempat tinggal / domisili driver
  password?: string;
  ojolPlatform: 'Gojek' | 'Grab' | 'Maxim' | 'InDrive' | 'ShopeeFood';
  nik?: string;
  vehiclePlate?: string;
  shelterId: string;
  currentLevel?: ParticipantLevel;
  accountType?: PaymentAccountType;
  bankName?: string;
  bankAccount?: string;
  selfiePhoto?: string; // Foto selfie untuk Kartu Anggota Ojol Mengaji
  memberNumber?: number;
}

export interface Shelter {
  id: string;
  code?: string; // Kode unik shelter untuk penomoran kartu anggota (misal: '01', '02', 'TB', dll)
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
  notes?: string;
}

export interface Teacher {
  id: string;
  userId: string;
  name: string;
  username?: string; // Username resmi login guru
  phone: string;
  email: string;
  avatar: string;
  specialization: string;
  shelterIds: string[];
  isActive: boolean;
  nik?: string;
  bankName?: string;
  bankAccount?: string;
  generatedPassword?: string; // Password yang digenerate oleh admin untuk dibagikan ke Ustadz
}

export interface Participant {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  address?: string; // Alamat domisili mitra driver
  avatar: string;
  selfiePhoto?: string; // Foto selfie asli untuk pembuatan kartu anggota
  ojolPlatform: 'Gojek' | 'Grab' | 'Maxim' | 'InDrive' | 'ShopeeFood';
  nik?: string;
  vehiclePlate: string;
  shelterId: string;
  currentLevel: ParticipantLevel;
  joinedDate: string;
  isActive: boolean;
  accountType?: PaymentAccountType;
  bankName?: string;
  bankAccount?: string;
  memberNumber?: number;
  pendingShelterId?: string; // ID shelter tujuan untuk pengajuan pindah
  shelterTransferStatus?: 'pending' | 'approved' | 'rejected';
  shelterTransferRequestedAt?: string;
  shelterTransferReason?: string;
}

// Daftar opsi bank resmi lengkap di Indonesia
export const BANK_OPTIONS: string[] = [
  // Bank Syariah
  'BSI (Bank Syariah Indonesia)',
  'Bank Muamalat',
  'BCA Syariah',
  'Bank Mega Syariah',
  'Bank Aladin Syariah',
  'Bank BJB Syariah',
  'Bank Panin Dubai Syariah',
  'Bank Nano Syariah',

  // Bank BUMN / Himbara
  'Bank Mandiri',
  'Bank BRI (Bank Rakyat Indonesia)',
  'Bank BNI (Bank Negara Indonesia)',
  'Bank BTN (Bank Tabungan Negara)',

  // Bank Swasta Nasional
  'Bank BCA (Bank Central Asia)',
  'Bank CIMB Niaga',
  'Bank Danamon',
  'Bank Permata',
  'Bank OCBC NISP',
  'Bank Panin',
  'Bank Mega',
  'Bank Sinarmas',
  'Bank Maybank Indonesia',
  'Bank BTPN / Jenius',
  'Bank Neo Commerce (BNC)',
  'Bank Jago',
  'Seabank Indonesia',
  'Blu by BCA Digital',
  'Line Bank (KEB Hana)',
  'Bank Commonwealth',
  'Bank UOB Indonesia',
  'KB Bukopin',
  'Bank Mayapada',
  'Bank DBS Indonesia',
  'Bank HSBC Indonesia',
  'Bank Standard Chartered',
  'Allo Bank Indonesia',

  // Bank Pembangunan Daerah (BPD)
  'Bank DKI / DKI Syariah',
  'Bank BJB',
  'Bank Jateng / Jateng Syariah',
  'Bank Jatim / Jatim Syariah',
  'Bank Banten',
  'Bank Sumut',
  'Bank Nagari (BPD Sumbar)',
  'Bank Sumsel Babel',
  'Bank Riau Kepri Syariah',
  'Bank Kalbar',
  'Bank Kalsel',
  'Bank Kaltimtara',
  'Bank Sulselbar',
  'Bank SulutGo',
  'Bank Papua',
  'Bank NTB Syariah',
  'Bank NTT',
  'Bank Maluku Malut',
  'Bank Bengkulu',
  'Bank Jambi',
  'Bank Lampung',
  'Bank Sultra',
  'Bank Sulteng',

  // Bank Lainnya
  'Bank Lainnya'
];

export interface Schedule {
  id: string;
  shelterId: string;
  teacherId: string;
  dayName: string; // 'Senin', 'Rabu', 'Jumat', dll
  startTime: string; // '16:30'
  endTime: string; // '18:00'
  topic: string;
  isActive: boolean;
}

export type AttendanceStatus = 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'alpa';
export type AttendanceMethod = 'gps' | 'qr' | 'manual';

export interface AttendanceRecord {
  id: string;
  participantId: string;
  scheduleId?: string;
  shelterId: string;
  sessionDate: string; // '2026-10-28'
  checkInTime: string; // '16:45:12'
  status: AttendanceStatus;
  method: AttendanceMethod;
  distanceMeters?: number;
  verifiedByTeacherId?: string;
  notes?: string;
}

export interface RubricScores {
  hijaiyah: number; // 1-4
  harakat: number; // 1-4
  kelancaran: number; // 1-4
  tajwid: number; // 1-4
  makhraj: number; // 1-4
  kemandirian: number; // 1-4
}

export interface ReadingAssessment {
  id: string;
  participantId: string;
  teacherId: string;
  assessmentDate: string;
  material: string; // e.g. "Surah Al-Mulk: 1-10" or "Iqro 4 Hal. 12"
  scores: RubricScores;
  assessedLevel?: ParticipantLevel;
  strengths: string;
  improvements: string;
  recommendations: string;
  isPublished: boolean;
}

export type TaskStatus = 
  | 'belum_dikerjakan' 
  | 'sedang_dikerjakan' 
  | 'menunggu_pemeriksaan' 
  | 'selesai' 
  | 'perlu_perbaikan' 
  | 'terlambat';

export interface Task {
  id: string;
  teacherId: string;
  shelterId?: string; // all or specific shelter
  targetParticipantId?: string; // specific participant or all in shelter
  title: string;
  description: string;
  surahOrTopic: string;
  targetVerses?: string;
  dueDate: string;
  createdDate: string;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  participantId: string;
  status: TaskStatus;
  submittedAt?: string;
  submissionNotes?: string;
  audioFileName?: string;
  audioDurationSeconds?: number;
  teacherFeedback?: string;
  score?: number; // 1-100 or 1-4
  evaluatedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: 'all' | 'guru' | 'ojol' | 'shelter';
  targetShelterId?: string;
  authorName: string;
  createdAt: string;
  expiresAt?: string;
  isImportant?: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  userName: string;
  userRole: UserRole;
  targetEntity: string;
  targetId?: string;
  details: string;
  timestamp: string;
}
