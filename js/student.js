const StudentModule = {
    getNav: () => `
        <li class="nav-item"><a href="#" class="nav-link" id="nav-home" onclick="StudentModule.renderHome()"><i class="fas fa-home"></i> Dashboard</a></li>
        <li class="nav-item"><a href="#" class="nav-link" id="nav-colleges" onclick="StudentModule.renderColleges()"><i class="fas fa-university"></i> Browse Colleges</a></li>
        <li class="nav-item"><a href="#" class="nav-link" id="nav-saved" onclick="StudentModule.renderSavedColleges()"><i class="fas fa-heart"></i> Saved Colleges</a></li>
        <li class="nav-item"><a href="#" class="nav-link" id="nav-applications" onclick="StudentModule.renderApplications()"><i class="fas fa-file-alt"></i> My Applications</a></li>
        <li class="nav-item"><a href="#" class="nav-link" id="nav-inbox" onclick="StudentModule.renderInbox()"><i class="fas fa-envelope"></i> Inbox</a></li>
        <li class="nav-item"><a href="#" class="nav-link" id="nav-profile" onclick="StudentModule.renderProfile()"><i class="fas fa-user"></i> My Profile</a></li>
    `,

    init: () => { StudentModule.renderHome(); },

    renderHome: () => {
        App.navigate('home', 'Student Dashboard');
        const view = document.getElementById('main-view');
        const apps = DB.get('Applications').filter(a => a.StudentID === App.currentUser.StudentID);
        const results = DB.get('TestResults').filter(r => r.StudentID === App.currentUser.StudentID);
        const merit = MeritCalculator.calculate(App.currentUser.MatricMarks, App.currentUser.MatricTotal, App.currentUser.FscMarks, App.currentUser.FscTotal);
        
        view.innerHTML = `
            <div class="card mb-4" style="background: linear-gradient(135deg, var(--primary-navy) 0%, var(--primary-navy-light) 100%); color: white;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="color: white; margin-bottom: 0.5rem;">Welcome back, ${App.currentUser.Name}!</h2>
                        <p style="opacity: 0.8; margin: 0;">Your calculated merit score based on Matric and FSc is <strong>${merit || 0}%</strong>.</p>
                    </div>
                    <div style="font-size: 3rem; color: var(--accent-gold);"><i class="fas fa-graduation-cap"></i></div>
                </div>
            </div>
            <div class="grid-3 mb-4">
                <div class="stat-card"><div class="stat-icon"><i class="fas fa-file-alt"></i></div><div class="stat-info"><h3>${apps.length}</h3><p>Total Applications</p></div></div>
                <div class="stat-card"><div class="stat-icon"><i class="fas fa-check-circle text-success"></i></div><div class="stat-info"><h3>${apps.filter(a => a.Status === 'Shortlisted').length}</h3><p>Shortlisted</p></div></div>
                <div class="stat-card"><div class="stat-icon"><i class="fas fa-file-signature text-gold"></i></div><div class="stat-info"><h3>${results.length}</h3><p>Tests Attempted</p></div></div>
            </div>
            <div class="card">
                <h3 class="mb-3">Recent Activity</h3>
                ${apps.length === 0 ? '<p class="text-muted">No applications submitted yet. Browse colleges to apply!</p>' : `
                    <div class="table-responsive">
                        <table>
                            <thead><tr><th>College</th><th>Program</th><th>Date Applied</th><th>Status</th></tr></thead>
                            <tbody>
                                ${apps.slice(0, 5).map(a => {
                                    const col = DB.get('Colleges').find(c => c.CollegeID === a.CollegeID);
                                    return `<tr><td><strong>${col ? col.Name : 'Unknown'}</strong></td><td>${a.Program}</td><td>${new Date(a.AppliedDate).toLocaleDateString()}</td><td><span class="badge badge-${a.Status.toLowerCase()}">${a.Status}</span></td></tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
    },

    renderColleges: () => {
        App.navigate('colleges', 'Browse Colleges');
        const view = document.getElementById('main-view');
        const colleges = DB.get('Colleges');
        let html = `
            <div class="card mb-4">
                <div class="grid-4" style="margin-bottom:0;">
                    <div class="form-group" style="margin-bottom:0;"><input type="text" id="filter-search" class="form-control" placeholder="Search college name..." onkeyup="StudentModule.filterColleges()"></div>
                    <div class="form-group" style="margin-bottom:0;"><select id="filter-city" class="form-control" onchange="StudentModule.filterColleges()"><option value="">All Cities</option>${[...new Set(colleges.map(c => c.City))].map(city => `<option value="${city}">${city}</option>`).join('')}</select></div>
                    <div class="form-group" style="margin-bottom:0;"><select id="filter-type" class="form-control" onchange="StudentModule.filterColleges()"><option value="">All Types</option><option value="Public">Public</option><option value="Private">Private</option></select></div>
                    <div class="form-group" style="margin-bottom:0;"><select id="filter-sort" class="form-control" onchange="StudentModule.filterColleges()"><option value="name">Sort by Name</option><option value="fee-low">Fee: Low to High</option><option value="seats">Seats: Highest First</option></select></div>
                </div>
            </div>
            <div id="colleges-announcements" class="mb-4"></div>
            <div class="grid-2" id="colleges-grid">${StudentModule.getCollegesHtml(colleges)}</div>
        `;
        view.innerHTML = html;
        StudentModule.renderAnnouncements();
    },

    renderAnnouncements: () => {
        const colleges = DB.get('Colleges');
        let allAnns = [];
        colleges.forEach(c => {
            if(c.Announcements) {
                c.Announcements.forEach(a => allAnns.push({ ...a, CollegeName: c.Name, CollegeLogo: c.Logo }));
            }
        });
        allAnns.sort((a,b) => new Date(b.Date) - new Date(a.Date));
        
        if (allAnns.length > 0) {
            document.getElementById('colleges-announcements').innerHTML = `
                <div class="card" style="background: rgba(52, 152, 219, 0.05); border-color: rgba(52, 152, 219, 0.2);">
                    <h4 class="mb-2"><i class="fas fa-bullhorn text-navy"></i> Recent Announcements</h4>
                    <ul style="list-style: none; margin: 0; padding: 0;">
                        ${allAnns.slice(0,3).map(a => `
                            <li style="padding: 0.5rem 0; border-bottom: 1px solid var(--border-color); display: flex; gap: 1rem;">
                                <i class="fas ${a.CollegeLogo || 'fa-university'} text-muted" style="margin-top: 3px;"></i>
                                <div><strong>${a.CollegeName}:</strong> ${a.Text} <small class="text-muted" style="display:block;">${new Date(a.Date).toLocaleDateString()}</small></div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
    },

    filterColleges: () => {
        const search = document.getElementById('filter-search').value.toLowerCase();
        const city = document.getElementById('filter-city').value;
        const type = document.getElementById('filter-type').value;
        const sort = document.getElementById('filter-sort').value;
        
        let filtered = DB.get('Colleges').filter(c => c.Name.toLowerCase().includes(search) && (city === '' || c.City === city) && (type === '' || c.Type === type));
        
        if (sort === 'fee-low') filtered.sort((a, b) => a.Fee - b.Fee);
        else if (sort === 'seats') filtered.sort((a, b) => b.Seats - a.Seats);
        else filtered.sort((a, b) => a.Name.localeCompare(b.Name));
        
        document.getElementById('colleges-grid').innerHTML = StudentModule.getCollegesHtml(filtered);
    },

    toggleSaveCollege: (collegeId, event) => {
        if(event) { event.stopPropagation(); event.preventDefault(); }
        const s = DB.get('Students').find(st => st.StudentID === App.currentUser.StudentID);
        const isSaved = s.SavedColleges.includes(collegeId);
        
        if (isSaved) {
            s.SavedColleges = s.SavedColleges.filter(id => id !== collegeId);
            App.showToast('Removed from saved colleges');
        } else {
            s.SavedColleges.push(collegeId);
            App.showToast('Added to saved colleges');
        }
        
        DB.update('Students', st => st.StudentID === s.StudentID, { SavedColleges: s.SavedColleges });
        App.currentUser.SavedColleges = s.SavedColleges;
        localStorage.setItem('pakEduUser', JSON.stringify(App.currentUser));
        
        // Refresh views
        const btn = document.getElementById(`save-btn-${collegeId}`);
        if(btn) {
            btn.className = s.SavedColleges.includes(collegeId) ? 'bookmark-btn active' : 'bookmark-btn';
            btn.innerHTML = s.SavedColleges.includes(collegeId) ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
        }
        if (document.getElementById('page-title').innerText === 'Saved Colleges') {
            StudentModule.renderSavedColleges();
        }
    },

    getCollegesHtml: (colleges) => {
        if(colleges.length === 0) return '<p>No colleges found.</p>';
        const merit = MeritCalculator.calculate(App.currentUser.MatricMarks, App.currentUser.MatricTotal, App.currentUser.FscMarks, App.currentUser.FscTotal);
        
        return colleges.map(c => {
            const isEligible = MeritCalculator.isEligible(merit, c.MeritCutoff);
            const isSaved = App.currentUser.SavedColleges && App.currentUser.SavedColleges.includes(c.CollegeID);
            
            return `
            <div class="card college-card">
                <button id="save-btn-${c.CollegeID}" class="bookmark-btn ${isSaved ? 'active' : ''}" onclick="StudentModule.toggleSaveCollege('${c.CollegeID}', event)" title="Save College">
                    <i class="${isSaved ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <div class="college-header">
                    <div class="college-logo"><i class="fas ${c.Logo || 'fa-university'}"></i></div>
                    <div style="padding-right: 2rem;">
                        <h3 style="margin-bottom: 0.2rem;">${c.Name}</h3>
                        <p class="text-muted" style="font-size: 0.9rem;"><i class="fas fa-map-marker-alt"></i> ${c.City}</p>
                    </div>
                </div>
                <div class="mb-2">
                    ${isEligible ? `<span class="badge badge-success"><i class="fas fa-check"></i> Eligible (Merit >= ${c.MeritCutoff}%)</span>` 
                                 : `<span class="badge badge-danger"><i class="fas fa-times"></i> Not Eligible (Needs ${c.MeritCutoff}%)</span>`}
                </div>
                <div class="college-meta">
                    <span class="badge badge-navy">${c.Type}</span>
                    <span class="badge badge-gold">Fee: Rs ${c.Fee}</span>
                    <span class="badge badge-pending">Deadline: ${c.Deadline}</span>
                </div>
                <p class="text-muted mb-3" style="font-size: 0.9rem;"><strong>Programs:</strong> ${c.Programs.join(', ')}</p>
                <div class="college-footer">
                    <span class="text-muted"><i class="fas fa-users"></i> ${c.Seats} Seats</span>
                    <div>
                        <button class="btn btn-outline btn-sm" onclick="StudentModule.openChat('${c.CollegeID}', '${c.Name}')"><i class="fas fa-comment"></i></button>
                        <button class="btn btn-primary btn-sm" onclick="StudentModule.showApplyForm('${c.CollegeID}')">View & Apply</button>
                    </div>
                </div>
            </div>
        `}).join('');
    },

    renderSavedColleges: () => {
        App.navigate('saved', 'Saved Colleges');
        const view = document.getElementById('main-view');
        const savedIds = App.currentUser.SavedColleges || [];
        const colleges = DB.get('Colleges').filter(c => savedIds.includes(c.CollegeID));
        
        if (colleges.length === 0) {
            view.innerHTML = `
                <div class="card text-center" style="padding: 4rem 2rem;">
                    <i class="far fa-heart text-muted mb-3" style="font-size: 3rem;"></i>
                    <h3>No Saved Colleges</h3>
                    <p class="text-muted mb-4">You haven't bookmarked any colleges yet. Browse colleges and click the heart icon to save them.</p>
                    <button class="btn btn-primary" onclick="StudentModule.renderColleges()">Browse Colleges</button>
                </div>
            `;
            return;
        }
        
        view.innerHTML = `<div class="grid-2">${StudentModule.getCollegesHtml(colleges)}</div>`;
    },

    showApplyForm: (collegeId) => {
        const c = DB.get('Colleges').find(c => c.CollegeID === collegeId);
        if(!c) return;
        const existingApp = DB.get('Applications').find(a => a.StudentID === App.currentUser.StudentID && a.CollegeID === collegeId);
        
        let content = '';
        if(existingApp) {
            content = `
                <div class="card text-center">
                    <i class="fas fa-check-circle text-success" style="font-size: 4rem; margin-bottom: 1rem;"></i>
                    <h3>You have already applied!</h3>
                    <p class="mb-4">Status: <strong>${existingApp.Status}</strong></p>
                    <button class="btn btn-outline" onclick="StudentModule.renderApplications()">Go to My Applications</button>
                </div>
            `;
        } else {
            const merit = MeritCalculator.calculate(App.currentUser.MatricMarks, App.currentUser.MatricTotal, App.currentUser.FscMarks, App.currentUser.FscTotal);
            const isEligible = MeritCalculator.isEligible(merit, c.MeritCutoff);
            
            content = `
                <div class="card">
                    <h2 class="mb-2">Apply to ${c.Name}</h2>
                    <p class="text-muted mb-3">${c.Description || ''}</p>
                    
                    ${c.Images && c.Images.length > 0 ? `
                        <div class="mb-4"><h4 class="mb-2">Campus Pictures</h4><div class="grid-3" style="gap: 1rem;">
                        ${c.Images.map(img => `<img src="${img}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;">`).join('')}
                        </div></div>` : ''}
                    
                    ${!isEligible ? `
                        <div class="mb-4" style="padding: 1rem; background: rgba(231,76,60,0.1); border-left: 4px solid var(--danger); border-radius: 4px;">
                            <h4 class="text-danger"><i class="fas fa-exclamation-triangle"></i> Not Eligible</h4>
                            <p style="margin:0;">Your merit score (${merit}%) is below the college's required cutoff (${c.MeritCutoff}%). You cannot apply.</p>
                        </div>
                        <button class="btn btn-outline" onclick="StudentModule.renderColleges()">Back to Colleges</button>
                    ` : `
                        <form onsubmit="StudentModule.submitApplication(event, '${collegeId}')">
                            <div class="form-group">
                                <label class="form-label">Select Program</label>
                                <select id="apply-program" class="form-control" required>
                                    <option value="">-- Select a Program --</option>
                                    ${c.Programs.map(p => `<option value="${p}">${p}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Calculated Merit</label>
                                <input type="text" class="form-control" value="${merit}% (Based on Profile)" disabled>
                            </div>
                            <p class="text-muted mb-3" style="font-size: 0.9rem;">By applying, you agree to take the entry test if required.</p>
                            <div style="display: flex; gap: 1rem;">
                                <button type="submit" class="btn btn-primary">Submit Application</button>
                                <button type="button" class="btn btn-outline" onclick="StudentModule.renderColleges()">Cancel</button>
                            </div>
                        </form>
                    `}
                </div>
            `;
        }
        document.getElementById('main-view').innerHTML = content;
    },

    submitApplication: (e, collegeId) => {
        e.preventDefault();
        const program = document.getElementById('apply-program').value;
        const appRecord = {
            ApplicationID: DB.generateId('A'),
            StudentID: App.currentUser.StudentID,
            CollegeID: collegeId,
            Program: program,
            Status: 'Pending',
            AppliedDate: new Date().toISOString()
        };
        DB.insert('Applications', appRecord);
        NotificationService.add(App.currentUser.StudentID, 'student', `Application submitted to ${DB.get('Colleges').find(c=>c.CollegeID===collegeId).Name}`, 'success');
        NotificationService.add(collegeId, 'college', `New application received for ${program} from ${App.currentUser.Name}`, 'info');
        App.showToast('Application submitted successfully!');
        StudentModule.renderApplications();
    },

    renderApplications: () => {
        App.navigate('applications', 'My Applications');
        const view = document.getElementById('main-view');
        const apps = DB.get('Applications').filter(a => a.StudentID === App.currentUser.StudentID);
        
        if(apps.length === 0) {
            view.innerHTML = `<div class="card text-center" style="padding: 4rem 2rem;"><i class="fas fa-folder-open text-muted mb-3" style="font-size: 3rem;"></i><h3>No Applications Found</h3><p class="text-muted mb-4">You haven't applied to any colleges yet.</p><button class="btn btn-primary" onclick="StudentModule.renderColleges()">Browse Colleges</button></div>`;
            return;
        }

        view.innerHTML = `
            <div class="card">
                <div class="table-responsive">
                    <table>
                        <thead><tr><th>College</th><th>Program</th><th>Status</th><th>Entry Test</th><th>Action</th></tr></thead>
                        <tbody>
                            ${apps.map(a => {
                                const c = DB.get('Colleges').find(col => col.CollegeID === a.CollegeID);
                                const result = DB.get('TestResults').find(r => r.ApplicationID === a.ApplicationID);
                                let testAction = '';
                                if(result) testAction = `<span class="badge badge-${result.PassFail === 'Pass' ? 'shortlisted' : 'rejected'}">Score: ${result.Score}/${result.TotalMarks} (${result.PassFail})</span>`;
                                else {
                                    const qs = DB.get('TestQuestions').filter(q => q.CollegeID === a.CollegeID);
                                    if(qs.length > 0) testAction = `<button class="btn btn-gold btn-sm" onclick="StudentModule.startTest('${a.ApplicationID}')"><i class="fas fa-play"></i> Take Test</button>`;
                                    else testAction = `<span class="text-muted">No test required</span>`;
                                }
                                return `<tr>
                                    <td><strong>${c ? c.Name : 'Unknown'}</strong><br><small class="text-muted">Applied: ${new Date(a.AppliedDate).toLocaleDateString()}</small></td>
                                    <td>${a.Program}</td>
                                    <td><span class="badge badge-${a.Status.toLowerCase()}">${a.Status}</span></td>
                                    <td>${testAction}</td>
                                    <td><button class="btn btn-outline btn-sm" onclick="StudentModule.printAdmitCard('${a.ApplicationID}')"><i class="fas fa-print"></i> Print</button></td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    printAdmitCard: (appId) => {
        const a = DB.get('Applications').find(x => x.ApplicationID === appId);
        const c = DB.get('Colleges').find(x => x.CollegeID === a.CollegeID);
        const s = App.currentUser;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Admit Card - ${c.Name}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                    .card { border: 2px solid #0A192F; border-radius: 12px; padding: 30px; max-width: 600px; margin: 0 auto; position: relative; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 20px; }
                    .logo { font-size: 24px; font-weight: bold; color: #0A192F; }
                    .title { font-size: 20px; font-weight: bold; text-align: center; margin: 20px 0; background: #0A192F; color: white; padding: 10px; border-radius: 4px; }
                    .row { display: flex; margin-bottom: 15px; }
                    .label { font-weight: bold; width: 150px; color: #666; }
                    .value { flex: 1; font-weight: 600; border-bottom: 1px dotted #ccc; }
                    .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
                    .barcode { text-align: center; margin-top: 20px; font-family: 'Courier New', Courier, monospace; letter-spacing: 5px; font-size: 18px; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="no-print" style="text-align:center; margin-bottom: 20px;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #0A192F; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Admit Card</button>
                </div>
                <div class="card">
                    <div class="header">
                        <div class="logo">PakAdmissions</div>
                        <div style="text-align: right;">
                            <strong>${c.Name}</strong><br>
                            <small>${c.City}, Pakistan</small>
                        </div>
                    </div>
                    <div class="title">OFFICIAL ADMIT CARD / APPLICATION SLIP</div>
                    <div class="row"><div class="label">Application No:</div><div class="value">${a.ApplicationID}</div></div>
                    <div class="row"><div class="label">Candidate Name:</div><div class="value">${s.Name}</div></div>
                    <div class="row"><div class="label">CNIC:</div><div class="value">${s.CNIC}</div></div>
                    <div class="row"><div class="label">Program Applied:</div><div class="value">${a.Program}</div></div>
                    <div class="row"><div class="label">Applied Date:</div><div class="value">${new Date(a.AppliedDate).toLocaleDateString()}</div></div>
                    <div class="row"><div class="label">Current Status:</div><div class="value">${a.Status}</div></div>
                    <div class="barcode">||| ||||| || |||| ||| |||||||</div>
                    <div class="footer">
                        <p>This is a system generated document. Please bring a printed copy on the day of the test/interview.</p>
                    </div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    },

    currentTestQuestions: [], currentAppId: null, testTimer: null, timeLeft: 600,

    startTest: (appId) => {
        const app = DB.get('Applications').find(a => a.ApplicationID === appId);
        const questions = DB.get('TestQuestions').filter(q => q.CollegeID === app.CollegeID);
        if(questions.length === 0) { App.showToast('No questions available.', 'error'); return; }
        StudentModule.currentAppId = appId; StudentModule.currentTestQuestions = questions; StudentModule.timeLeft = questions.length * 60;
        StudentModule.renderTestInterface(); StudentModule.startTimer();
    },

    renderTestInterface: () => {
        const view = document.getElementById('main-view');
        const c = DB.get('Colleges').find(col => col.CollegeID === DB.get('Applications').find(a => a.ApplicationID === StudentModule.currentAppId).CollegeID);
        let html = `
            <div class="test-header">
                <div><h2 style="margin:0; color:white;">Entry Test: ${c.Name}</h2><p style="margin:0; opacity:0.8;">Answer all questions before time runs out.</p></div>
                <div class="timer" id="test-timer">--:--</div>
            </div>
            <form id="test-form" onsubmit="StudentModule.submitTest(event)">
                ${StudentModule.currentTestQuestions.map((q, idx) => `
                    <div class="card question-card">
                        <h4><span class="text-gold">Q${idx + 1}.</span> ${q.QuestionText}</h4>
                        <ul class="options-list">
                            ${['A','B','C','D'].map(opt => `
                                <li class="option-item"><label class="option-label"><input type="radio" name="q_${q.QuestionID}" value="${opt}" class="option-input" required><span class="option-text">${q['Option'+opt]}</span></label></li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
                <div class="card"><button type="submit" class="btn btn-primary btn-block">Submit Test</button></div>
            </form>
        `;
        view.innerHTML = html;
    },

    startTimer: () => {
        clearInterval(StudentModule.testTimer);
        const updateDisplay = () => {
            const m = Math.floor(StudentModule.timeLeft / 60).toString().padStart(2, '0');
            const s = (StudentModule.timeLeft % 60).toString().padStart(2, '0');
            const el = document.getElementById('test-timer');
            if(el) el.innerText = `${m}:${s}`;
        };
        updateDisplay();
        StudentModule.testTimer = setInterval(() => {
            StudentModule.timeLeft--; updateDisplay();
            if(StudentModule.timeLeft <= 0) { clearInterval(StudentModule.testTimer); App.showToast('Time is up! Auto-submitting...', 'warning'); document.getElementById('test-form').dispatchEvent(new Event('submit')); }
        }, 1000);
    },

    submitTest: (e) => {
        if(e) e.preventDefault(); clearInterval(StudentModule.testTimer);
        const formData = new FormData(document.getElementById('test-form'));
        let score = 0; const total = StudentModule.currentTestQuestions.length;
        StudentModule.currentTestQuestions.forEach(q => { if(formData.get(`q_${q.QuestionID}`) === q.CorrectAnswer) score++; });
        
        const passFail = (score / total) >= 0.5 ? 'Pass' : 'Fail';
        const app = DB.get('Applications').find(a => a.ApplicationID === StudentModule.currentAppId);
        
        DB.insert('TestResults', { ResultID: DB.generateId('R'), ApplicationID: app.ApplicationID, StudentID: app.StudentID, CollegeID: app.CollegeID, Score: score, TotalMarks: total, PassFail: passFail, Date: new Date().toISOString() });
        if (passFail === 'Fail') DB.update('Applications', a => a.ApplicationID === app.ApplicationID, { Status: 'Rejected' });
        
        NotificationService.add(app.StudentID, 'student', `Test results for ${DB.get('Colleges').find(c=>c.CollegeID===app.CollegeID).Name} are out! You scored ${score}/${total}.`, passFail === 'Pass' ? 'success' : 'danger');
        
        document.getElementById('main-view').innerHTML = `
            <div class="card text-center" style="padding: 4rem 2rem;">
                <i class="fas fa-${passFail === 'Pass' ? 'award text-gold' : 'times-circle text-danger'}" style="font-size: 4rem; margin-bottom: 1rem;"></i>
                <h2>Test Submitted Successfully!</h2>
                <h1 class="mb-2 ${passFail === 'Pass' ? 'text-navy' : 'text-danger'}">${score} / ${total}</h1>
                <p class="mb-4 text-muted">Status: <strong>${passFail}</strong></p>
                <button class="btn btn-primary" onclick="StudentModule.renderApplications()">Back to Applications</button>
            </div>
        `;
    },

    activeChatPartner: null,

    renderInbox: () => {
        App.navigate('inbox', 'Inbox & Messages');
        const view = document.getElementById('main-view');
        const sId = App.currentUser.StudentID;
        const allMsgs = DB.get('Messages').filter(m => m.SenderID === sId || m.ReceiverID === sId);
        
        // Group by college
        const threads = {};
        allMsgs.forEach(m => {
            const otherId = m.SenderID === sId ? m.ReceiverID : m.SenderID;
            if(!threads[otherId]) threads[otherId] = { id: otherId, msgs: [] };
            threads[otherId].msgs.push(m);
        });
        
        Object.values(threads).forEach(t => t.msgs.sort((a,b) => new Date(a.Timestamp) - new Date(b.Timestamp)));
        
        let threadsHtml = Object.values(threads).map(t => {
            const col = DB.get('Colleges').find(c => c.CollegeID === t.id);
            const lastMsg = t.msgs[t.msgs.length - 1];
            return `
                <div class="thread-item ${StudentModule.activeChatPartner === t.id ? 'active' : ''}" onclick="StudentModule.openChat('${t.id}')">
                    <div class="thread-name">${col ? col.Name : 'Unknown College'}</div>
                    <div class="thread-preview">${lastMsg.SenderID === sId ? 'You: ' : ''}${lastMsg.Text}</div>
                </div>
            `;
        }).join('');
        
        if(Object.keys(threads).length === 0) threadsHtml = '<div style="padding: 1rem; color: var(--text-muted); text-align:center;">No conversations yet.</div>';

        view.innerHTML = `
            <div class="chat-container">
                <div class="chat-sidebar">
                    <div class="chat-sidebar-header"><i class="fas fa-comments"></i> Conversations</div>
                    <div class="chat-threads">${threadsHtml}</div>
                </div>
                <div class="chat-main" id="chat-main">
                    ${StudentModule.activeChatPartner ? StudentModule.getChatBoxHtml() : '<div style="flex:1; display:flex; align-items:center; justify-content:center; color:var(--text-muted);"><p>Select a conversation to start messaging</p></div>'}
                </div>
            </div>
        `;
        if(StudentModule.activeChatPartner) StudentModule.scrollChatToBottom();
    },

    openChat: (collegeId, collegeName = null) => {
        StudentModule.activeChatPartner = collegeId;
        StudentModule.renderInbox();
    },

    getChatBoxHtml: () => {
        const cId = StudentModule.activeChatPartner;
        const col = DB.get('Colleges').find(c => c.CollegeID === cId);
        const sId = App.currentUser.StudentID;
        const msgs = DB.get('Messages').filter(m => (m.SenderID === sId && m.ReceiverID === cId) || (m.SenderID === cId && m.ReceiverID === sId));
        msgs.sort((a,b) => new Date(a.Timestamp) - new Date(b.Timestamp));
        
        return `
            <div class="chat-header">
                <div><i class="fas ${col ? col.Logo : 'fa-university'}"></i> ${col ? col.Name : 'Unknown'}</div>
            </div>
            <div class="chat-messages" id="chat-messages">
                ${msgs.length === 0 ? '<p style="text-align:center; color:var(--text-muted); margin-top:2rem;">Start a conversation!</p>' : 
                  msgs.map(m => `
                    <div class="msg-bubble ${m.SenderID === sId ? 'sent' : 'received'}">
                        ${m.Text}
                        <span class="msg-time">${new Date(m.Timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                `).join('')}
            </div>
            <form class="chat-input-area" onsubmit="StudentModule.sendMessage(event)">
                <input type="text" id="chat-input-text" class="chat-input" placeholder="Type a message..." required autocomplete="off">
                <button type="submit" class="chat-send-btn"><i class="fas fa-paper-plane"></i></button>
            </form>
        `;
    },

    sendMessage: (e) => {
        e.preventDefault();
        const text = document.getElementById('chat-input-text').value;
        if(!text.trim() || !StudentModule.activeChatPartner) return;
        
        DB.insert('Messages', {
            MsgID: DB.generateId('M'),
            SenderID: App.currentUser.StudentID,
            ReceiverID: StudentModule.activeChatPartner,
            Text: text,
            Timestamp: new Date().toISOString()
        });
        
        NotificationService.add(StudentModule.activeChatPartner, 'college', `New message from ${App.currentUser.Name}`, 'info', 'fa-comment');
        StudentModule.renderInbox();
    },

    scrollChatToBottom: () => {
        const el = document.getElementById('chat-messages');
        if(el) el.scrollTop = el.scrollHeight;
    },

    renderProfile: () => {
        App.navigate('profile', 'My Profile');
        const view = document.getElementById('main-view');
        const user = App.currentUser;
        
        view.innerHTML = `
            <div class="card" style="max-width: 600px; margin: 0 auto;">
                <div style="display: flex; align-items: center; gap: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--accent-gold); color: var(--primary-navy); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: bold;">
                        ${user.Name.charAt(0)}
                    </div>
                    <div>
                        <h2 style="margin: 0;">${user.Name}</h2>
                        <p class="text-muted" style="margin: 0;">Student ID: ${user.StudentID}</p>
                    </div>
                </div>
                
                <form onsubmit="StudentModule.updateProfile(event)">
                    <h4 class="mb-2">Personal Information</h4>
                    <div class="grid-2" style="gap: 1rem; margin-bottom: 0;">
                        <div class="form-group"><label class="form-label">Full Name</label><input type="text" id="prof-name" class="form-control" value="${user.Name}" required></div>
                        <div class="form-group"><label class="form-label">Email</label><input type="email" id="prof-email" class="form-control" value="${user.Email}" required></div>
                        <div class="form-group"><label class="form-label">Phone</label><input type="text" id="prof-phone" class="form-control" value="${user.Phone}" required></div>
                        <div class="form-group"><label class="form-label">City</label><input type="text" id="prof-city" class="form-control" value="${user.City}" required></div>
                    </div>
                    
                    <h4 class="mt-4 mb-2">Academic Record</h4>
                    <div class="grid-2" style="gap: 1rem; margin-bottom: 0;">
                        <div class="form-group">
                            <label class="form-label">Matric Marks</label>
                            <div style="display:flex; align-items:center; gap:0.5rem;">
                                <input type="number" id="prof-matric" class="form-control" value="${user.MatricMarks}" required> <span>/ 1100</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">FSc Marks</label>
                            <div style="display:flex; align-items:center; gap:0.5rem;">
                                <input type="number" id="prof-fsc" class="form-control" value="${user.FscMarks}" required> <span>/ 1100</span>
                            </div>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary mt-4 btn-block">Save Changes</button>
                </form>
            </div>
        `;
    },

    updateProfile: (e) => {
        e.preventDefault();
        const updateData = {
            Name: document.getElementById('prof-name').value,
            Email: document.getElementById('prof-email').value,
            Phone: document.getElementById('prof-phone').value,
            City: document.getElementById('prof-city').value,
            MatricMarks: parseInt(document.getElementById('prof-matric').value),
            FscMarks: parseInt(document.getElementById('prof-fsc').value)
        };
        DB.update('Students', s => s.StudentID === App.currentUser.StudentID, updateData);
        App.currentUser = { ...App.currentUser, ...updateData };
        localStorage.setItem('pakEduUser', JSON.stringify(App.currentUser));
        App.showToast('Profile updated successfully!');
        StudentModule.renderProfile();
    }
};
