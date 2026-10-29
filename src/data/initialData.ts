import { 
  User, 
  Shelter, 
  Teacher, 
  Participant, 
  Schedule, 
  AttendanceRecord, 
  ReadingAssessment, 
  Task, 
  TaskSubmission, 
  Announcement, 
  AuditLog 
} from '@/types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-1',
    name: 'Budi Santoso, M.Pd.',
    email: 'admin@ojolmengaji.id',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '0812-3456-7890',
    isActive: true,
  },
  {
    id: 'user-guru-1',
    name: 'Ust. Ahmad Fauzi, S.Q.',
    email: 'ahmad.fauzi@ojolmengaji.id',
    role: 'guru',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '0813-8899-1234',
    isActive: true,
  },
  {
    id: 'user-guru-2',
    name: 'Ust. Muhammad Ridwan',
    email: 'ridwan@ojolmengaji.id',
    role: 'guru',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '0815-7766-5544',
    isActive: true,
  },
  {
    id: 'user-ojol-1',
    name: 'Rian Hidayat',
    email: 'rian.gojek@gmail.com',
    role: 'ojol',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    phone: '0857-1122-3344',
    isActive: true,
  },
  {
    id: 'user-ojol-2',
    name: 'Dedi Kurniawan',
    email: 'dedi.grab@gmail.com',
    role: 'ojol',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    phone: '0878-9988-7766',
    isActive: true,
  },
  {
    id: 'user-ojol-3',
    name: 'Slamet Supriyadi',
    email: 'slamet.maxim@gmail.com',
    role: 'ojol',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    phone: '0821-3344-5566',
    isActive: true,
  },
  {
    id: 'user-ojol-4',
    name: 'Agus Prasetyo',
    email: 'agus.p@gmail.com',
    role: 'ojol',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '0819-2233-4455',
    isActive: true,
  }
];

