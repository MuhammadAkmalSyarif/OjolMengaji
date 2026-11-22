'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  UserRole,
  Shelter, 
  Teacher, 
  Participant, 
  ParticipantLevel,
  Schedule, 
  AttendanceRecord, 
  AttendanceStatus,
  AttendanceMethod,
  ReadingAssessment, 
  Task, 
  TaskSubmission, 
  TaskStatus,
  Announcement, 
  AuditLog,
  RegisterDriverData
} from '@/types';

import {
  INITIAL_USERS,
  INITIAL_SHELTERS,
  INITIAL_TEACHERS,
  INITIAL_PARTICIPANTS,
  INITIAL_SCHEDULES,
  INITIAL_ATTENDANCE,
  INITIAL_ASSESSMENTS,
  INITIAL_TASKS,
  INITIAL_SUBMISSIONS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_AUDIT_LOGS,
} from '@/data/initialData';

interface AppContextType {
  currentUser: User | null;
  driverUser?: User | null;
  adminUser?: User | null;
  guruUser?: User | null;
  users: User[];
  shelters: Shelter[];
  teachers: Teacher[];
  participants: Participant[];
  schedules: Schedule[];
  attendance: AttendanceRecord[];
  assessments: ReadingAssessment[];
  tasks: Task[];
  submissions: TaskSubmission[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  
  // Auth & Driver Onboarding
  loginDriver: (identifier: string, password?: string) => { success: boolean; message: string; user?: User };
  loginStaff: (identifier: string, password?: string) => { success: boolean; message: string; user?: User };
  registerDriver: (data: RegisterDriverData) => { success: boolean; message: string; user?: User };
  resetPassword: (email: string, newPassword: string) => { success: boolean; message: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  quickSwitchRole: (role: UserRole) => void;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  
  // Shelters
  addShelter: (shelter: Omit<Shelter, 'id'>) => void;
  updateShelter: (shelter: Shelter) => void;
  deleteShelter: (id: string) => void;
  
  // Teachers
  addTeacher: (
    teacher: Omit<Teacher, 'id' | 'userId' | 'email'> & {
      username?: string;
      password?: string;
      email?: string;
    },
    email?: string
  ) => { success: boolean; message: string; teacher?: Teacher; user?: User };
  updateTeacher: (teacher: Teacher & { password?: string }) => void;
  
  // Participants
  addParticipant: (participant: Omit<Participant, 'id' | 'userId' | 'email'>, email: string) => void;
  updateParticipant: (participant: Participant) => void;
  updateParticipantLevel: (participantId: string, newLevel: ParticipantLevel, notes?: string) => void;
  requestShelterTransfer: (participantId: string, targetShelterId: string, reason?: string) => { success: boolean; message: string };
  approveShelterTransfer: (participantId: string) => { success: boolean; message: string };
  rejectShelterTransfer: (participantId: string, reason?: string) => { success: boolean; message: string };
  cancelShelterTransferRequest: (participantId: string) => { success: boolean; message: string };
  
  // Schedules
  addSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  updateSchedule: (schedule: Schedule) => void;
  deleteSchedule: (id: string) => void;
  
  // Attendance
  recordAttendance: (
    participantId: string, 
    shelterId: string, 
    method: AttendanceMethod, 
    status?: AttendanceStatus, 
    distanceMeters?: number,
    notes?: string
  ) => { success: boolean; message: string };
  correctAttendance: (recordId: string, newStatus: AttendanceStatus, reason: string) => void;
  
  // Assessments
  addAssessment: (assessment: Omit<ReadingAssessment, 'id'>) => void;
  
  // Tasks
  createTask: (task: Omit<Task, 'id' | 'createdDate'>) => void;
  submitTask: (taskId: string, participantId: string, notes: string, audioName?: string) => void;
  evaluateSubmission: (submissionId: string, status: TaskStatus, score: number, feedback: string) => void;
  
  // Announcements
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'authorName'>) => void;
  deleteAnnouncement: (id: string) => void;
  
  // Calculations
  getParticipantAttendanceStats: (participantId: string) => { totalSessions: number; attendedSessions: number; rate: number };
  
  // System reset
  resetAllData: () => void;
}

// Helper normalisasi nomor telepon Indonesia (+62 / 62 / 08 / spasi / strip)
export const normalizePhone = (phone?: string): string => {
  if (!phone) return '';
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+62')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('62')) {
    cleaned = '0' + cleaned.slice(2);
  }
  return cleaned;
};

// Helper merge array of objects by unique id
const mergeById = <T extends { id: string }>(current: T[], incoming: T[]): T[] => {
  const map = new Map<string, T>();
  current.forEach(item => {
    if (item && item.id) map.set(item.id, item);
  });
  incoming.forEach(item => {
    if (item && item.id) {
      const existing = map.get(item.id);
      map.set(item.id, existing ? { ...existing, ...item } : item);
    }
  });
  return Array.from(map.values());
};

