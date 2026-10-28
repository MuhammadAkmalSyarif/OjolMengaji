const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- DATABASE HELPERS ---
const getInitialDB = () => {
    return {
        users: [
            { id: 1, username: 'admin', password: '123', role: 'admin_program', name: 'Ust. H. Ridwan (Manager Pusat)', shelter_id: null },
            { id: 2, username: 'shelter1', password: '123', role: 'admin_shelter', name: 'Budi Santoso (Admin Shelter)', shelter_id: 1 },
            { id: 3, username: 'guru1', password: '123', role: 'guru', name: 'Ust. Ahmad Fauzan', shelter_id: 1 },
            { id: 4, username: 'ojol1', password: '123', role: 'peserta', name: 'Joko Waluyo (Gojek)', shelter_id: 1, level: 1, phone: '0812-3456-7890' },
            { id: 5, username: 'ojol2', password: '123', role: 'peserta', name: 'Rudi Hartono (Grab)', shelter_id: 1, level: 0, phone: '0813-9876-5432' },
            { id: 6, username: 'ojol3', password: '123', role: 'peserta', name: 'Hendra Gunawan (Maxim)', shelter_id: 1, level: 2, phone: '0857-1122-3344' }
        ],
        shelters: [
            { id: 1, name: 'Shelter Sudirman (Posko Ojol)', address: 'Jl. Jend. Sudirman Kav. 45, Jakarta Selatan', lat: -6.200000, lng: 106.816666, radius: 75 },
            { id: 2, name: 'Shelter Kuningan (Kawasan Rasuna)', address: 'Jl. HR Rasuna Said Blok B3, Jakarta Selatan', lat: -6.223400, lng: 106.831200, radius: 75 }
        ],
        sessions: [
            {
                id: 101,
                shelter_id: 1,
                teacher_id: 3,
                teacher_name: 'Ust. Ahmad Fauzan',
                status: 'closed',
                qr_token: 'OM-SDR-7782',
                start_time: '2026-10-27T16:00:00.000Z',
                end_time: '2026-10-27T17:30:00.000Z'
            }
        ],
        attendances: [
            {
                id: 1001,
                session_id: 101,
                user_id: 4,
                user_name: 'Joko Waluyo (Gojek)',
                lat: -6.200020,
                lng: 106.816680,
                distance_meters: 18,
                status: 'valid',
                timestamp: '2026-10-27T16:15:20.000Z'
            },
            {
                id: 1002,
                session_id: 101,
                user_id: 6,
                user_name: 'Hendra Gunawan (Maxim)',
                lat: -6.200040,
                lng: 106.816700,
                distance_meters: 25,
                status: 'valid',
                timestamp: '2026-10-27T16:18:45.000Z'
            }
        ],
        assessments: [
            {
                id: 201,
                student_id: 4,
                teacher_id: 3,
                score_json: { hijaiyah: 2, lancar: 2, makhraj: 2, tajwid: 1 },
                level_assigned: 1,
                notes: 'Alhamdulillah sudah mulai lancar mengenali tanda baca tanwin. Pertahankan latihan mandiri setelah narik ojek.',
                date: '2026-10-27T17:20:00.000Z'
            }
        ]
    };
};

const readDB = () => {
    try {
        if (!fs.existsSync(DB_PATH)) {
            const initial = getInitialDB();
            fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
            return initial;
        }
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading DB:', err);
        return getInitialDB();
    }
};

const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (err) {
        console.error('Error writing DB:', err);
        return false;
    }
};

// --- HAVERSINE GPS CALCULATION (SERVER-SIDE VALIDATION) ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// --- REST API ENDPOINTS ---

// 1. Health check & Server Status
app.get('/api/status', (req, res) => {
    res.json({ status: 'ok', server: 'Ojol Mengaji Localhost API v2.0', time: new Date().toISOString() });
});

// 2. Bootstrap full data for client sync
app.get('/api/bootstrap', (req, res) => {
    const db = readDB();
    res.json({
        success: true,
        data: {
            users: db.users.map(u => ({ id: u.id, username: u.username, role: u.role, name: u.name, shelter_id: u.shelter_id, level: u.level, phone: u.phone })),
            shelters: db.shelters,
            sessions: db.sessions,
            attendances: db.attendances,
            assessments: db.assessments
        }
    });
});

