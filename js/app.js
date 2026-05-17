const App = {
    container: document.getElementById('app'),
    currentUser: null,

    init: () => {
        App.applyDarkMode();
        setTimeout(() => {
            const loader = document.getElementById('global-loader');
            if (loader) loader.classList.add('hidden');
            App.currentUser = Auth.getCurrentUser();
            App.render();
        }, 2000);
    },

    render: () => {
        if (!App.currentUser) {
            App.renderAuthPortal();
        } else {
            App.renderDashboard();
        }
    },

    applyDarkMode: () => {
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }
    },

    toggleDarkMode: () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        const icon = document.getElementById('dark-mode-icon');
        if (icon) {
            icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon';
        }
    },

    showToast: (message, type = 'success') => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        let icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        else if (type === 'warning') icon = 'fa-exclamation-triangle';
        toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => { if (container.contains(toast)) toast.remove(); }, 3500);
    },

    renderAuthPortal: () => {
        App.container.innerHTML = `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <h2><i class="fas fa-graduation-cap text-gold"></i> PakAdmissions</h2>
                        <p>College Admission System</p>
                    </div>
                    <div class="auth-body">
                        <div class="role-selector">
                            <button class="role-btn active" id="btn-role-student" onclick="App.setAuthRole('student')">
                                <i class="fas fa-user-graduate mb-1"></i><br>Student
                            </button>
                            <button class="role-btn" id="btn-role-college" onclick="App.setAuthRole('college')">
                                <i class="fas fa-university mb-1"></i><br>College
                            </button>
                        </div>
                        <div id="auth-form-container"></div>
                    </div>
                </div>
            </div>
        `;
        App.renderLoginForm('student');
    },

    currentAuthRole: 'student',

    setAuthRole: (role) => {
        App.currentAuthRole = role;
        document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`btn-role-${role}`).classList.add('active');
        App.renderLoginForm(role);
    },

    renderLoginForm: (role) => {
        const container = document.getElementById('auth-form-container');
        container.innerHTML = `
            <form id="login-form" onsubmit="App.handleLogin(event)">
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" id="login-email" class="form-control" required placeholder="Enter ${role === 'student' ? 'student' : 'college'} email"
                        value="${role === 'student' ? 'ali@example.com' : 'admissions@nust.edu.pk'}">
                </div>
                <div class="form-group">
                    <label class="form-label">Password ${role === 'college' ? '(AdminID)' : ''}</label>
                    <input type="password" id="login-password" class="form-control" required placeholder="Enter password"
                        value="${role === 'student' ? 'password123' : 'college1'}">
                </div>
                <button type="submit" class="btn btn-primary btn-block mb-3">Login as ${role.charAt(0).toUpperCase() + role.slice(1)}</button>
                ${role === 'student' ? 
                    `<p class="text-center text-muted">Don't have an account? <a href="#" onclick="App.renderRegisterForm()">Register here</a></p>` : 
                    `<p class="text-center text-muted">Want to list your college? <a href="#" onclick="App.renderCollegeRegisterForm()">Register here</a></p>`
                }
            </form>
        `;
    },

    renderCollegeRegisterForm: () => {
        const container = document.getElementById('auth-form-container');
        container.innerHTML = `
            <form id="register-college-form" onsubmit="App.handleCollegeRegister(event)">
                <div class="form-group">
                    <label class="form-label">College Name</label>
                    <input type="text" id="reg-col-name" class="form-control" required placeholder="e.g. Govt College">
                </div>
                <div class="form-group">
                    <label class="form-label">Contact Email</label>
                    <input type="email" id="reg-col-email" class="form-control" required>
                </div>
                <div class="grid-2" style="gap: 1rem; margin-bottom: 0;">
                    <div class="form-group">
                        <label class="form-label">City</label>
                        <input type="text" id="reg-col-city" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Type</label>
                        <select id="reg-col-type" class="form-control" required>
                            <option value="Public">Public</option>
                            <option value="Private">Private</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Admin ID (Password)</label>
                    <input type="password" id="reg-col-password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary btn-block mb-3">Register College</button>
                <p class="text-center text-muted">Already registered? <a href="#" onclick="App.renderLoginForm('college')">Login</a></p>
            </form>
        `;
    },

    renderRegisterForm: () => {
        const container = document.getElementById('auth-form-container');
        container.innerHTML = `
            <form id="register-form" onsubmit="App.handleRegister(event)">
                <div class="form-group">
                    <label class="form-label">Full Name</label>
                    <input type="text" id="reg-name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" id="reg-email" class="form-control" required>
                </div>
                <div class="grid-2" style="gap: 1rem; margin-bottom: 0;">
                    <div class="form-group">
                        <label class="form-label">CNIC</label>
                        <input type="text" id="reg-cnic" class="form-control" required placeholder="12345-1234567-1">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Phone</label>
                        <input type="text" id="reg-phone" class="form-control" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">City</label>
                    <input type="text" id="reg-city" class="form-control" required>
                </div>
                <div class="grid-2" style="gap: 1rem; margin-bottom: 0;">
                    <div class="form-group">
                        <label class="form-label">Matric Marks <small class="text-muted">(out of 1100)</small></label>
                        <input type="number" id="reg-matric" class="form-control" placeholder="e.g. 950" min="0" max="1100">
                    </div>
                    <div class="form-group">
                        <label class="form-label">FSc Marks <small class="text-muted">(out of 1100)</small></label>
                        <input type="number" id="reg-fsc" class="form-control" placeholder="e.g. 920" min="0" max="1100">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" id="reg-password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-gold btn-block mb-3">Register Student</button>
                <p class="text-center text-muted">Already have an account? <a href="#" onclick="App.renderLoginForm('student')">Login</a></p>
            </form>
        `;
    },

    handleLogin: (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        const result = Auth.login(email, pass, App.currentAuthRole);
        if (result.success) {
            App.showToast('Login successful!');
            App.currentUser = result.user;
            App.render();
        } else {
            App.showToast(result.message, 'error');
        }
    },

    handleRegister: (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('reg-name').value,
            email: document.getElementById('reg-email').value,
            cnic: document.getElementById('reg-cnic').value,
            phone: document.getElementById('reg-phone').value,
            city: document.getElementById('reg-city').value,
            password: document.getElementById('reg-password').value,
            matricMarks: document.getElementById('reg-matric').value,
            fscMarks: document.getElementById('reg-fsc').value,
        };
        const result = Auth.registerStudent(data);
        if (result.success) {
            App.showToast('Registration successful! Please login.');
            App.renderLoginForm('student');
        } else {
            App.showToast(result.message, 'error');
        }
    },

    handleCollegeRegister: (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('reg-col-name').value,
            email: document.getElementById('reg-col-email').value,
            city: document.getElementById('reg-col-city').value,
            type: document.getElementById('reg-col-type').value,
            password: document.getElementById('reg-col-password').value,
        };
        const result = Auth.registerCollege(data);
        if (result.success) {
            App.showToast('College Registered successfully! Please login.');
            App.renderLoginForm('college');
        } else {
            App.showToast(result.message, 'error');
        }
    },

    renderDashboard: () => {
        const isStudent = App.currentUser.role === 'student';
        const unreadCount = NotificationService.getUnreadCount(App.currentUser.StudentID || App.currentUser.CollegeID);
        const isDark = document.body.classList.contains('dark-mode');

        App.container.innerHTML = `
            <div class="dashboard-layout">
                <nav class="sidebar" id="sidebar">
                    <div class="sidebar-brand">
                        <i class="fas fa-graduation-cap"></i> PakAdmissions
                    </div>
                    <ul class="sidebar-nav">
                        ${isStudent ? StudentModule.getNav() : CollegeModule.getNav()}
                    </ul>
                    <div class="sidebar-footer">
                        <button class="btn btn-outline btn-block text-white" onclick="Auth.logout()" style="border-color: rgba(255,255,255,0.2)">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </nav>

                <main class="main-content">
                    <header class="topbar">
                        <button class="mobile-nav-toggle" onclick="document.getElementById('sidebar').classList.toggle('show')">
                            <i class="fas fa-bars"></i>
                        </button>
                        <div>
                            <h3 id="page-title" style="margin: 0;">Dashboard</h3>
                        </div>
                        <div style="display:flex; align-items:center; gap:1rem;">
                            <button class="icon-btn" onclick="App.toggleDarkMode()" title="Toggle Dark Mode">
                                <i class="fas ${isDark ? 'fa-sun' : 'fa-moon'}" id="dark-mode-icon"></i>
                            </button>
                            <div class="notif-wrapper" id="notif-wrapper">
                                <button class="icon-btn" onclick="App.toggleNotifications()" title="Notifications">
                                    <i class="fas fa-bell"></i>
                                    ${unreadCount > 0 ? `<span class="notif-badge">${unreadCount}</span>` : ''}
                                </button>
                                <div class="notif-dropdown" id="notif-dropdown" style="display:none;"></div>
                            </div>
                            <div class="user-profile">
                                <span class="d-none d-md-inline">${App.currentUser.Name}</span>
                                <div class="user-avatar">${App.currentUser.Name.charAt(0)}</div>
                            </div>
                        </div>
                    </header>

                    <div id="main-view"></div>
                </main>
            </div>
        `;

        if (isStudent) StudentModule.init();
        else CollegeModule.init();
    },

    toggleNotifications: () => {
        const dropdown = document.getElementById('notif-dropdown');
        if (!dropdown) return;
        const isVisible = dropdown.style.display !== 'none';
        dropdown.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) App.renderNotifDropdown();
    },

    renderNotifDropdown: () => {
        const dropdown = document.getElementById('notif-dropdown');
        if (!dropdown) return;
        const userId = App.currentUser.StudentID || App.currentUser.CollegeID;
        const notifs = NotificationService.getForUser(userId);

        if (notifs.length === 0) {
            dropdown.innerHTML = `<div class="notif-empty"><i class="fas fa-bell-slash"></i><p>No notifications</p></div>`;
        } else {
            dropdown.innerHTML = `
                <div class="notif-header">
                    <span>Notifications</span>
                    <button onclick="App.markAllRead()" class="notif-clear-btn">Mark all read</button>
                </div>
                <div class="notif-list">
                    ${notifs.slice(0, 8).map(n => `
                        <div class="notif-item ${n.Read ? 'read' : 'unread'}" onclick="App.markRead('${n.NotifID}')">
                            <div class="notif-icon notif-icon-${n.Type}"><i class="fas ${n.Icon}"></i></div>
                            <div class="notif-body">
                                <p>${n.Message}</p>
                                <small>${new Date(n.CreatedAt).toLocaleString()}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    },

    markRead: (notifId) => {
        NotificationService.markRead(notifId);
        App.renderNotifDropdown();
        const userId = App.currentUser.StudentID || App.currentUser.CollegeID;
        const count = NotificationService.getUnreadCount(userId);
        const badge = document.querySelector('.notif-badge');
        if (badge) { badge.textContent = count; if (count === 0) badge.remove(); }
    },

    markAllRead: () => {
        const userId = App.currentUser.StudentID || App.currentUser.CollegeID;
        NotificationService.markAllRead(userId);
        App.renderNotifDropdown();
        const badge = document.querySelector('.notif-badge');
        if (badge) badge.remove();
    },

    navigate: (viewId, title) => {
        document.getElementById('page-title').innerText = title;
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        const activeLink = document.getElementById(`nav-${viewId}`);
        if (activeLink) activeLink.classList.add('active');
        document.getElementById('sidebar').classList.remove('show');
        const dropdown = document.getElementById('notif-dropdown');
        if (dropdown) dropdown.style.display = 'none';
    }
};

document.addEventListener('click', (e) => {
    const wrapper = document.getElementById('notif-wrapper');
    const dropdown = document.getElementById('notif-dropdown');
    if (wrapper && dropdown && !wrapper.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

window.onload = App.init;
