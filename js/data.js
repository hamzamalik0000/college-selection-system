const DB_KEY = 'pakEduDB';

const defaultData = {
    Colleges: [
        {
            CollegeID: 'C001',
            Name: 'NUST (National University of Sciences & Technology)',
            Type: 'Public',
            City: 'Islamabad',
            Programs: ['Computer Science', 'Software Engineering', 'Electrical Engineering'],
            Seats: 300,
            Fee: 150000,
            Deadline: '2026-08-01',
            ContactEmail: 'admissions@nust.edu.pk',
            Logo: 'fa-university',
            AdminID: 'college1',
            MeritCutoff: 80,
            Description: 'NUST is one of Pakistan\'s leading research universities with world-class faculty and state-of-the-art facilities.',
            Images: [],
            Announcements: []
        },
        {
            CollegeID: 'C002',
            Name: 'KEMU (King Edward Medical University)',
            Type: 'Public',
            City: 'Lahore',
            Programs: ['MBBS', 'BDS', 'Nursing'],
            Seats: 150,
            Fee: 50000,
            Deadline: '2026-07-15',
            ContactEmail: 'info@kemu.edu.pk',
            Logo: 'fa-hospital',
            AdminID: 'college2',
            MeritCutoff: 88,
            Description: 'KEMU is among the most prestigious medical universities in Pakistan, producing top-tier medical professionals.',
            Images: [],
            Announcements: []
        },
        {
            CollegeID: 'C003',
            Name: 'LUMS (Lahore University of Management Sciences)',
            Type: 'Private',
            City: 'Lahore',
            Programs: ['Computer Science', 'Accounting & Finance', 'Management Sciences'],
            Seats: 250,
            Fee: 600000,
            Deadline: '2026-09-01',
            ContactEmail: 'admissions@lums.edu.pk',
            Logo: 'fa-building',
            AdminID: 'college3',
            MeritCutoff: 75,
            Description: 'LUMS is a world-renowned private university known for excellence in business, law, and computer science education.',
            Images: [],
            Announcements: []
        }
    ],

    Students: [
        {
            StudentID: 'S001',
            Name: 'Ali Khan',
            Email: 'ali@example.com',
            CNIC: '35202-1234567-1',
            Phone: '0300-1234567',
            City: 'Lahore',
            Password: 'password123',
            MatricMarks: 950,
            MatricTotal: 1100,
            FscMarks: 920,
            FscTotal: 1100,
            SavedColleges: []
        }
    ],

    Applications: [],

    TestQuestions: [
        {
            QuestionID: 'Q001',
            CollegeID: 'C001',
            QuestionText: 'Which of the following is a programming language?',
            OptionA: 'HTML',
            OptionB: 'Python',
            OptionC: 'CSS',
            OptionD: 'HTTP',
            CorrectAnswer: 'B'
        },
        {
            QuestionID: 'Q002',
            CollegeID: 'C001',
            QuestionText: 'What is the capital of Pakistan?',
            OptionA: 'Lahore',
            OptionB: 'Karachi',
            OptionC: 'Islamabad',
            OptionD: 'Peshawar',
            CorrectAnswer: 'C'
        },
        {
            QuestionID: 'Q003',
            CollegeID: 'C001',
            QuestionText: 'What does OOP stand for?',
            OptionA: 'Object Oriented Programming',
            OptionB: 'Online Open Programming',
            OptionC: 'Only Output Process',
            OptionD: 'Optical Output Path',
            CorrectAnswer: 'A'
        }
    ],

    TestResults: [],
    Notifications: [],
    Messages: [],
    Announcements: []
};

function initDB() {
    if (!localStorage.getItem(DB_KEY)) {
        localStorage.setItem(DB_KEY, JSON.stringify(defaultData));
    } else {
        // Migrate existing data to add new fields
        const db = getDB();
        let changed = false;
        db.Colleges = db.Colleges.map(c => {
            if (c.MeritCutoff === undefined) { c.MeritCutoff = 75; changed = true; }
            if (c.Description === undefined) { c.Description = ''; changed = true; }
            if (c.Announcements === undefined) { c.Announcements = []; changed = true; }
            return c;
        });
        db.Students = db.Students.map(s => {
            if (s.MatricMarks === undefined) { s.MatricMarks = 0; changed = true; }
            if (s.MatricTotal === undefined) { s.MatricTotal = 1100; changed = true; }
            if (s.FscMarks === undefined) { s.FscMarks = 0; changed = true; }
            if (s.FscTotal === undefined) { s.FscTotal = 1100; changed = true; }
            if (s.SavedColleges === undefined) { s.SavedColleges = []; changed = true; }
            return s;
        });
        if (!db.Notifications) { db.Notifications = []; changed = true; }
        if (!db.Messages) { db.Messages = []; changed = true; }
        if (!db.Announcements) { db.Announcements = []; changed = true; }
        if (changed) saveDB(db);
    }
}

function getDB() {
    return JSON.parse(localStorage.getItem(DB_KEY));
}

function saveDB(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
}

const DB = {
    get: (sheetName) => {
        const db = getDB();
        return db[sheetName] || [];
    },
    insert: (sheetName, record) => {
        const db = getDB();
        if (!db[sheetName]) db[sheetName] = [];
        db[sheetName].push(record);
        saveDB(db);
        return record;
    },
    update: (sheetName, matchFn, updateData) => {
        const db = getDB();
        if (!db[sheetName]) return false;
        let updated = false;
        db[sheetName] = db[sheetName].map(row => {
            if (matchFn(row)) {
                updated = true;
                return { ...row, ...updateData };
            }
            return row;
        });
        saveDB(db);
        return updated;
    },
    delete: (sheetName, matchFn) => {
        const db = getDB();
        if (!db[sheetName]) return false;
        db[sheetName] = db[sheetName].filter(row => !matchFn(row));
        saveDB(db);
        return true;
    },
    generateId: (prefix) => {
        return prefix + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    }
};

const NotificationService = {
    add: (userId, userRole, message, type = 'info', icon = 'fa-bell') => {
        DB.insert('Notifications', {
            NotifID: DB.generateId('N'),
            UserId: userId,
            UserRole: userRole,
            Message: message,
            Type: type,
            Icon: icon,
            Read: false,
            CreatedAt: new Date().toISOString()
        });
    },
    getForUser: (userId) => {
        return DB.get('Notifications').filter(n => n.UserId === userId).sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
    },
    markRead: (notifId) => {
        DB.update('Notifications', n => n.NotifID === notifId, { Read: true });
    },
    markAllRead: (userId) => {
        const db = getDB();
        db.Notifications = db.Notifications.map(n => n.UserId === userId ? { ...n, Read: true } : n);
        saveDB(db);
    },
    getUnreadCount: (userId) => {
        return DB.get('Notifications').filter(n => n.UserId === userId && !n.Read).length;
    }
};

const MeritCalculator = {
    calculate: (matricMarks, matricTotal, fscMarks, fscTotal) => {
        const matricPct = (matricMarks / matricTotal) * 100;
        const fscPct = (fscMarks / fscTotal) * 100;
        return Math.round((matricPct * 0.40) + (fscPct * 0.60));
    },
    isEligible: (merit, cutoff) => {
        return merit >= cutoff;
    }
};

initDB();