// Two-way auto-heal between users (role 'ojol') and participants
const autoHealOjol = (
  rawUsers: User[], 
  rawParticipants: Participant[], 
  activeShelters: Shelter[]
): { healedUsers: User[], healedParticipants: Participant[] } => {
  const defaultShelterId = activeShelters[0]?.id || 'shelter-1';
  const participantsMap = new Map<string, Participant>();
  rawParticipants.forEach(p => {
    if (p && p.id) participantsMap.set(p.id, p);
  });

  const usersMap = new Map<string, User>();
  rawUsers.forEach(u => {
    if (u && u.id) usersMap.set(u.id, u);
  });

  // 1. Every ojol user in users must have a corresponding Participant in participants
  rawUsers.filter(u => u && u.role === 'ojol').forEach(u => {
    let foundPart = Array.from(participantsMap.values()).find(p => 
      p.userId === u.id || 
      (u.phone && normalizePhone(p.phone) === normalizePhone(u.phone)) ||
      (u.email && p.email?.toLowerCase().trim() === u.email.toLowerCase().trim()) ||
      (u.name && p.name?.toLowerCase().trim() === u.name.toLowerCase().trim())
    );

    const bestAvatar = u.avatar || foundPart?.selfiePhoto || foundPart?.avatar;
    const unifiedName = (foundPart?.name?.trim() || u.name?.trim() || '').trim();

    if (foundPart) {
      const updatedPart: Participant = {
        ...foundPart,
        userId: u.id,
        name: unifiedName || foundPart.name,
        phone: u.phone || foundPart.phone,
        email: u.email || foundPart.email,
        avatar: bestAvatar || foundPart.avatar,
        selfiePhoto: foundPart.selfiePhoto || bestAvatar,
      };
      participantsMap.set(foundPart.id, updatedPart);

      usersMap.set(u.id, { 
        ...u, 
        name: unifiedName || u.name,
        avatar: bestAvatar || u.avatar,
        phone: u.phone || foundPart.phone,
        email: u.email || foundPart.email,
      });
    } else {
      // Auto-create missing participant for this ojol user
      const newPartId = 'part-' + (u.id.replace('user-ojol-', '') || Date.now());
      const avatarVal = bestAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`;
      const newPart: Participant = {
        id: newPartId,
        userId: u.id,
        name: u.name,
        phone: u.phone,
        email: u.email,
        avatar: avatarVal,
        selfiePhoto: avatarVal,
        ojolPlatform: 'Gojek',
        nik: u.nik || '',
        vehiclePlate: u.nik || '-',
        shelterId: defaultShelterId,
        currentLevel: 'Belum Dinilai',
        joinedDate: new Date().toISOString().split('T')[0],
        isActive: u.isActive !== false,
        memberNumber: participantsMap.size + 1,
      };
      participantsMap.set(newPartId, newPart);
    }
  });

  // 2. Every participant in participants must have a corresponding User in users
  Array.from(participantsMap.values()).forEach(p => {
    let foundUser = Array.from(usersMap.values()).find(u => 
      u.id === p.userId ||
      (p.phone && normalizePhone(u.phone) === normalizePhone(p.phone)) ||
      (p.email && u.email?.toLowerCase().trim() === p.email.toLowerCase().trim()) ||
      (p.name && u.name?.toLowerCase().trim() === p.name.toLowerCase().trim())
    );

    const bestAvatar = p.selfiePhoto || p.avatar || foundUser?.avatar;
    const unifiedName = (p.name?.trim() || foundUser?.name?.trim() || '').trim();

    if (foundUser) {
      if (foundUser.id !== p.userId) {
        participantsMap.set(p.id, { ...p, userId: foundUser.id, name: unifiedName });
      } else {
        participantsMap.set(p.id, { ...p, name: unifiedName });
      }
      usersMap.set(foundUser.id, { 
        ...foundUser, 
        name: unifiedName, 
        avatar: bestAvatar || foundUser.avatar,
        phone: p.phone || foundUser.phone,
        email: p.email || foundUser.email,
      });
    } else {
      const newUserId = p.userId || ('user-ojol-' + Date.now());
      const newUser: User = {
        id: newUserId,
        name: p.name,
        email: p.email || `${p.phone || Date.now()}@ojolmengaji.id`,
        phone: p.phone,
        role: 'ojol',
        avatar: bestAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.name)}`,
        password: '123',
        isActive: p.isActive !== false,
        nik: p.nik || p.vehiclePlate,
      };
      usersMap.set(newUserId, newUser);
      participantsMap.set(p.id, { ...p, userId: newUserId });
    }
  });

  return {
    healedUsers: Array.from(usersMap.values()),
    healedParticipants: Array.from(participantsMap.values()),
  };
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'ojol_mengaji_state_v1';
const DRIVER_SESSION_KEY = 'ojol_session_driver';
const ADMIN_SESSION_KEY = 'ojol_session_admin';
const GURU_SESSION_KEY = 'ojol_session_guru';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [shelters, setShelters] = useState<Shelter[]>(INITIAL_SHELTERS);
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [schedules, setSchedules] = useState<Schedule[]>(INITIAL_SCHEDULES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [assessments, setAssessments] = useState<ReadingAssessment[]>(INITIAL_ASSESSMENTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>(INITIAL_SUBMISSIONS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  
  // Independent multi-portal sessions so Driver (/user), Admin (/admin), and Guru (/guru)
  // never conflict or overwrite each other when open in simultaneous tabs!
  const [driverUser, setDriverUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [guruUser, setGuruUser] = useState<User | null>(null);
  const [rawCurrentUser, setRawCurrentUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      // 1. Load Role-specific sessions
      const savedDriver = localStorage.getItem(DRIVER_SESSION_KEY);
      if (savedDriver) {
        try { setDriverUser(JSON.parse(savedDriver)); } catch {}
      }
      const savedAdmin = localStorage.getItem(ADMIN_SESSION_KEY);
      if (savedAdmin) {
        try { setAdminUser(JSON.parse(savedAdmin)); } catch {}
      }
      const savedGuru = localStorage.getItem(GURU_SESSION_KEY);
      if (savedGuru) {
        try { setGuruUser(JSON.parse(savedGuru)); } catch {}
      }

      // 2. Load Main Database State
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        let loadedUsers: User[] = parsed.users ? parsed.users.map((u: User) => {
          if (u.role === 'admin' || u.id === 'user-admin-1') {
            return {
              ...u,
              email: 'admin@ojolmengaji.id',
              password: 'OjolMengaji_Admin123',
              isActive: true
            };
          }
          if (u.id === 'user-guru-1') {
            return {
              ...u,
              username: u.username || 'ust.ahmad',
              password: u.password || 'guru',
            };
          }
          if (u.id === 'user-guru-2') {
            return {
              ...u,
              username: u.username || 'ust.ridwan',
              password: u.password || 'guru',
            };
          }
          if (u.role === 'guru' && !u.username) {
            return {
              ...u,
              username: 'ust.' + (u.name || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10),
              password: u.password || 'guru',
            };
          }
          return u;
        }) : INITIAL_USERS;

        let loadedShelters: Shelter[] = INITIAL_SHELTERS;
        if (parsed.shelters && Array.isArray(parsed.shelters)) {
          const existingNames = new Set(parsed.shelters.map((s: Shelter) => s.name.trim().toLowerCase()));
          const existingIds = new Set(parsed.shelters.map((s: Shelter) => s.id));
          const missingInitial = INITIAL_SHELTERS.filter(
            (initS: Shelter) => !existingIds.has(initS.id) && !existingNames.has(initS.name.trim().toLowerCase())
          );
          loadedShelters = [...parsed.shelters, ...missingInitial];
        }

        let loadedTeachers: Teacher[] = parsed.teachers ? parsed.teachers.map((t: Teacher) => {
          const initMatch = INITIAL_TEACHERS.find(it => it.id === t.id);
          const userMatch = (loadedUsers as User[] | undefined)?.find(u => u.id === t.userId);
          return {
            ...t,
            avatar: t.avatar || userMatch?.avatar || initMatch?.avatar || '',
            username: t.username || initMatch?.username || userMatch?.username || ('ust.' + (t.name || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)),
            generatedPassword: t.generatedPassword || initMatch?.generatedPassword || userMatch?.password || 'guru',
            nik: t.nik || initMatch?.nik || '',
            bankName: t.bankName || initMatch?.bankName || '',
            bankAccount: t.bankAccount || initMatch?.bankAccount || '',
            shelterIds: (t.shelterIds && t.shelterIds.length === 1) ? t.shelterIds : (initMatch?.shelterIds || t.shelterIds || ['shelter-1']),
          };
        }) : INITIAL_TEACHERS;

        let loadedParts: Participant[] = parsed.participants ? parsed.participants.map((p: Participant, idx: number) => {
          const initMatch = INITIAL_PARTICIPANTS.find(ip => ip.id === p.id);
          return {
            ...p,
            memberNumber: p.memberNumber || initMatch?.memberNumber || (idx + 1),
            accountType: p.accountType || initMatch?.accountType || (p.bankName?.toLowerCase().includes('gojek') ? 'Gojek' : p.bankName?.toLowerCase().includes('ovo') ? 'Ovo' : p.bankName?.toLowerCase().includes('dana') ? 'Dana' : p.bankAccount ? 'Bank' : undefined),
            bankName: p.bankName || initMatch?.bankName || undefined,
            bankAccount: p.bankAccount || initMatch?.bankAccount || undefined,
          };
        }) : INITIAL_PARTICIPANTS;

        // Auto-heal drivers: ensure every ojol user has a participant and vice-versa
        const { healedUsers, healedParticipants } = autoHealOjol(loadedUsers, loadedParts, loadedShelters);
        setUsers(healedUsers);
        setParticipants(healedParticipants);
        setShelters(loadedShelters);
        setTeachers(loadedTeachers);

        // Selaraskan sesi driver di localStorage dengan data yang sudah di-heal agar nama selalu sama persis
        if (savedDriver) {
          try {
            const parsedDriver = JSON.parse(savedDriver);
            const matchedUser = healedUsers.find(u => u.id === parsedDriver.id || (parsedDriver.phone && normalizePhone(u.phone) === normalizePhone(parsedDriver.phone)));
            const matchedPart = healedParticipants.find(p => p.userId === parsedDriver.id || (parsedDriver.phone && normalizePhone(p.phone) === normalizePhone(parsedDriver.phone)));
            const exactName = (matchedPart?.name || matchedUser?.name || parsedDriver.name || '').trim();
            const exactAvatar = matchedPart?.selfiePhoto || matchedPart?.avatar || matchedUser?.avatar || parsedDriver.avatar;
            const syncedDriver: User = {
              ...parsedDriver,
              ...(matchedUser || {}),
              name: exactName || parsedDriver.name,
              avatar: exactAvatar,
            };
            setDriverUser(syncedDriver);
            localStorage.setItem(DRIVER_SESSION_KEY, JSON.stringify(syncedDriver));
          } catch {}
        }

        // Selaraskan sesi guru di localStorage dengan data yang sudah di-heal/diperbarui
        if (savedGuru) {
          try {
            const parsedGuru = JSON.parse(savedGuru);
            const matchedTeacher = (loadedTeachers as Teacher[] | undefined)?.find(
              t => t.userId === parsedGuru.id || t.id === parsedGuru.id || (parsedGuru.username && t.username === parsedGuru.username)
            );
            const matchedUser = (loadedUsers as User[] | undefined)?.find(u => u.id === parsedGuru.id);
            const exactAvatar = matchedTeacher?.avatar || matchedUser?.avatar || parsedGuru.avatar;
            const exactName = (matchedTeacher?.name || matchedUser?.name || parsedGuru.name || '').trim();
            const syncedGuru: User = {
              ...parsedGuru,
              ...(matchedUser || {}),
              name: exactName || parsedGuru.name,
              avatar: exactAvatar,
            };
            setGuruUser(syncedGuru);
            localStorage.setItem(GURU_SESSION_KEY, JSON.stringify(syncedGuru));
          } catch {}
        }

        if (parsed.schedules) setSchedules(parsed.schedules);
        if (parsed.attendance) setAttendance(parsed.attendance);
        if (parsed.assessments) setAssessments(parsed.assessments);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.submissions) setSubmissions(parsed.submissions);
        if (parsed.announcements) setAnnouncements(parsed.announcements);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);

        if (parsed.currentUser !== undefined && parsed.currentUser !== null) {
          setRawCurrentUser(parsed.currentUser);
        }
      } else {
        // Initial auto-heal
        const { healedUsers, healedParticipants } = autoHealOjol(INITIAL_USERS, INITIAL_PARTICIPANTS, INITIAL_SHELTERS);
        setUsers(healedUsers);
        setParticipants(healedParticipants);
      }
    } catch (e) {
      console.warn('Could not read saved data from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  // Save database state to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const stateToSave = {
        users,
        shelters,
        teachers,
        participants,
        schedules,
        attendance,
        assessments,
        tasks,
        submissions,
        announcements,
        auditLogs
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Could not save data to localStorage', e);
    }
  }, [
    isLoaded,
    users,
    shelters,
    teachers,
    participants,
    schedules,
    attendance,
    assessments,
    tasks,
    submissions,
    announcements,
    auditLogs
  ]);

  // Cross-tab synchronization via BroadcastChannel & StorageEvent
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.shelters) setShelters(prev => mergeById(prev, parsed.shelters));
          if (parsed.users) setUsers(prev => mergeById(prev, parsed.users));
          if (parsed.teachers) setTeachers(prev => mergeById(prev, parsed.teachers));
          if (parsed.participants) setParticipants(prev => mergeById(prev, parsed.participants));
          if (parsed.schedules) setSchedules(parsed.schedules);
          if (parsed.attendance) setAttendance(prev => mergeById(prev, parsed.attendance));
          if (parsed.assessments) setAssessments(prev => mergeById(prev, parsed.assessments));
          if (parsed.announcements) setAnnouncements(parsed.announcements);
          if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        } catch (err) {
          console.warn('Storage sync error:', err);
        }
      }
      if (e.key === DRIVER_SESSION_KEY) {
        try { setDriverUser(e.newValue ? JSON.parse(e.newValue) : null); } catch {}
      }
      if (e.key === ADMIN_SESSION_KEY) {
        try { setAdminUser(e.newValue ? JSON.parse(e.newValue) : null); } catch {}
      }
      if (e.key === GURU_SESSION_KEY) {
        try { setGuruUser(e.newValue ? JSON.parse(e.newValue) : null); } catch {}
      }
    };

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('ojol_mengaji_channel');
      bc.onmessage = (event) => {
        if (event.data?.payload) {
          const p = event.data.payload;
          if (p.shelters) setShelters(prev => mergeById(prev, p.shelters));
          if (p.users) setUsers(prev => mergeById(prev, p.users));
          if (p.teachers) setTeachers(prev => mergeById(prev, p.teachers));
          if (p.participants) setParticipants(prev => mergeById(prev, p.participants));
          if (p.schedules) setSchedules(p.schedules);
          if (p.attendance) setAttendance(prev => mergeById(prev, p.attendance));
          if (p.assessments) setAssessments(prev => mergeById(prev, p.assessments));
          if (p.announcements) setAnnouncements(p.announcements);
        }
      };
    }

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (bc) bc.close();
    };
  }, []);

  const notifySync = (payload: Partial<any>) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('ojol_mengaji_channel');
        bc.postMessage({ type: 'STATE_UPDATED', payload });
        setTimeout(() => bc.close(), 1000);
      }
    } catch {
      // ignore
    }
  };

  const addAudit = (action: string, entity: string, targetId: string, details: string) => {
    const newLog: AuditLog = {
      id: 'audit-' + Date.now(),
      action,
      userName: currentUser?.name || 'Sistem Mandiri',
      userRole: currentUser?.role || 'ojol',
      targetEntity: entity,
      targetId,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Resolve currentUser intelligently based on current active role / route:
  // If viewing /admin, prefers adminUser
  // If viewing /guru, prefers guruUser
  // If viewing /user, prefers driverUser
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const currentUser: User | null = React.useMemo(() => {
    if (currentPath.startsWith('/admin')) {
      return adminUser || (rawCurrentUser?.role === 'admin' ? rawCurrentUser : null);
    }
    if (currentPath.startsWith('/guru')) {
      return guruUser || (rawCurrentUser?.role === 'guru' ? rawCurrentUser : null) || (adminUser ? adminUser : null);
    }
    if (currentPath.startsWith('/user')) {
      return driverUser || (rawCurrentUser?.role === 'ojol' ? rawCurrentUser : null);
    }
    return rawCurrentUser || driverUser || adminUser || guruUser;
  }, [currentPath, driverUser, adminUser, guruUser, rawCurrentUser]);

  const setCurrentUser: React.Dispatch<React.SetStateAction<User | null>> = (valOrFn) => {
    setRawCurrentUser(prev => {
      const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
      if (next) {
        if (next.role === 'ojol') {
          setDriverUser(next);
          localStorage.setItem(DRIVER_SESSION_KEY, JSON.stringify(next));
        } else if (next.role === 'admin') {
          setAdminUser(next);
          localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(next));
        } else if (next.role === 'guru') {
          setGuruUser(next);
          localStorage.setItem(GURU_SESSION_KEY, JSON.stringify(next));
        }
      }
      return next;
    });
  };

  const loginDriver = (identifier: string, password?: string): { success: boolean; message: string; user?: User } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = normalizePhone(identifier);

    // 1. Cari data peserta di participants
    let matchingPart = participants.find(p => 
      (p.email && p.email.toLowerCase() === cleanId) ||
      (cleanPhone && p.phone && normalizePhone(p.phone) === cleanPhone) ||
      (p.name && p.name.toLowerCase() === cleanId)
    );

    // 2. Cari data akun di users
    let found = users.find(u => 
      u.role === 'ojol' && (
        (matchingPart && u.id === matchingPart.userId) ||
        u.email.toLowerCase() === cleanId ||
        (cleanPhone && normalizePhone(u.phone) === cleanPhone) ||
        u.name.toLowerCase() === cleanId
      )
    );

    // 3. Jika ditemukan di peserta tetapi belum ada di users, sinkronkan otomatis
    if (!found && matchingPart) {
      const newUserId = matchingPart.userId || ('user-ojol-' + Date.now());
      found = {
        id: newUserId,
        name: matchingPart.name,
        email: matchingPart.email || `${matchingPart.phone || Date.now()}@ojolmengaji.id`,
        phone: matchingPart.phone,
        role: 'ojol',
        avatar: matchingPart.selfiePhoto || matchingPart.avatar,
        password: '123',
        isActive: matchingPart.isActive !== false,
        nik: matchingPart.nik || matchingPart.vehiclePlate,
      };
      setUsers(prev => [...prev.filter(u => u.id !== found!.id), found!]);
    }

    if (!found) {
      return {
        success: false,
        message: 'Akun driver tidak ditemukan dengan data tersebut. Silakan lakukan pendaftaran terlebih dahulu.'
      };
    }

    if (!found.isActive) {
      return {
        success: false,
        message: 'Status akun driver Anda sedang tidak aktif. Silakan hubungi ustadz atau admin.'
      };
    }

    if (password && found.password && found.password !== password) {
      return {
        success: false,
        message: 'Kata sandi tidak sesuai. Silakan coba kembali.'
      };
    }

    // 4. Pastikan nama akun user dan nama peserta dijamin 100% SAMA PERSIS
    const exactName = (matchingPart?.name || found.name).trim();
    const exactAvatar = matchingPart?.selfiePhoto || matchingPart?.avatar || found.avatar;
    const syncedFound: User = {
      ...found,
      name: exactName,
      avatar: exactAvatar,
      phone: matchingPart?.phone || found.phone,
      email: matchingPart?.email || found.email,
    };

    if (matchingPart) {
      const updatedPart = { 
        ...matchingPart, 
        name: exactName, 
        userId: syncedFound.id,
        avatar: exactAvatar || matchingPart.avatar,
        selfiePhoto: exactAvatar || matchingPart.selfiePhoto
      };
      setParticipants(prev => prev.map(p => p.id === matchingPart!.id ? updatedPart : p));
    }

    setUsers(prev => prev.map(u => u.id === syncedFound.id ? syncedFound : u));
    setDriverUser(syncedFound);
    setRawCurrentUser(syncedFound);
    localStorage.setItem(DRIVER_SESSION_KEY, JSON.stringify(syncedFound));
    addAudit('LOGIN_DRIVER', 'users', syncedFound.id, `Driver ${syncedFound.name} berhasil masuk ke dashboard`);
    return {
      success: true,
      message: `Alhamdulillah! Selamat datang kembali, ${syncedFound.name}.`,
      user: syncedFound
    };
  };

  const loginStaff = (identifier: string, password?: string): { success: boolean; message: string; user?: User } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/[\s-]/g, '');

    const isAdminEmail = cleanId === 'admin@ojolmengaji.id';
    const adminUserObj = users.find(u => u.role === 'admin' || u.id === 'user-admin-1');

    const isOtherAdminIdentifier = adminUserObj && (
      adminUserObj.phone.replace(/[\s-]/g, '') === cleanPhone ||
      adminUserObj.name.toLowerCase() === cleanId
    );

    if (isOtherAdminIdentifier && !isAdminEmail) {
      return {
        success: false,
        message: 'Akses ditolak: Login Administrator hanya diizinkan menggunakan email resmi admin@ojolmengaji.id.'
      };
    }

    if (isAdminEmail) {
      if (!adminUserObj) {
        return {
          success: false,
          message: 'Akun Administrator tidak ditemukan.'
        };
      }

      if (!adminUserObj.isActive) {
        return {
          success: false,
          message: 'Status akun Administrator sedang tidak aktif.'
        };
      }

      if (password !== 'OjolMengaji_Admin123') {
        return {
          success: false,
          message: 'Kata sandi Administrator salah. Silakan coba kembali.'
        };
      }

      setAdminUser(adminUserObj);
      setRawCurrentUser(adminUserObj);
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUserObj));
      addAudit('LOGIN_STAFF', 'users', adminUserObj.id, `Administrator ${adminUserObj.name} berhasil masuk ke portal manajemen`);
      return {
        success: true,
        message: `Alhamdulillah! Selamat datang, ${adminUserObj.name} (Administrator Pusat).`,
        user: adminUserObj
      };
    }

    const isAttemptingOtherAdmin = users.some(u => 
      u.role === 'admin' && (
        u.email.toLowerCase() === cleanId ||
        u.phone.replace(/[\s-]/g, '') === cleanPhone ||
        u.name.toLowerCase() === cleanId
      )
    );
    if (isAttemptingOtherAdmin) {
      return {
        success: false,
        message: 'Akses ditolak: Selain admin@ojolmengaji.id tidak dapat login sebagai Administrator.'
      };
    }

    const foundGuru = users.find(u => 
      u.role === 'guru' && (
        (u.username && u.username.toLowerCase() === cleanId) ||
        u.email.toLowerCase() === cleanId ||
        u.phone.replace(/[\s-]/g, '') === cleanPhone ||
        u.name.toLowerCase() === cleanId
      )
    );

    if (!foundGuru) {
      const isOjol = users.find(u => 
        u.role === 'ojol' && (
          (u.username && u.username.toLowerCase() === cleanId) ||
          u.email.toLowerCase() === cleanId ||
          u.phone.replace(/[\s-]/g, '') === cleanPhone ||
          u.name.toLowerCase() === cleanId
        )
      );

      if (isOjol) {
        return {
          success: false,
          message: 'Akun ini terdaftar sebagai Mitra Driver Ojol. Portal ini khusus untuk Administrator Pusat & Dewan Guru. Silakan masuk melalui halaman login driver di portal utama.'
        };
      }

      return {
        success: false,
        message: 'Username atau akun guru tidak ditemukan. Hanya Dewan Guru yang telah mendapatkan generate Username & Password resmi dari Administrator Pusat yang dapat masuk ke portal ini.'
      };
    }

    if (!foundGuru.isActive) {
      return {
        success: false,
        message: 'Status akun pengelola/guru Anda sedang tidak aktif. Silakan hubungi Administrator Sistem.'
      };
    }

    if (password && foundGuru.password && foundGuru.password !== password) {
      return {
        success: false,
        message: 'Kata sandi akun guru tidak sesuai. Silakan gunakan kata sandi yang telah digenerate/diberikan oleh Administrator Pusat.'
      };
    }

    const matchingTeacher = teachers.find(t => t.userId === foundGuru.id || t.id === foundGuru.id);
    const bestGuruAvatar = matchingTeacher?.avatar || foundGuru.avatar;
    const syncedGuru: User = {
      ...foundGuru,
      avatar: bestGuruAvatar
    };
    setGuruUser(syncedGuru);
    setRawCurrentUser(syncedGuru);
    localStorage.setItem(GURU_SESSION_KEY, JSON.stringify(syncedGuru));
    const roleTitle = 'Guru Mengaji (Ustadz)';
    addAudit('LOGIN_STAFF', 'users', foundGuru.id, `${roleTitle} @${foundGuru.username || foundGuru.name} (${foundGuru.name}) berhasil masuk ke portal bimbingan guru`);
    return {
      success: true,
      message: `Alhamdulillah! Selamat datang, ${foundGuru.name} (${roleTitle}).`,
      user: foundGuru
    };
  };

  const registerDriver = (data: RegisterDriverData): { success: boolean; message: string; user?: User } => {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const cleanPhone = normalizePhone(data.phone);

    // Check if phone or email already registered
    const exists = users.find(u => 
      u.role === 'ojol' && (
        (cleanEmail && u.email.toLowerCase() === cleanEmail) ||
        (cleanPhone && normalizePhone(u.phone) === cleanPhone)
      )
    );

    if (exists) {
      const isSamePhone = Boolean(cleanPhone && normalizePhone(exists.phone) === cleanPhone);
      const isSameEmail = Boolean(cleanEmail && exists.email.toLowerCase() === cleanEmail);
      const matchedField = isSamePhone && isSameEmail 
        ? 'Nomor WhatsApp dan Alamat Email' 
        : isSamePhone 
          ? 'Nomor WhatsApp' 
          : 'Alamat Email';
      return {
        success: false,
        message: `${matchedField} sudah terdaftar atas nama ${exists.name}. Silakan langsung masuk (login) menggunakan akun Anda.`
      };
    }

    const userId = 'user-ojol-' + Date.now();
    const partId = 'part-' + Date.now();
    const avatarUrl = data.selfiePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`;

    const cleanAddress = data.address?.trim() || '';

    const newUser: User = {
      id: userId,
      name: data.name.trim(),
      email: cleanEmail || `${cleanPhone || Date.now()}@ojolmengaji.id`,
      phone: data.phone.trim(),
      address: cleanAddress,
      role: 'ojol',
      avatar: avatarUrl,
      password: data.password || '123',
      isActive: true,
      nik: data.nik?.trim() || data.vehiclePlate?.trim(),
    };

    const nikVal = data.nik?.trim() || data.vehiclePlate?.trim() || '';
    const nextMemberNumber = participants.length > 0
      ? Math.max(...participants.map(p => p.memberNumber || 0)) + 1
      : 1;

    const newParticipant: Participant = {
      id: partId,
      userId,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: cleanEmail || `${cleanPhone || Date.now()}@ojolmengaji.id`,
      address: cleanAddress,
      avatar: avatarUrl,
      selfiePhoto: data.selfiePhoto || avatarUrl,
      ojolPlatform: data.ojolPlatform,
      nik: nikVal,
      vehiclePlate: data.vehiclePlate?.trim().toUpperCase() || nikVal || '-',
      shelterId: data.shelterId,
      currentLevel: data.currentLevel || 'Belum Dinilai',
      joinedDate: new Date().toISOString().split('T')[0],
      isActive: true,
      memberNumber: nextMemberNumber,
      accountType: data.accountType,
      bankName: data.accountType === 'Bank' ? (data.bankName?.trim() || undefined) : (data.accountType || undefined),
      bankAccount: data.bankAccount?.trim() || undefined,
    };

    const nextUsers = [...users.filter(u => u.id !== newUser.id), newUser];
    const nextParts = [...participants.filter(p => p.id !== newParticipant.id), newParticipant];

    setUsers(nextUsers);
    setParticipants(nextParts);
    // Tidak langsung login otomatis agar diarahkan ke halaman/tab Masuk Akun terlebih dahulu

    notifySync({ users: nextUsers, participants: nextParts });

    const shelterName = shelters.find(s => s.id === data.shelterId)?.name || 'Shelter Mengaji';
    const idInfo = nikVal ? `NIK: ${nikVal}` : (data.vehiclePlate || '-');
    const bankAudit = data.bankAccount ? ` [Rek: ${data.bankName ? data.bankName + ' ' : ''}${data.bankAccount}]` : '';
    addAudit('REGISTER_DRIVER', 'participants', partId, `Pendaftaran driver baru "${data.name}" (${data.ojolPlatform} - ${idInfo}${bankAudit}) di ${shelterName}`);

    return {
      success: true,
      message: `Alhamdulillah! Pendaftaran akun berhasil. Selamat bergabung, ${data.name}. Silakan masuk menggunakan nomor WhatsApp/email dan kata sandi Anda.`,
      user: newUser
    };
  };

  const logout = () => {
    const isUserPortal = typeof window !== 'undefined' && window.location.pathname.startsWith('/user');
    const isAdminPortal = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const isGuruPortal = typeof window !== 'undefined' && window.location.pathname.startsWith('/guru');

    if (isUserPortal) {
      if (driverUser) addAudit('LOGOUT', 'users', driverUser.id, `Driver ${driverUser.name} keluar dari akun`);
      setDriverUser(null);
      localStorage.removeItem(DRIVER_SESSION_KEY);
      if (rawCurrentUser?.role === 'ojol') setRawCurrentUser(null);
    } else if (isAdminPortal) {
      if (adminUser) addAudit('LOGOUT', 'users', adminUser.id, `Administrator ${adminUser.name} keluar dari akun`);
      setAdminUser(null);
      localStorage.removeItem(ADMIN_SESSION_KEY);
      if (rawCurrentUser?.role === 'admin') setRawCurrentUser(null);
    } else if (isGuruPortal) {
      if (guruUser) addAudit('LOGOUT', 'users', guruUser.id, `Guru ${guruUser.name} keluar dari akun`);
      setGuruUser(null);
      localStorage.removeItem(GURU_SESSION_KEY);
      if (rawCurrentUser?.role === 'guru') setRawCurrentUser(null);
    } else {
      if (currentUser) {
        const roleTitle = currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'guru' ? 'Guru' : 'Driver';
        addAudit('LOGOUT', 'users', currentUser.id, `${roleTitle} ${currentUser.name} keluar dari akun`);
      }
      setDriverUser(null);
      setAdminUser(null);
      setGuruUser(null);
      setRawCurrentUser(null);
      localStorage.removeItem(DRIVER_SESSION_KEY);
      localStorage.removeItem(ADMIN_SESSION_KEY);
      localStorage.removeItem(GURU_SESSION_KEY);
    }
  };

  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      if (user.role === 'admin' && currentUser?.role !== 'admin') {
        return;
      }
      setCurrentUser(user);
    }
  };

  const quickSwitchRole = (role: UserRole) => {
    if (role === 'admin') {
      return;
    }
    const firstUserWithRole = users.find(u => u.role === role);
    if (firstUserWithRole) {
      setCurrentUser(firstUserWithRole);
    }
  };

  const resetPassword = (email: string, newPassword: string): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

    if (userIndex === -1) {
      return {
        success: false,
        message: 'Akun dengan alamat email tersebut tidak ditemukan dalam sistem.',
      };
    }

    const targetUser = users[userIndex];
    const updatedUser = { ...targetUser, password: newPassword };
    const updatedUsers = [...users];
    updatedUsers[userIndex] = updatedUser;

    setUsers(updatedUsers);

    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }

    notifySync({ users: updatedUsers });
    addAudit(
      'RESET_PASSWORD',
      'users',
      updatedUser.id,
      `Kata sandi akun ${updatedUser.name} (${updatedUser.email} - role: ${updatedUser.role}) berhasil diperbarui via verifikasi OTP Email SMTP`
    );

    return {
      success: true,
      message: `Kata sandi akun ${updatedUser.name} berhasil diperbarui. Silakan masuk menggunakan kata sandi baru Anda.`,
    };
  };

  // Shelters
  const addShelter = (newShelterData: Omit<Shelter, 'id'>) => {
    const id = 'shelter-' + Date.now();
    const shelter: Shelter = { ...newShelterData, id };
    const filtered = shelters.filter(s => s.id !== id && s.name.toLowerCase().trim() !== shelter.name.toLowerCase().trim());
    const next = [...filtered, shelter];
    setShelters(next);
    notifySync({ shelters: next });
    addAudit('CREATE_SHELTER', 'shelters', id, `Menambahkan shelter baru "${shelter.name}"`);
  };

  const updateShelter = (updated: Shelter) => {
    const next = shelters.map(s => s.id === updated.id ? updated : s);
    setShelters(next);
    notifySync({ shelters: next });
    addAudit('UPDATE_SHELTER', 'shelters', updated.id, `Memperbarui data shelter "${updated.name}"`);
  };

  const deleteShelter = (id: string) => {
    const name = shelters.find(s => s.id === id)?.name || id;
    const next = shelters.filter(s => s.id !== id);
    setShelters(next);
    notifySync({ shelters: next });
    addAudit('DELETE_SHELTER', 'shelters', id, `Menghapus shelter "${name}"`);
  };

  // Teachers
  const addTeacher = (
    data: Omit<Teacher, 'id' | 'userId' | 'email'> & {
      username?: string;
      password?: string;
      email?: string;
    },
    email?: string
  ): { success: boolean; message: string; teacher?: Teacher; user?: User } => {
    const cleanUsername = (data.username || '')
      .trim()
      .toLowerCase()
      .replace(/^@/, '')
      .replace(/\s+/g, '_') ||
      ('ust.' + data.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12));

    const passwordVal = data.password?.trim() || 'guru';

    const usernameTaken = users.some(u => u.username && u.username.toLowerCase() === cleanUsername);
    if (usernameTaken) {
      return {
        success: false,
        message: `Username "@${cleanUsername}" sudah digunakan oleh akun lain. Silakan buat atau generate username yang berbeda.`
      };
    }

    const userId = 'user-guru-' + Date.now();
    const teacherId = 'teacher-' + Date.now();
    const resolvedEmail = (email && email.trim()) || data.email?.trim() || `${cleanUsername}@ojolmengaji.id`;

    const newUser: User = {
      id: userId,
      name: data.name.trim(),
      username: cleanUsername,
      email: resolvedEmail,
      role: 'guru',
      avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      phone: data.phone.trim(),
      password: passwordVal,
      nik: data.nik,
      isActive: true,
    };

    const newTeacher: Teacher = {
      ...data,
      id: teacherId,
      userId,
      username: cleanUsername,
      email: resolvedEmail,
      generatedPassword: passwordVal,
    };

    const nextUsers = [...users, newUser];
    const nextTeachers = [...teachers, newTeacher];
    setUsers(nextUsers);
    setTeachers(nextTeachers);
    notifySync({ users: nextUsers, teachers: nextTeachers });

    const shelterNames = shelters
      .filter(s => (newTeacher.shelterIds || []).includes(s.id))
      .map(s => s.name)
      .join(', ') || 'Belum Ditugaskan';

    addAudit(
      'CREATE_TEACHER', 
      'teachers', 
      teacherId, 
      `Admin mendaftarkan Dewan Guru "${data.name}" [Username: @${cleanUsername}] di ${shelterNames}`
    );

    return {
      success: true,
      message: `Alhamdulillah! Akun Guru "${data.name}" berhasil dibuat dengan username @${cleanUsername}.`,
      teacher: newTeacher,
      user: newUser
    };
  };

  const updateTeacher = (updated: Teacher & { password?: string }) => {
    const nextTeachers = teachers.map(t => t.id === updated.id ? updated : t);
    setTeachers(nextTeachers);

    const nextUsers = users.map(u => {
      if (u.id === updated.userId || u.id === updated.id || (updated.username && u.username === updated.username)) {
        return {
          ...u,
          name: updated.name,
          username: updated.username || u.username,
          email: updated.email || u.email,
          phone: updated.phone || u.phone,
          avatar: updated.avatar || u.avatar,
          nik: updated.nik || u.nik,
          ...(updated.password ? { password: updated.password } : {})
        };
      }
      return u;
    });
    setUsers(nextUsers);

    // Update active guru session if matching
    if (guruUser && (guruUser.id === updated.userId || guruUser.id === updated.id || (updated.username && guruUser.username === updated.username))) {
      const updatedGuruUser: User = {
        ...guruUser,
        name: updated.name,
        username: updated.username || guruUser.username,
        email: updated.email || guruUser.email,
        phone: updated.phone || guruUser.phone,
        avatar: updated.avatar || guruUser.avatar,
        nik: updated.nik || guruUser.nik,
        ...(updated.password ? { password: updated.password } : {})
      };
      setGuruUser(updatedGuruUser);
      localStorage.setItem(GURU_SESSION_KEY, JSON.stringify(updatedGuruUser));
    }

    if (rawCurrentUser && (rawCurrentUser.id === updated.userId || rawCurrentUser.id === updated.id || (updated.username && rawCurrentUser.username === updated.username))) {
      const updatedCurrUser: User = {
        ...rawCurrentUser,
        name: updated.name,
        username: updated.username || rawCurrentUser.username,
        email: updated.email || rawCurrentUser.email,
        phone: updated.phone || rawCurrentUser.phone,
        avatar: updated.avatar || rawCurrentUser.avatar,
        nik: updated.nik || rawCurrentUser.nik,
        ...(updated.password ? { password: updated.password } : {})
      };
      setRawCurrentUser(updatedCurrUser);
    }

    notifySync({ teachers: nextTeachers, users: nextUsers });

    addAudit('UPDATE_TEACHER', 'teachers', updated.id, `Memperbarui data dan foto/kredensial guru "${updated.name}"`);
  };

  // Participants
  const addParticipant = (data: Omit<Participant, 'id' | 'userId' | 'email'>, email: string) => {
    const userId = 'user-ojol-' + Date.now();
    const partId = 'part-' + Date.now();
    const bestAvatar = data.avatar || data.selfiePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`;

    const newUser: User = {
      id: userId,
      name: data.name,
      email: email,
      role: 'ojol',
      avatar: bestAvatar,
      phone: data.phone,
      isActive: true,
      nik: data.nik || data.vehiclePlate,
      password: '123',
    };

    const nextMemberNumber = data.memberNumber || (participants.length > 0
      ? Math.max(...participants.map(p => p.memberNumber || 0)) + 1
      : 1);

    const newPart: Participant = {
      ...data,
      id: partId,
      userId,
      email,
      avatar: bestAvatar,
      selfiePhoto: data.selfiePhoto || bestAvatar,
      memberNumber: nextMemberNumber,
    };

    const nextUsers = [...users, newUser];
    const nextParts = [...participants, newPart];
    setUsers(nextUsers);
    setParticipants(nextParts);
    notifySync({ users: nextUsers, participants: nextParts });
    addAudit('CREATE_PARTICIPANT', 'participants', partId, `Mendaftarkan peserta ojol "${data.name}" (${data.ojolPlatform})`);
  };

  const updateParticipant = (updated: Participant) => {
    const bestAvatar = updated.selfiePhoto || updated.avatar;
    const normalizedPart: Participant = {
      ...updated,
      avatar: bestAvatar || updated.avatar,
      selfiePhoto: bestAvatar || updated.selfiePhoto,
    };

    const nextParts = participants.map(p => p.id === updated.id ? normalizedPart : p);
    setParticipants(nextParts);

    const nextUsers = users.map(u => {
      if (u.id === updated.userId || normalizePhone(u.phone) === normalizePhone(updated.phone)) {
        return { 
          ...u, 
          name: updated.name, 
          phone: updated.phone,
          avatar: bestAvatar || u.avatar,
          nik: updated.nik || updated.vehiclePlate || u.nik,
        };
      }
      return u;
    });
    setUsers(nextUsers);

    // Update active driver session if matching
    if (driverUser && (driverUser.id === updated.userId || normalizePhone(driverUser.phone) === normalizePhone(updated.phone))) {
      const updatedDriverUser = {
        ...driverUser,
        name: updated.name,
        phone: updated.phone,
        avatar: bestAvatar || driverUser.avatar,
        nik: updated.nik || updated.vehiclePlate,
      };
      setDriverUser(updatedDriverUser);
      localStorage.setItem(DRIVER_SESSION_KEY, JSON.stringify(updatedDriverUser));
    }

    if (rawCurrentUser && (rawCurrentUser.id === updated.userId || normalizePhone(rawCurrentUser.phone) === normalizePhone(updated.phone))) {
      const updatedCurrUser = {
        ...rawCurrentUser,
        name: updated.name,
        phone: updated.phone,
        avatar: bestAvatar || rawCurrentUser.avatar,
        nik: updated.nik || updated.vehiclePlate,
      };
      setRawCurrentUser(updatedCurrUser);
    }

    notifySync({ participants: nextParts, users: nextUsers });
    addAudit('UPDATE_PARTICIPANT', 'participants', updated.id, `Memperbarui data peserta ojol "${updated.name}"`);
  };

  const updateParticipantLevel = (participantId: string, newLevel: ParticipantLevel, notes?: string) => {
    const nextParts = participants.map(p => {
      if (p.id === participantId) {
        return { ...p, currentLevel: newLevel };
      }
      return p;
    });
    setParticipants(nextParts);
    notifySync({ participants: nextParts });

    const target = participants.find(p => p.id === participantId);
    const teacherName = currentUser?.name || 'Ustadz Pembimbing';
    addAudit(
      'UPDATE_LEVEL',
      'participants',
      participantId,
      `Guru ${teacherName} menetapkan tingkat kemampuan "${target?.name || participantId}" menjadi "${newLevel}"${notes ? ` (Catatan: ${notes})` : ''}`
    );
  };

  const requestShelterTransfer = (participantId: string, targetShelterId: string, reason?: string) => {
    const part = participants.find(p => p.id === participantId);
    const targetSh = shelters.find(s => s.id === targetShelterId);
    if (!part || !targetSh) {
      return { success: false, message: 'Data peserta atau shelter tidak ditemukan.' };
    }
    if (part.shelterId === targetShelterId) {
      return { success: false, message: 'Anda sudah terdaftar di shelter ini.' };
    }

    const now = new Date().toISOString();
    const nextParts = participants.map(p => {
      if (p.id === participantId) {
        return {
          ...p,
          pendingShelterId: targetShelterId,
          shelterTransferStatus: 'pending' as const,
          shelterTransferRequestedAt: now,
          shelterTransferReason: reason || 'Permohonan perpindahan shelter oleh driver',
        };
      }
      return p;
    });
    setParticipants(nextParts);
    notifySync({ participants: nextParts });

    addAudit(
      'REQUEST_SHELTER_TRANSFER',
      'participants',
      participantId,
      `Driver ${part.name} mengajukan pindah ke ${targetSh.name}. Menunggu verifikasi Admin Pusat.`
    );

    return {
      success: true,
      message: `Pengajuan pindah ke ${targetSh.name} berhasil dikirim! Menunggu persetujuan Admin Pusat.`,
    };
  };

  const approveShelterTransfer = (participantId: string) => {
    const part = participants.find(p => p.id === participantId);
    if (!part || !part.pendingShelterId) {
      return { success: false, message: 'Permohonan pindah shelter tidak ditemukan.' };
    }
    const targetSh = shelters.find(s => s.id === part.pendingShelterId);
    const newShelterName = targetSh?.name || 'Shelter Baru';

    const nextParts = participants.map(p => {
      if (p.id === participantId) {
        return {
          ...p,
          shelterId: p.pendingShelterId!,
          pendingShelterId: undefined,
          shelterTransferStatus: 'approved' as const,
        };
      }
      return p;
    });
    setParticipants(nextParts);
    notifySync({ participants: nextParts });

    addAudit(
      'APPROVE_SHELTER_TRANSFER',
      'participants',
      participantId,
      `Admin menyetujui kepindahan driver ${part.name} ke ${newShelterName}`
    );

    return {
      success: true,
      message: `Kepindahan driver ${part.name} ke ${newShelterName} berhasil disetujui!`,
    };
  };

  const rejectShelterTransfer = (participantId: string, reason?: string) => {
    const part = participants.find(p => p.id === participantId);
    if (!part) return { success: false, message: 'Peserta tidak ditemukan.' };

    const nextParts = participants.map(p => {
      if (p.id === participantId) {
        return {
          ...p,
          pendingShelterId: undefined,
          shelterTransferStatus: 'rejected' as const,
        };
      }
      return p;
    });
    setParticipants(nextParts);
    notifySync({ participants: nextParts });

    addAudit(
      'REJECT_SHELTER_TRANSFER',
      'participants',
      participantId,
      `Admin menolak kepindahan driver ${part.name}${reason ? `: ${reason}` : ''}`
    );

    return {
      success: true,
      message: `Permohonan pindah driver ${part.name} telah ditolak.`,
    };
  };

  const cancelShelterTransferRequest = (participantId: string) => {
    const nextParts = participants.map(p => {
      if (p.id === participantId) {
        return {
          ...p,
          pendingShelterId: undefined,
          shelterTransferStatus: undefined,
          shelterTransferRequestedAt: undefined,
          shelterTransferReason: undefined,
        };
      }
      return p;
    });
    setParticipants(nextParts);
    notifySync({ participants: nextParts });
    return { success: true, message: 'Pengajuan pindah shelter dibatalkan.' };
  };

  // Schedules
  const addSchedule = (data: Omit<Schedule, 'id'>) => {
    const id = 'sched-' + Date.now();
    const newSchedule: Schedule = { ...data, id };
    const next = [...schedules, newSchedule];
    setSchedules(next);
    notifySync({ schedules: next });
    addAudit('CREATE_SCHEDULE', 'schedules', id, `Membuat jadwal baru hari ${data.dayName}`);
  };

  const updateSchedule = (updated: Schedule) => {
    const next = schedules.map(s => s.id === updated.id ? updated : s);
    setSchedules(next);
    notifySync({ schedules: next });
    addAudit('UPDATE_SCHEDULE', 'schedules', updated.id, `Memperbarui jadwal hari ${updated.dayName}`);
  };

  const deleteSchedule = (id: string) => {
    const next = schedules.filter(s => s.id !== id);
    setSchedules(next);
    notifySync({ schedules: next });
    addAudit('DELETE_SCHEDULE', 'schedules', id, 'Menghapus jadwal sesi mengaji');
  };

  // Attendance
  const recordAttendance = (
    participantId: string, 
    shelterId: string, 
    method: AttendanceMethod, 
    status: AttendanceStatus = 'hadir', 
    distanceMeters: number = 15,
    notes?: string
  ) => {
    const today = new Date().toISOString().substring(0, 10);
    const existing = attendance.find(a => a.participantId === participantId && a.sessionDate === today);
    if (existing) {
      return { 
        success: false, 
        message: 'Peserta sudah melakukan presensi untuk hari ini (' + existing.checkInTime + '). Presensi ganda dicegah.' 
      };
    }

    const newRecord: AttendanceRecord = {
      id: 'att-' + Date.now(),
      participantId,
      shelterId,
      sessionDate: today,
      checkInTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status,
      method,
      distanceMeters,
      verifiedByTeacherId: currentUser?.role === 'guru' ? teachers.find(t => t.userId === currentUser.id)?.id : undefined,
      notes: notes || `Presensi berhasil via ${method.toUpperCase()} (${distanceMeters}m dari pusat shelter)`
    };

    const nextAttendance = [newRecord, ...attendance];
    setAttendance(nextAttendance);
    notifySync({ attendance: nextAttendance });

    const part = participants.find(p => p.id === participantId);
    addAudit('RECORD_ATTENDANCE', 'attendance_records', newRecord.id, `Presensi ${part?.name || participantId} status ${status} via ${method}`);
    return { success: true, message: 'Presensi berhasil dicatat!' };
  };

  const correctAttendance = (recordId: string, newStatus: AttendanceStatus, reason: string) => {
    const next = attendance.map(a => {
      if (a.id === recordId) {
        return {
          ...a,
          status: newStatus,
          notes: (a.notes ? a.notes + ' | ' : '') + `Koreksi status oleh ${currentUser?.name || 'Admin'}: ${newStatus} (Alasan: ${reason})`
        };
      }
      return a;
    });
    setAttendance(next);
    notifySync({ attendance: next });
    addAudit('CORRECT_ATTENDANCE', 'attendance_records', recordId, `Koreksi presensi menjadi "${newStatus}". Alasan: ${reason}`);
  };

  // Reading Assessment
  const addAssessment = (data: Omit<ReadingAssessment, 'id'>) => {
    const id = 'eval-' + Date.now();
    const newAssessment: ReadingAssessment = { ...data, id };
    const nextAssessments = [newAssessment, ...assessments];
    setAssessments(nextAssessments);

    let nextParts = participants;
    if (data.assessedLevel) {
      nextParts = participants.map(p => p.id === data.participantId ? { ...p, currentLevel: data.assessedLevel! } : p);
      setParticipants(nextParts);
    }

    notifySync({ assessments: nextAssessments, participants: nextParts });
    const p = participants.find(part => part.id === data.participantId);
    addAudit('ADD_ASSESSMENT', 'reading_assessments', id, `Evaluasi membaca untuk ${p?.name || data.participantId} (${data.material}) - Level: ${data.assessedLevel || p?.currentLevel}`);
  };

  // Tasks
  const createTask = (data: Omit<Task, 'id' | 'createdDate'>) => {
    const id = 'task-' + Date.now();
    const newTask: Task = {
      ...data,
      id,
      createdDate: new Date().toISOString().substring(0, 10),
    };
    const next = [newTask, ...tasks];
    setTasks(next);
    notifySync({ tasks: next });
    addAudit('CREATE_TASK', 'tasks', id, `Membuat tugas mengaji "${data.title}"`);
  };

  const submitTask = (taskId: string, participantId: string, notes: string, audioName?: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    let nextSubmissions = submissions;
    const existing = submissions.find(s => s.taskId === taskId && s.participantId === participantId);
    if (existing) {
      nextSubmissions = submissions.map(s => s.id === existing.id ? {
        ...s,
        status: 'menunggu_pemeriksaan',
        submittedAt: now,
        submissionNotes: notes,
        audioFileName: audioName || s.audioFileName,
      } : s);
    } else {
      const newSub: TaskSubmission = {
        id: 'sub-' + Date.now(),
        taskId,
        participantId,
        status: 'menunggu_pemeriksaan',
        submittedAt: now,
        submissionNotes: notes,
        audioFileName: audioName,
      };
      nextSubmissions = [newSub, ...submissions];
    }
    setSubmissions(nextSubmissions);
    notifySync({ submissions: nextSubmissions });

    const t = tasks.find(tk => tk.id === taskId);
    addAudit('SUBMIT_TASK', 'task_submissions', taskId, `Peserta mengirimkan tugas "${t?.title}"`);
  };

  const evaluateSubmission = (submissionId: string, status: TaskStatus, score: number, feedback: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const next = submissions.map(s => s.id === submissionId ? {
      ...s,
      status,
      score,
      teacherFeedback: feedback,
      evaluatedAt: now,
    } : s);
    setSubmissions(next);
    notifySync({ submissions: next });
    addAudit('EVALUATE_TASK', 'task_submissions', submissionId, `Penilaian tugas dengan status "${status}" dan nilai ${score}`);
  };

  // Announcements
  const createAnnouncement = (data: Omit<Announcement, 'id' | 'createdAt' | 'authorName'>) => {
    const id = 'ann-' + Date.now();
    const newAnn: Announcement = {
      ...data,
      id,
      authorName: currentUser?.name || 'Admin Pusat',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    const next = [newAnn, ...announcements];
    setAnnouncements(next);
    notifySync({ announcements: next });
    addAudit('CREATE_ANNOUNCEMENT', 'announcements', id, `Mengirimkan pengumuman "${data.title}"`);
  };

  const deleteAnnouncement = (id: string) => {
    const next = announcements.filter(a => a.id !== id);
    setAnnouncements(next);
    notifySync({ announcements: next });
    addAudit('DELETE_ANNOUNCEMENT', 'announcements', id, 'Menghapus pengumuman');
  };

  const getParticipantAttendanceStats = (participantId: string) => {
    const partRecords = attendance.filter(a => a.participantId === participantId);
    const attendedSessions = partRecords.filter(a => a.status === 'hadir' || a.status === 'terlambat').length;
    const totalSessions = Math.max(partRecords.length, 8);
    const rate = Math.round((attendedSessions / totalSessions) * 100);
    return {
      totalSessions,
      attendedSessions,
      rate: isNaN(rate) ? 0 : rate,
    };
  };

  const resetAllData = () => {
    setUsers(INITIAL_USERS);
    setShelters(INITIAL_SHELTERS);
    setTeachers(INITIAL_TEACHERS);
    setParticipants(INITIAL_PARTICIPANTS);
    setSchedules(INITIAL_SCHEDULES);
    setAttendance(INITIAL_ATTENDANCE);
    setAssessments(INITIAL_ASSESSMENTS);
    setTasks(INITIAL_TASKS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setDriverUser(null);
    setAdminUser(null);
    setGuruUser(null);
    setRawCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DRIVER_SESSION_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(GURU_SESSION_KEY);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      driverUser,
      adminUser,
      guruUser,
      users,
      shelters,
      teachers,
      participants,
      schedules,
      attendance,
      assessments,
      tasks,
      submissions,
      announcements,
      auditLogs,
      loginDriver,
      loginStaff,
      registerDriver,
      resetPassword,
      logout,
      switchUser,
      quickSwitchRole,
      setCurrentUser,
      addShelter,
      updateShelter,
      deleteShelter,
      addTeacher,
      updateTeacher,
      addParticipant,
      updateParticipant,
      updateParticipantLevel,
      requestShelterTransfer,
      approveShelterTransfer,
      rejectShelterTransfer,
      cancelShelterTransferRequest,
      addSchedule,
      updateSchedule,
      deleteSchedule,
      recordAttendance,
      correctAttendance,
      addAssessment,
      createTask,
      submitTask,
      evaluateSubmission,
      createAnnouncement,
      deleteAnnouncement,
      getParticipantAttendanceStats,
      resetAllData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