export const INITIAL_SHELTERS: Shelter[] = [
  {
    id: 'shelter-1',
    name: 'Shelter Tebet Barat (Stasiun Tebet)',
    address: 'Jl. Tebet Raya No. 45, Tebet Timur, Jakarta Selatan',
    latitude: -6.2268,
    longitude: 106.8582,
    radiusMeters: 75,
    isActive: true,
    notes: 'Dekat pangkalan ojol Pintu Barat Stasiun Tebet. Kapasitas 25 orang.'
  },
  {
    id: 'shelter-2',
    name: 'Shelter Blok M Square',
    address: 'Jl. Melawai Raya, Area Parkir Belakang Blok M Square, Jakarta Selatan',
    latitude: -6.2435,
    longitude: 106.7981,
    radiusMeters: 60,
    isActive: true,
    notes: 'Pojok gazebo musholla sentral Blok M. Ruangan nyaman dan tenang.'
  },
  {
    id: 'shelter-3',
    name: 'Shelter Palmerah Sentral',
    address: 'Jl. Palmerah Barat No. 12, Gelora, Jakarta Pusat',
    latitude: -6.2081,
    longitude: 106.7972,
    radiusMeters: 80,
    isActive: true,
    notes: 'Depan Pasar Palmerah dan dekat JPO halte TransJakarta.'
  },
  {
    id: 'shelter-4',
    name: 'Shelter Harmoni Hayam Wuruk',
    address: 'Jl. Hayam Wuruk No. 88, Gambir, Jakarta Pusat',
    latitude: -6.1664,
    longitude: 106.8197,
    radiusMeters: 50,
    isActive: true,
    notes: 'Dekat area istirahat driver transit Harmoni.'
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'teacher-1',
    userId: 'user-guru-1',
    name: 'Ust. Ahmad Fauzi, S.Q.',
    phone: '0813-8899-1234',
    email: 'ahmad.fauzi@ojolmengaji.id',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    specialization: 'Tahsin Al-Qur\'an & Makhorijul Huruf, Metode Talaqqi',
    shelterIds: ['shelter-1', 'shelter-2'],
    isActive: true,
  },
  {
    id: 'teacher-2',
    userId: 'user-guru-2',
    name: 'Ust. Muhammad Ridwan',
    phone: '0815-7766-5544',
    email: 'ridwan@ojolmengaji.id',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    specialization: 'Iqro Dasar Dewasa & Tajwid Praktis',
    shelterIds: ['shelter-3', 'shelter-4'],
    isActive: true,
  }
];

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'part-1',
    userId: 'user-ojol-1',
    name: 'Rian Hidayat',
    phone: '0857-1122-3344',
    email: 'rian.gojek@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    ojolPlatform: 'Gojek',
    vehiclePlate: 'B 3821 TXZ',
    shelterId: 'shelter-1',
    currentLevel: 'Al-Qur\'an Dasar',
    joinedDate: '2026-08-15',
    isActive: true,
  },
  {
    id: 'part-2',
    userId: 'user-ojol-2',
    name: 'Dedi Kurniawan',
    phone: '0878-9988-7766',
    email: 'dedi.grab@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    ojolPlatform: 'Grab',
    vehiclePlate: 'B 6412 WQR',
    shelterId: 'shelter-1',
    currentLevel: 'Iqro 4-6',
    joinedDate: '2026-08-20',
    isActive: true,
  },
  {
    id: 'part-3',
    userId: 'user-ojol-3',
    name: 'Slamet Supriyadi',
    phone: '0821-3344-5566',
    email: 'slamet.maxim@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    ojolPlatform: 'Maxim',
    vehiclePlate: 'B 1209 PLK',
    shelterId: 'shelter-2',
    currentLevel: 'Iqro 1-3',
    joinedDate: '2026-09-01',
    isActive: true,
  },
  {
    id: 'part-4',
    userId: 'user-ojol-4',
    name: 'Agus Prasetyo',
    phone: '0819-2233-4455',
    email: 'agus.p@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    ojolPlatform: 'Gojek',
    vehiclePlate: 'B 5543 SYT',
    shelterId: 'shelter-2',
    currentLevel: 'Al-Qur\'an Mahir / Tajwid',
    joinedDate: '2026-08-10',
    isActive: true,
  },
  {
    id: 'part-5',
    userId: 'user-ojol-5',
    name: 'Hendra Setiawan',
    phone: '0812-4455-6677',
    email: 'hendra.driver@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    ojolPlatform: 'InDrive',
    vehiclePlate: 'B 7890 KJH',
    shelterId: 'shelter-3',
    currentLevel: 'Al-Qur\'an Dasar',
    joinedDate: '2026-09-10',
    isActive: true,
  },
  {
    id: 'part-6',
    userId: 'user-ojol-6',
    name: 'Joko Susilo',
    phone: '0852-6677-8899',
    email: 'joko.susilo@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    ojolPlatform: 'ShopeeFood',
    vehiclePlate: 'B 4321 MNM',
    shelterId: 'shelter-3',
    currentLevel: 'Iqro 4-6',
    joinedDate: '2026-09-12',
    isActive: true,
  }
];