// 3. Auth: Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
    }

    const db = readDB();
    const user = db.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password);

    if (!user) {
        return res.status(401).json({ success: false, message: 'Username atau password tidak sesuai.' });
    }

    const safeUser = {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        shelter_id: user.shelter_id,
        level: user.level,
        phone: user.phone
    };

    res.json({ success: true, user: safeUser, token: 'om_token_' + Date.now() });
});

// 4. Session: Open Sesi Mengaji (Guru)
app.post('/api/sessions/open', (req, res) => {
    const { teacher_id, shelter_id } = req.body;
    const db = readDB();

    const teacher = db.users.find(u => u.id === parseInt(teacher_id) && u.role === 'guru');
    if (!teacher) {
        return res.status(403).json({ success: false, message: 'Hanya Guru yang dapat membuka sesi.' });
    }

    const activeSession = db.sessions.find(s => s.teacher_id === teacher.id && s.status === 'active');
    if (activeSession) {
        return res.status(400).json({ success: false, message: 'Anda sudah memiliki sesi yang sedang aktif!', session: activeSession });
    }

    const qrToken = 'OM-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const newSession = {
        id: Date.now(),
        shelter_id: parseInt(shelter_id) || teacher.shelter_id || 1,
        teacher_id: teacher.id,
        teacher_name: teacher.name,
        status: 'active',
        qr_token: qrToken,
        start_time: new Date().toISOString(),
        end_time: null
    };

    db.sessions.push(newSession);
    writeDB(db);

    console.log(`[SESI BARU] Guru ${teacher.name} membuka sesi dengan Token QR: ${qrToken}`);
    res.json({ success: true, message: 'Sesi mengaji berhasil dibuka.', session: newSession });
});

// 5. Session: Close Sesi Mengaji (Guru)
app.post('/api/sessions/close', (req, res) => {
    const { session_id, teacher_id } = req.body;
    const db = readDB();

    const sessionIdx = db.sessions.findIndex(s => s.id === parseInt(session_id));
    if (sessionIdx === -1) {
        return res.status(404).json({ success: false, message: 'Sesi tidak ditemukan.' });
    }

    db.sessions[sessionIdx].status = 'closed';
    db.sessions[sessionIdx].end_time = new Date().toISOString();
    writeDB(db);

    console.log(`[SESI DITUTUP] Sesi ${session_id} resmi ditutup.`);
    res.json({ success: true, message: 'Sesi mengaji berhasil ditutup.' });
});

// 6. Attendance: Presensi dengan Validasi Server-Side (GPS & QR)
app.post('/api/attendances', (req, res) => {
    const { session_id, user_id, lat, lng, qr_token } = req.body;
    const db = readDB();

    const user = db.users.find(u => u.id === parseInt(user_id));
    if (!user || user.role !== 'peserta') {
        return res.status(403).json({ success: false, message: 'Pengguna bukan peserta binaan yang sah.' });
    }

    const session = db.sessions.find(s => s.id === parseInt(session_id) && s.status === 'active');
    if (!session) {
        return res.status(400).json({ success: false, message: 'Sesi mengaji tidak aktif atau sudah ditutup oleh Guru.' });
    }

    // Validasi Token QR Sesi
    if (!qr_token || session.qr_token.toUpperCase() !== qr_token.trim().toUpperCase()) {
        return res.status(400).json({ success: false, message: 'Kode QR tidak cocok dengan sesi aktif!' });
    }

    // Validasi Anti Presensi Ganda
    const existing = db.attendances.find(a => a.session_id === session.id && a.user_id === user.id);
    if (existing) {
        return res.status(400).json({ success: false, message: 'Anda sudah melakukan presensi pada sesi ini.' });
    }

    // Validasi GPS di Server (Haversine Formula)
    const shelter = db.shelters.find(s => s.id === session.shelter_id) || db.shelters[0];
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    if (isNaN(userLat) || isNaN(userLng)) {
        return res.status(400).json({ success: false, message: 'Koordinat GPS tidak valid.' });
    }

    const distanceMeters = Math.round(calculateDistance(userLat, userLng, shelter.lat, shelter.lng));

    if (distanceMeters > shelter.radius) {
        return res.status(400).json({
            success: false,
            message: `Presensi Ditolak: Anda berada di luar radius shelter! Jarak Anda: ${distanceMeters}m (Radius Maksimal: ${shelter.radius}m).`
        });
    }

    // Presensi Sah
    const newAttendance = {
        id: Date.now(),
        session_id: session.id,
        user_id: user.id,
        user_name: user.name,
        lat: userLat,
        lng: userLng,
        distance_meters: distanceMeters,
        status: 'valid',
        timestamp: new Date().toISOString()
    };

    db.attendances.push(newAttendance);
    writeDB(db);

    console.log(`[PRESENSI SAH] ${user.name} hadir di ${shelter.name} (Jarak GPS: ${distanceMeters}m)`);
    res.json({
        success: true,
        message: `Presensi Berhasil! Terverifikasi berjarak ~${distanceMeters}m dari ${shelter.name}.`,
        attendance: newAttendance
    });
});

