'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  UserRole,
  Shelter, 
  Teacher, 
  Participant, 
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
  registerDriver: (data: RegisterDriverData) => { success: boolean; message: string; user?: User };
  logout: () => void;
  switchUser: (userId: string) => void;
  quickSwitchRole: (role: UserRole) => void;
  
  // Shelters
  addShelter: (shelter: Omit<Shelter, 'id'>) => void;
  updateShelter: (shelter: Shelter) => void;
  deleteShelter: (id: string) => void;
  
  // Teachers
  addTeacher: (teacher: Omit<Teacher, 'id' | 'userId' | 'email'>, email: string) => void;
  updateTeacher: (teacher: Teacher) => void;
  
  // Participants
  addParticipant: (participant: Omit<Participant, 'id' | 'userId' | 'email'>, email: string) => void;
  updateParticipant: (participant: Participant) => void;
  
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

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'ojol_mengaji_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  // Default currentUser to null so users start with the Driver Registration & Login screen
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.currentUser !== undefined) setCurrentUser(parsed.currentUser);
        if (parsed.shelters) setShelters(parsed.shelters);
        if (parsed.teachers) setTeachers(parsed.teachers);
        if (parsed.participants) setParticipants(parsed.participants);
        if (parsed.schedules) setSchedules(parsed.schedules);
        if (parsed.attendance) setAttendance(parsed.attendance);
        if (parsed.assessments) setAssessments(parsed.assessments);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.submissions) setSubmissions(parsed.submissions);
        if (parsed.announcements) setAnnouncements(parsed.announcements);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
      }
    } catch (e) {
      console.warn('Could not read saved data from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const stateToSave = {
        users,
        currentUser,
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
    currentUser,
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

  const loginDriver = (identifier: string, password?: string): { success: boolean; message: string; user?: User } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/[\s-]/g, '');

    const found = users.find(u => 
      u.role === 'ojol' && (
        u.email.toLowerCase() === cleanId ||
        u.phone.replace(/[\s-]/g, '') === cleanPhone ||
        u.name.toLowerCase() === cleanId
      )
    );

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

    setCurrentUser(found);
    addAudit('LOGIN_DRIVER', 'users', found.id, `Driver ${found.name} berhasil masuk ke dashboard`);
    return {
      success: true,
      message: `Alhamdulillah! Selamat datang kembali, ${found.name}.`,
      user: found
    };
  };

  const registerDriver = (data: RegisterDriverData): { success: boolean; message: string; user?: User } => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone.replace(/[\s-]/g, '');

    // Check if phone or email already registered
    const exists = users.find(u => 
      (cleanEmail && u.email.toLowerCase() === cleanEmail) ||
      (cleanPhone && u.phone.replace(/[\s-]/g, '') === cleanPhone)
    );

    if (exists) {
      return {
        success: false,
        message: `Nomor WhatsApp atau Email sudah terdaftar atas nama ${exists.name}. Silakan langsung masuk.`
      };
    }

    const userId = 'user-ojol-' + Date.now();
    const partId = 'part-' + Date.now();
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`;

    const newUser: User = {
      id: userId,
      name: data.name.trim(),
      email: cleanEmail || `${cleanPhone}@ojolmengaji.id`,
      phone: data.phone.trim(),
      role: 'ojol',
      avatar: avatarUrl,
      password: data.password || '123',
      isActive: true,
    };

    const newParticipant: Participant = {
      id: partId,
      userId,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: cleanEmail || `${cleanPhone}@ojolmengaji.id`,
      avatar: avatarUrl,
      ojolPlatform: data.ojolPlatform,
      vehiclePlate: data.vehiclePlate.trim().toUpperCase(),
      shelterId: data.shelterId,
      currentLevel: data.currentLevel,
      joinedDate: new Date().toISOString().split('T')[0],
      isActive: true,
    };

    setUsers(prev => [...prev, newUser]);
    setParticipants(prev => [...prev, newParticipant]);
    setCurrentUser(newUser);

    const shelterName = shelters.find(s => s.id === data.shelterId)?.name || 'Shelter Mengaji';
    addAudit('REGISTER_DRIVER', 'participants', partId, `Pendaftaran driver baru "${data.name}" (${data.ojolPlatform} - ${data.vehiclePlate}) di ${shelterName}`);

    return {
      success: true,
      message: `Alhamdulillah! Pendaftaran berhasil. Selamat datang di Ojol Mengaji, Akhina ${data.name}.`,
      user: newUser
    };
  };

  const logout = () => {
    if (currentUser) {
      addAudit('LOGOUT_DRIVER', 'users', currentUser.id, `Driver ${currentUser.name} keluar dari akun`);
    }
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const quickSwitchRole = (role: UserRole) => {
    const firstUserWithRole = users.find(u => u.role === role);
    if (firstUserWithRole) {
      setCurrentUser(firstUserWithRole);
    }
  };

  // Shelters
  const addShelter = (newShelterData: Omit<Shelter, 'id'>) => {
    const id = 'shelter-' + Date.now();
    const shelter: Shelter = { ...newShelterData, id };
    setShelters(prev => [...prev, shelter]);
    addAudit('CREATE_SHELTER', 'shelters', id, `Menambahkan shelter baru "${shelter.name}"`);
  };

  const updateShelter = (updated: Shelter) => {
    setShelters(prev => prev.map(s => s.id === updated.id ? updated : s));
    addAudit('UPDATE_SHELTER', 'shelters', updated.id, `Memperbarui data shelter "${updated.name}"`);
  };

  const deleteShelter = (id: string) => {
    const name = shelters.find(s => s.id === id)?.name || id;
    setShelters(prev => prev.filter(s => s.id !== id));
    addAudit('DELETE_SHELTER', 'shelters', id, `Menghapus shelter "${name}"`);
  };

  // Teachers
  const addTeacher = (data: Omit<Teacher, 'id' | 'userId' | 'email'>, email: string) => {
    const userId = 'user-guru-' + Date.now();
    const teacherId = 'teacher-' + Date.now();

    const newUser: User = {
      id: userId,
      name: data.name,
      email: email,
      role: 'guru',
      avatar: data.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone: data.phone,
      isActive: true,
    };

    const newTeacher: Teacher = {
      ...data,
      id: teacherId,
      userId,
      email,
    };

    setUsers(prev => [...prev, newUser]);
    setTeachers(prev => [...prev, newTeacher]);
    addAudit('CREATE_TEACHER', 'teachers', teacherId, `Mendaftarkan guru "${data.name}"`);
  };

  const updateTeacher = (updated: Teacher) => {
    setTeachers(prev => prev.map(t => t.id === updated.id ? updated : t));
    setUsers(prev => prev.map(u => u.id === updated.userId ? { ...u, name: updated.name, phone: updated.phone } : u));
    addAudit('UPDATE_TEACHER', 'teachers', updated.id, `Memperbarui profil guru "${updated.name}"`);
  };

  // Participants
  const addParticipant = (data: Omit<Participant, 'id' | 'userId' | 'email'>, email: string) => {
    const userId = 'user-ojol-' + Date.now();
    const partId = 'part-' + Date.now();

    const newUser: User = {
      id: userId,
      name: data.name,
      email: email,
      role: 'ojol',
      avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      phone: data.phone,
      isActive: true,
    };

    const newPart: Participant = {
      ...data,
      id: partId,
      userId,
      email,
    };

    setUsers(prev => [...prev, newUser]);
    setParticipants(prev => [...prev, newPart]);
    addAudit('CREATE_PARTICIPANT', 'participants', partId, `Mendaftarkan peserta ojol "${data.name}" (${data.ojolPlatform})`);
  };

  const updateParticipant = (updated: Participant) => {
    setParticipants(prev => prev.map(p => p.id === updated.id ? updated : p));
    setUsers(prev => prev.map(u => u.id === updated.userId ? { ...u, name: updated.name, phone: updated.phone } : u));
    addAudit('UPDATE_PARTICIPANT', 'participants', updated.id, `Memperbarui data peserta ojol "${updated.name}"`);
  };

  // Schedules
  const addSchedule = (data: Omit<Schedule, 'id'>) => {
    const id = 'sched-' + Date.now();
    const newSchedule: Schedule = { ...data, id };
    setSchedules(prev => [...prev, newSchedule]);
    addAudit('CREATE_SCHEDULE', 'schedules', id, `Menambahkan jadwal mengaji di hari ${data.dayName}`);
  };

  const updateSchedule = (updated: Schedule) => {
    setSchedules(prev => prev.map(s => s.id === updated.id ? updated : s));
    addAudit('UPDATE_SCHEDULE', 'schedules', updated.id, `Memperbarui jadwal mengaji "${updated.topic}"`);
  };

  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    addAudit('DELETE_SCHEDULE', 'schedules', id, `Menghapus jadwal mengaji`);
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
    // Check if participant already has attendance today for this shelter
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

    setAttendance(prev => [newRecord, ...prev]);
    const part = participants.find(p => p.id === participantId);
    addAudit('RECORD_ATTENDANCE', 'attendance_records', newRecord.id, `Presensi ${part?.name || participantId} status ${status} via ${method}`);
    return { success: true, message: 'Presensi berhasil dicatat!' };
  };

  const correctAttendance = (recordId: string, newStatus: AttendanceStatus, reason: string) => {
    setAttendance(prev => prev.map(a => {
      if (a.id === recordId) {
        return {
          ...a,
          status: newStatus,
          notes: (a.notes ? a.notes + ' | ' : '') + `Koreksi status oleh ${currentUser?.name || 'Admin'}: ${newStatus} (Alasan: ${reason})`
        };
      }
      return a;
    }));
    addAudit('CORRECT_ATTENDANCE', 'attendance_records', recordId, `Koreksi presensi menjadi "${newStatus}". Alasan: ${reason}`);
  };

  // Reading Assessment
  const addAssessment = (data: Omit<ReadingAssessment, 'id'>) => {
    const id = 'eval-' + Date.now();
    const newAssessment: ReadingAssessment = { ...data, id };
    setAssessments(prev => [newAssessment, ...prev]);
    const p = participants.find(part => part.id === data.participantId);
    addAudit('ADD_ASSESSMENT', 'reading_assessments', id, `Evaluasi membaca untuk ${p?.name || data.participantId} (${data.material})`);
  };

  // Tasks
  const createTask = (data: Omit<Task, 'id' | 'createdDate'>) => {
    const id = 'task-' + Date.now();
    const newTask: Task = {
      ...data,
      id,
      createdDate: new Date().toISOString().substring(0, 10),
    };
    setTasks(prev => [newTask, ...prev]);
    addAudit('CREATE_TASK', 'tasks', id, `Membuat tugas mengaji "${data.title}"`);
  };

  const submitTask = (taskId: string, participantId: string, notes: string, audioName?: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // Check if submission exists
    const existing = submissions.find(s => s.taskId === taskId && s.participantId === participantId);
    if (existing) {
      setSubmissions(prev => prev.map(s => s.id === existing.id ? {
        ...s,
        status: 'menunggu_pemeriksaan',
        submittedAt: now,
        submissionNotes: notes,
        audioFileName: audioName || s.audioFileName,
      } : s));
    } else {
      const newSub: TaskSubmission = {
        id: 'sub-' + Date.now(),
        taskId,
        participantId,
        status: 'menunggu_pemeriksaan',
        submittedAt: now,
        submissionNotes: notes,
        audioFileName: audioName,
        audioDurationSeconds: 65,
      };
      setSubmissions(prev => [newSub, ...prev]);
    }

    const t = tasks.find(tk => tk.id === taskId);
    addAudit('SUBMIT_TASK', 'task_submissions', taskId, `Peserta mengirimkan tugas "${t?.title}"`);
  };

  const evaluateSubmission = (submissionId: string, status: TaskStatus, score: number, feedback: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setSubmissions(prev => prev.map(s => s.id === submissionId ? {
      ...s,
      status,
      score,
      teacherFeedback: feedback,
      evaluatedAt: now,
    } : s));
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
    setAnnouncements(prev => [newAnn, ...prev]);
    addAudit('CREATE_ANNOUNCEMENT', 'announcements', id, `Mengirimkan pengumuman "${data.title}"`);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    addAudit('DELETE_ANNOUNCEMENT', 'announcements', id, 'Menghapus pengumuman');
  };

  // Formula Requirement:
  // Persentase kehadiran = (Jumlah sesi hadir / Jumlah sesi wajib yang telah berlangsung) * 100%
  const getParticipantAttendanceStats = (participantId: string) => {
    const partRecords = attendance.filter(a => a.participantId === participantId);
    // Sesi wajib yang telah berlangsung untuk peserta ini
    const attendedSessions = partRecords.filter(a => a.status === 'hadir' || a.status === 'terlambat').length;
    // Default total sesi terdaftar (minimal 8 sesi sebagai acuan periode atau actual records count)
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
    setCurrentUser(INITIAL_USERS[0]);
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
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
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
      registerDriver,
      logout,
      switchUser,
      quickSwitchRole,
      addShelter,
      updateShelter,
      deleteShelter,
      addTeacher,
      updateTeacher,
      addParticipant,
      updateParticipant,
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