export const INITIAL_SCHEDULES: Schedule[] = [
  {
    id: 'sched-1',
    shelterId: 'shelter-1',
    teacherId: 'teacher-1',
    dayName: 'Senin',
    startTime: '16:30',
    endTime: '18:00',
    topic: 'Kajian Tajwid & Talaqqi Surah Pendek (Juz Amma)',
    isActive: true,
  },
  {
    id: 'sched-2',
    shelterId: 'shelter-1',
    teacherId: 'teacher-1',
    dayName: 'Kamis',
    startTime: '16:30',
    endTime: '18:00',
    topic: 'Setoran Bacaan Perorangan & Bimbingan Makhraj',
    isActive: true,
  },
  {
    id: 'sched-3',
    shelterId: 'shelter-2',
    teacherId: 'teacher-1',
    dayName: 'Selasa',
    startTime: '16:30',
    endTime: '18:00',
    topic: 'Pendalaman Harakat & Rangkaian Huruf Sambung',
    isActive: true,
  },
  {
    id: 'sched-4',
    shelterId: 'shelter-3',
    teacherId: 'teacher-2',
    dayName: 'Rabu',
    startTime: '16:00',
    endTime: '17:30',
    topic: 'Bimbingan Iqro Intensif Menjelang Ashar-Maghrib',
    isActive: true,
  },
  {
    id: 'sched-5',
    shelterId: 'shelter-4',
    teacherId: 'teacher-2',
    dayName: 'Jumat',
    startTime: '16:00',
    endTime: '17:30',
    topic: 'Tahsin Al-Qur\'an & Doa Harian Driver',
    isActive: true,
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    participantId: 'part-1',
    scheduleId: 'sched-1',
    shelterId: 'shelter-1',
    sessionDate: '2026-10-26',
    checkInTime: '16:35:10',
    status: 'hadir',
    method: 'gps',
    distanceMeters: 18,
    verifiedByTeacherId: 'teacher-1',
    notes: 'Presensi tepat waktu via GPS di radius 18m'
  },
  {
    id: 'att-2',
    participantId: 'part-2',
    scheduleId: 'sched-1',
    shelterId: 'shelter-1',
    sessionDate: '2026-10-26',
    checkInTime: '16:48:22',
    status: 'terlambat',
    method: 'gps',
    distanceMeters: 25,
    verifiedByTeacherId: 'teacher-1',
    notes: 'Terlambat 18 menit karena ada orderan mendadak'
  },
  {
    id: 'att-3',
    participantId: 'part-1',
    scheduleId: 'sched-2',
    shelterId: 'shelter-1',
    sessionDate: '2026-10-22',
    checkInTime: '16:32:00',
    status: 'hadir',
    method: 'qr',
    distanceMeters: 10,
    verifiedByTeacherId: 'teacher-1',
    notes: 'Scan QR di banner shelter'
  },
  {
    id: 'att-4',
    participantId: 'part-2',
    scheduleId: 'sched-2',
    shelterId: 'shelter-1',
    sessionDate: '2026-10-22',
    checkInTime: '16:40:00',
    status: 'hadir',
    method: 'gps',
    distanceMeters: 30,
    verifiedByTeacherId: 'teacher-1',
    notes: 'Lokasi terverifikasi'
  },
  {
    id: 'att-5',
    participantId: 'part-3',
    scheduleId: 'sched-3',
    shelterId: 'shelter-2',
    sessionDate: '2026-10-27',
    checkInTime: '16:30:15',
    status: 'hadir',
    method: 'gps',
    distanceMeters: 12,
    verifiedByTeacherId: 'teacher-1',
  },
  {
    id: 'att-6',
    participantId: 'part-4',
    scheduleId: 'sched-3',
    shelterId: 'shelter-2',
    sessionDate: '2026-10-27',
    checkInTime: '16:31:00',
    status: 'hadir',
    method: 'manual',
    notes: 'Diverifikasi manual oleh Ustadz Ahmad karena sinyal GPS error'
  },
  {
    id: 'att-7',
    participantId: 'part-5',
    scheduleId: 'sched-4',
    shelterId: 'shelter-3',
    sessionDate: '2026-10-28',
    checkInTime: '16:15:00',
    status: 'hadir',
    method: 'gps',
    distanceMeters: 22,
    verifiedByTeacherId: 'teacher-2'
  },
  {
    id: 'att-8',
    participantId: 'part-6',
    scheduleId: 'sched-4',
    shelterId: 'shelter-3',
    sessionDate: '2026-10-28',
    checkInTime: '-',
    status: 'izin',
    method: 'manual',
    notes: 'Izin mengantar keluarga sakit (WA konfirmasi diterima)'
  }
];