// 7. Assessment: Input Nilai & Update Level Santri (Guru)
app.post('/api/assessments', (req, res) => {
    const { student_id, teacher_id, score_json, level_assigned, notes } = req.body;
    const db = readDB();

    const studentIdx = db.users.findIndex(u => u.id === parseInt(student_id));
    if (studentIdx === -1) {
        return res.status(404).json({ success: false, message: 'Santri tidak ditemukan.' });
    }

    const assignedLevelInt = parseInt(level_assigned);
    db.users[studentIdx].level = assignedLevelInt;

    const newAssessment = {
        id: Date.now(),
        student_id: parseInt(student_id),
        teacher_id: parseInt(teacher_id),
        score_json: score_json || { hijaiyah: 2, lancar: 2, makhraj: 2, tajwid: 2 },
        level_assigned: assignedLevelInt,
        notes: notes ? notes.trim() : 'Peserta menunjukkan progres tilawah yang baik.',
        date: new Date().toISOString()
    };

    db.assessments.push(newAssessment);
    writeDB(db);

    console.log(`[ASESMEN BARU] Santri ${db.users[studentIdx].name} diperbarui ke Level ${assignedLevelInt}`);
    res.json({
        success: true,
        message: `Asesmen berhasil disimpan. Level ${db.users[studentIdx].name} kini Level ${assignedLevelInt}!`,
        assessment: newAssessment,
        updatedUser: db.users[studentIdx]
    });
});

// 8. Admin: Reset DB ke Data Standar
app.post('/api/admin/reset', (req, res) => {
    const initial = getInitialDB();
    writeDB(initial);
    console.log('[RESET DB] Database telah di-reset ke data default.');
    res.json({ success: true, message: 'Database server berhasil di-reset ke nilai default.' });
});

// --- SERVE STATIC FILES (FRONTEND PWA) ---
app.use(express.static(path.join(__dirname)));

// Fallback all other routes to index.html for SPA
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- START SERVER ---
app.listen(PORT, '0.0.0.0', () => {
    // Cari IP Lokal
    const networkInterfaces = os.networkInterfaces();
    let localIp = '127.0.0.1';

    for (const name of Object.keys(networkInterfaces)) {
        for (const net of networkInterfaces[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                localIp = net.address;
                break;
            }
        }
    }

    console.log('================================================================');
    console.log('🕌  SERVER BACKEND & PWA "OJOL MENGAJI" TELAH AKTIF DI LOCALHOST');
    console.log('================================================================');
    console.log(`🌐  Akses di Komputer Ini : http://localhost:${PORT}`);
    console.log(`📱  Akses di Smartphone HP: http://${localIp}:${PORT}`);
    console.log('    (Pastikan HP dan Komputer terhubung ke Wi-Fi yang sama)');
    console.log('💾  Database Server: database.json (Realtime Persisten)');
    console.log('🛰️  GPS & QR Engine: Validasi Sisi Server (Haversine Formula)');
    console.log('================================================================\n');
});
