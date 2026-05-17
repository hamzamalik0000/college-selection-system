const Auth = {
    getCurrentUser: () => {
        const user = localStorage.getItem('pakEduUser');
        return user ? JSON.parse(user) : null;
    },

    login: (email, password, role) => {
        if (role === 'student') {
            const student = DB.get('Students').find(s => s.Email === email && s.Password === password);
            if (student) {
                const session = { ...student, role: 'student' };
                localStorage.setItem('pakEduUser', JSON.stringify(session));
                return { success: true, user: session };
            }
        } else if (role === 'college') {
            const college = DB.get('Colleges').find(c => c.ContactEmail === email && c.AdminID === password);
            if (college) {
                const session = { ...college, role: 'college' };
                localStorage.setItem('pakEduUser', JSON.stringify(session));
                return { success: true, user: session };
            }
        }
        return { success: false, message: 'Invalid credentials or role mismatch.' };
    },

    registerStudent: (data) => {
        const existing = DB.get('Students').find(s => s.Email === data.email);
        if (existing) {
            return { success: false, message: 'Email already registered.' };
        }

        const newStudent = {
            StudentID: DB.generateId('S'),
            Name: data.name,
            Email: data.email,
            CNIC: data.cnic,
            Phone: data.phone,
            City: data.city,
            Password: data.password,
            MatricMarks: parseInt(data.matricMarks) || 0,
            MatricTotal: 1100,
            FscMarks: parseInt(data.fscMarks) || 0,
            FscTotal: 1100,
            SavedColleges: []
        };

        DB.insert('Students', newStudent);
        NotificationService.add(newStudent.StudentID, 'student', 'Welcome to PakAdmissions! Start exploring colleges.', 'success', 'fa-graduation-cap');
        return { success: true };
    },

    registerCollege: (data) => {
        const existing = DB.get('Colleges').find(c => c.ContactEmail === data.email);
        if (existing) {
            return { success: false, message: 'Email already registered.' };
        }

        const newCollege = {
            CollegeID: DB.generateId('C'),
            Name: data.name,
            City: data.city,
            Type: data.type,
            AdminID: data.password,
            ContactEmail: data.email,
            Seats: 100,
            Fee: 50000,
            Deadline: '2026-12-31',
            MeritCutoff: 50,
            Programs: ['FSc Pre-Medical', 'FSc Pre-Engineering', 'ICS', 'ICOM'],
            Description: 'Welcome to our college.',
            Logo: 'fa-university',
            Images: [],
            Announcements: []
        };

        DB.insert('Colleges', newCollege);
        return { success: true };
    },

    logout: () => {
        localStorage.removeItem('pakEduUser');
        window.location.reload();
    }
};