export const INITIAL_ASSESSMENTS: ReadingAssessment[] = [
  {
    id: 'eval-1',
    participantId: 'part-1',
    teacherId: 'teacher-1',
    assessmentDate: '2026-10-26',
    material: 'Surah Al-Mulk ayat 1 - 10',
    scores: {
      hijaiyah: 4, // Sangat baik
      harakat: 4, // Sangat baik
      kelancaran: 3, // Baik
      tajwid: 3, // Baik
      makhraj: 3, // Baik
      kemandirian: 4, // Sangat baik
    },
    strengths: 'Pengenalan tanda baca dan waqaf sudah sangat mantap. Makhraj huruf \'Ain dan Ha sudah fasih.',
    improvements: 'Ghunnah pada nun bertasydid mohon ditahan 2 harakat dengan lebih sempurna.',
    recommendations: 'Ulangi ayat 5-8 sebanyak 3x di rumah sebelum tidur atau saat senggang di shelter.',
    isPublished: true,
  },
  {
    id: 'eval-2',
    participantId: 'part-2',
    teacherId: 'teacher-1',
    assessmentDate: '2026-10-22',
    material: 'Iqro Jilid 5 Halaman 18',
    scores: {
      hijaiyah: 3,
      harakat: 3,
      kelancaran: 2, // Mulai berkembang
      tajwid: 2, // Mulai berkembang
      makhraj: 2, // Mulai berkembang
      kemandirian: 3,
    },
    strengths: 'Semangat belajar sangat tinggi dan cepat mengoreksi saat diingatkan.',
    improvements: 'Perbedaan mad thabi\'i (2 harakat) dengan harakat pendek masih sering tertukar.',
    recommendations: 'Latihan mendengarkan audio murattal Syeikh Al-Husary sambil memperhatikan ketukan panjang pendek.',
    isPublished: true,
  },
  {
    id: 'eval-3',
    participantId: 'part-3',
    teacherId: 'teacher-1',
    assessmentDate: '2026-10-20',
    material: 'Iqro Jilid 2 Halaman 10',
    scores: {
      hijaiyah: 2,
      harakat: 2,
      kelancaran: 2,
      tajwid: 1, // Perlu bimbingan
      makhraj: 2,
      kemandirian: 2,
    },
    strengths: 'Sudah hafal bentuk huruf tunggal Alif sampai Ya.',
    improvements: 'Huruf sambung seperti Jim, Kha, dan Kho di tengah kata masih membingungkan.',
    recommendations: 'Kerjakan latihan modul lembar kerja huruf sambung halaman 12.',
    isPublished: true,
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    teacherId: 'teacher-1',
    shelterId: 'shelter-1',
    title: 'Setoran Bacaan Surah Al-Fatihah & Al-Ikhlas',
    description: 'Rekam atau lafalkan Surah Al-Fatihah dan Al-Ikhlas dengan memperhatikan makhraj huruf Kho, \'Ain, dan Ghain serta panjang mad thabi\'i 2 harakat.',
    surahOrTopic: 'Surah Al-Fatihah & Al-Ikhlas',
    targetVerses: 'Lengkap',
    dueDate: '2026-11-02',
    createdDate: '2026-10-26',
  },
  {
    id: 'task-2',
    teacherId: 'teacher-1',
    shelterId: 'shelter-1',
    title: 'Latihan Huruf Mad Thabi\'i Iqro 4',
    description: 'Membaca mandiri Iqro 4 halaman 15 sampai 17. Tandai bagian yang masih ragu untuk ditanyakan saat pertemuan Kamis depan.',
    surahOrTopic: 'Iqro 4',
    targetVerses: 'Halaman 15 - 17',
    dueDate: '2026-11-05',
    createdDate: '2026-10-25',
  },
  {
    id: 'task-3',
    teacherId: 'teacher-2',
    shelterId: 'shelter-3',
    title: 'Hafalan Doa Naik Kendaraan & Doa Keluar Rumah',
    description: 'Hafalkan doa keselamatan berkendara agar berkah dalam mencari nafkah di jalan.',
    surahOrTopic: 'Doa Harian Driver Muslim',
    targetVerses: 'Subhanalladzi sakhara lana hadza...',
    dueDate: '2026-11-03',
    createdDate: '2026-10-27',
  }
];

