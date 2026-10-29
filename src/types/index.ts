export type UserRole = 'admin' | 'guru' | 'ojol';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone: string;
  isActive: boolean;
}

export interface Shelter {
  id: string;
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
  phone: string;
  email: string;
  avatar: string;
  specialization: string;
  shelterIds: string[];
  isActive: boolean;
}

export interface Participant {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  ojolPlatform: 'Gojek' | 'Grab' | 'Maxim' | 'InDrive' | 'ShopeeFood';
  vehiclePlate: string;
  shelterId: string;
  currentLevel: 'Iqro 1-3' | 'Iqro 4-6' | 'Al-Qur\'an Dasar' | 'Al-Qur\'an Mahir / Tajwid';
  joinedDate: string;
  isActive: boolean;
}

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