export const INITIAL_SUBMISSIONS: TaskSubmission[] = [
  {
    id: 'sub-1',
    taskId: 'task-1',
    participantId: 'part-1',
    status: 'selesai',
    submittedAt: '2026-10-27 20:15:00',
    submissionNotes: 'Alhamdulillah sudah saya rekam di shelter sehabis sholat maghrib tadz. Mohon koreksinya.',
    audioFileName: 'setoran_rian_alfatihah.mp3',
    audioDurationSeconds: 78,
    teacherFeedback: 'Masya Allah bacaan sudah tartil dan makhraj \'Ain sudah fasih! Teruskan istiqomah ya Kang Rian.',
    score: 95,
    evaluatedAt: '2026-10-28 09:30:00',
  },
  {
    id: 'sub-2',
    taskId: 'task-1',
    participantId: 'part-2',
    status: 'menunggu_pemeriksaan',
    submittedAt: '2026-10-28 21:05:00',
    submissionNotes: 'Tadz, saya kirim rekaman suara Al-Fatihah. Agak gemetar tadz, mohon masukan.',
    audioFileName: 'setoran_dedi_fatihah.mp3',
    audioDurationSeconds: 85,
  },
  {
    id: 'sub-3',
    taskId: 'task-2',
    participantId: 'part-2',
    status: 'sedang_dikerjakan',
    submissionNotes: 'Sedang latihan mandiri halaman 15',
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Pembagian Mushaf Al-Qur\'an & Buku Tajwid Gratis di Seluruh Shelter',
    content: 'Kabar gembira untuk seluruh rekan driver Ojol Mengaji. Mulai pekan depan, koordinator shelter akan mendistribusikan mushaf cetakan Madinah berukuran saku dan buku panduan tajwid saku yang tahan air untuk bekal mengaji saat istirahat orderan.',
    targetRole: 'all',
    authorName: 'Admin Pusat (Budi Santoso)',
    createdAt: '2026-10-25 09:00:00',
    isImportant: true,
  },
  {
    id: 'ann-2',
    title: 'Penyesuaian Jadwal Mengaji Shelter Tebet Menjelang Maghrib',
    content: 'Sehubungan dengan waktu sholat Maghrib yang maju pukul 17:48 WIB, sesi bimbingan Senin dan Kamis di Shelter Tebet dimajukan mulai pukul 16:15 WIB sampai adzan Maghrib berkumandang, dilanjutkan sholat berjamaah.',
    targetRole: 'shelter',
    targetShelterId: 'shelter-1',
    authorName: 'Ust. Ahmad Fauzi, S.Q.',
    createdAt: '2026-10-27 14:00:00',
    isImportant: false,
  },
  {
    id: 'ann-3',
    title: 'Pelatihan Singkat: Tips Menghafal Al-Qur\'an di Sela-Sela Menunggu Order',
    content: 'Khusus rekan-rekan peserta Ojol Mengaji, mari ikuti workshop online santai 30 menit melalui Zoom pada hari Ahad pagi jam 09.00 WIB. Link akan dibagikan via grup WhatsApp shelter.',
    targetRole: 'ojol',
    authorName: 'Admin Pusat (Budi Santoso)',
    createdAt: '2026-10-28 11:30:00',
    isImportant: false,
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    action: 'CREATE_SHELTER',
    userName: 'Budi Santoso, M.Pd.',
    userRole: 'admin',
    targetEntity: 'shelters',
    targetId: 'shelter-1',
    details: 'Menambahkan Shelter Tebet Barat dengan radius geolokasi 75 meter.',
    timestamp: '2026-08-01 10:00:00',
  },
  {
    id: 'audit-2',
    action: 'ASSIGN_TEACHER',
    userName: 'Budi Santoso, M.Pd.',
    userRole: 'admin',
    targetEntity: 'teacher_assignments',
    targetId: 'teacher-1',
    details: 'Menugaskan Ust. Ahmad Fauzi ke Shelter Tebet dan Shelter Blok M.',
    timestamp: '2026-08-05 11:30:00',
  },
  {
    id: 'audit-3',
    action: 'EVALUATE_PARTICIPANT',
    userName: 'Ust. Ahmad Fauzi, S.Q.',
    userRole: 'guru',
    targetEntity: 'reading_assessments',
    targetId: 'eval-1',
    details: 'Menyimpan rubrik evaluasi membaca Al-Qur\'an untuk peserta Rian Hidayat (Surah Al-Mulk).',
    timestamp: '2026-10-26 17:45:00',
  },
  {
    id: 'audit-4',
    action: 'MANUAL_ATTENDANCE_CORRECTION',
    userName: 'Ust. Ahmad Fauzi, S.Q.',
    userRole: 'guru',
    targetEntity: 'attendance_records',
    targetId: 'att-6',
    details: 'Koreksi presensi peserta Agus Prasetyo ke "hadir" karena kendala sinyal GPS ponsel saat di shelter.',
    timestamp: '2026-10-27 17:00:00',
  }
];

