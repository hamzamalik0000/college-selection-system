const CollegeModule = {
    getNav: () => `
        <li class="nav-item"><a href="#" class="nav-link" id="nav-dashboard" onclick="CollegeModule.renderDashboard()"><i class="fas fa-chart-line"></i> Dashboard</a></li>
        <li class="nav-item"><a href="#" class="nav-link" id="nav-applicants" onclick="CollegeModule.renderApplicants()"><i class="fas fa-users"></i> Applicants</a></li>
        <li class="nav-item"><a href="#" class="nav-link" id="nav-tests" onclick="CollegeModule.renderTests()"><i class="fas fa-tasks"></i> Test Management</a></li>
        <li class="nav-item"><a href="#" class="nav-link" id="nav-inbox" onclick="CollegeModule.renderInbox()"><i class="fas fa-envelope"></i> Inbox</a></li>
        <li class="nav-item"><a href="#" class="nav-link" id="nav-announcements" onclick="CollegeModule.renderAnnouncements()"><i class="fas fa-bullhorn"></i> Announcements</a></li>
        <li class="nav-item"><a href="#" class="nav-link" id="nav-profile" onclick="CollegeModule.renderProfile()"><i class="fas fa-building"></i> College Profile</a></li>
    `,

    init: () => { CollegeModule.renderDashboard(); },

    renderDashboard: () => {
        App.navigate('dashboard', 'College Dashboard');
        const view = document.getElementById('main-view');
        const collegeId = App.currentUser.CollegeID;
        const apps = DB.get('Applications').filter(a => a.CollegeID === collegeId);
        const pendingApps = apps.filter(a => a.Status === 'Pending');
        const shortlistedApps = apps.filter(a => a.Status === 'Shortlisted');
        
        // Analytics
        let programCounts = {};
        let maxCount = 0;
        apps.forEach(a => {
            programCounts[a.Program] = (programCounts[a.Program] || 0) + 1;
            if(programCounts[a.Program] > maxCount) maxCount = programCounts[a.Program];
        });
        const colors = ['var(--primary-navy)', 'var(--accent-gold)', '#2ecc71', '#e74c3c', '#3498db'];

        view.innerHTML = `
            <div class="grid-3 mb-4">
                <div class="stat-card"><div class="stat-icon"><i class="fas fa-users"></i></div><div class="stat-info"><h3>${apps.length}</h3><p>Total Applicants</p></div></div>
                <div class="stat-card"><div class="stat-icon"><i class="fas fa-clock text-warning"></i></div><div class="stat-info"><h3>${pendingApps.length}</h3><p>Pending Review</p></div></div>
                <div class="stat-card"><div class="stat-icon"><i class="fas fa-user-check text-success"></i></div><div class="stat-info"><h3>${shortlistedApps.length}</h3><p>Shortlisted</p></div></div>
            </div>
            
            ${Object.keys(programCounts).length > 0 ? `
            <div class="card mb-4">
                <h3 class="mb-3">Applications per Program</h3>
                <div class="chart-container">
                    ${Object.entries(programCounts).map(([prog, count], idx) => {
                        const height = (count / maxCount) * 100;
                        return `
                        <div class="chart-bar-wrapper">
                            <div class="chart-bar-value">${count}</div>
                            <div class="chart-bar" style="height: ${height}%; background-color: ${colors[idx % colors.length]};"></div>
                            <div class="chart-bar-label" style="max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${prog}">${prog}</div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>` : ''}
            
            <div class="card">
                <h3 class="mb-3">Recent Applications</h3>
                ${apps.length === 0 ? '<p class="text-muted">No applications received yet.</p>' : `
                    <div class="table-responsive">
                        <table>
                            <thead><tr><th>Student Name</th><th>Program</th><th>Date Applied</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>
                                ${apps.slice(0, 5).map(a => {
                                    const s = DB.get('Students').find(st => st.StudentID === a.StudentID);
                                    return `<tr>
                                        <td><strong>${s ? s.Name : 'Unknown'}</strong><br><small class="text-muted">${s?.Email}</small></td>
                                        <td>${a.Program}</td>
                                        <td>${new Date(a.AppliedDate).toLocaleDateString()}</td>
                                        <td><span class="badge badge-${a.Status.toLowerCase()}">${a.Status}</span></td>
                                        <td><button class="btn btn-outline btn-sm" onclick="CollegeModule.renderApplicants()">Review</button></td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
    },

    renderApplicants: () => {
        App.navigate('applicants', 'Manage Applicants');
        const view = document.getElementById('main-view');
        const collegeId = App.currentUser.CollegeID;
        const apps = DB.get('Applications').filter(a => a.CollegeID === collegeId);
        const programs = [...new Set(apps.map(a => a.Program))];
        
        view.innerHTML = `
            <div class="card mb-4">
                <div class="grid-3" style="margin-bottom:0;">
                    <div class="form-group" style="margin-bottom:0;"><input type="text" id="filter-app-name" class="form-control" placeholder="Search by student name..." onkeyup="CollegeModule.filterApplicants()"></div>
                    <div class="form-group" style="margin-bottom:0;"><select id="filter-app-prog" class="form-control" onchange="CollegeModule.filterApplicants()"><option value="">All Programs</option>${programs.map(p => `<option value="${p}">${p}</option>`).join('')}</select></div>
                    <div class="form-group" style="margin-bottom:0;"><select id="filter-app-status" class="form-control" onchange="CollegeModule.filterApplicants()"><option value="">All Statuses</option><option value="Pending">Pending</option><option value="Shortlisted">Shortlisted</option><option value="Rejected">Rejected</option></select></div>
                </div>
            </div>
            <div class="card">
                <h3 class="mb-3">All Applicants</h3>
                <div id="applicants-list"></div>
            </div>
        `;
        CollegeModule.filterApplicants();
    },

    filterApplicants: () => {
        const nameFilter = (document.getElementById('filter-app-name').value || '').toLowerCase();
        const progFilter = document.getElementById('filter-app-prog').value;
        const statusFilter = document.getElementById('filter-app-status').value;
        
        const collegeId = App.currentUser.CollegeID;
        const apps = DB.get('Applications').filter(a => a.CollegeID === collegeId);
        
        const filtered = apps.filter(a => {
            const s = DB.get('Students').find(st => st.StudentID === a.StudentID);
            const matchesName = s && s.Name.toLowerCase().includes(nameFilter);
            const matchesProg = progFilter === '' || a.Program === progFilter;
            const matchesStatus = statusFilter === '' || a.Status === statusFilter;
            return matchesName && matchesProg && matchesStatus;
        });

        const listDiv = document.getElementById('applicants-list');
        if (filtered.length === 0) {
            listDiv.innerHTML = '<p class="text-muted">No applicants found matching the criteria.</p>';
            return;
        }

        listDiv.innerHTML = `
            <div class="table-responsive">
                <table>
                    <thead><tr><th>Student Details</th><th>Program</th><th>Test Score</th><th>Merit</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${filtered.map(a => {
                            const s = DB.get('Students').find(st => st.StudentID === a.StudentID);
                            const test = DB.get('TestResults').find(r => r.ApplicationID === a.ApplicationID);
                            let scoreText = '<span class="text-muted">Not Taken</span>';
                            if(test) scoreText = `<strong class="${test.PassFail === 'Pass' ? 'text-success' : 'text-danger'}">${test.Score}/${test.TotalMarks}</strong>`;
                            const merit = s ? MeritCalculator.calculate(s.MatricMarks, s.MatricTotal, s.FscMarks, s.FscTotal) : 0;
                            
                            return `<tr>
                                <td><strong>${s ? s.Name : 'Unknown'}</strong><br><small class="text-muted">${s?.Email} | ${s?.Phone}</small></td>
                                <td>${a.Program}</td>
                                <td>${scoreText}</td>
                                <td><strong>${merit}%</strong></td>
                                <td><span class="badge badge-${a.Status.toLowerCase()}" id="status-${a.ApplicationID}">${a.Status}</span></td>
                                <td>
                                    <div style="display:flex; gap:0.5rem; align-items:center;">
                                        <select class="form-control" style="width: 140px; padding: 0.4rem; font-size:0.85rem;" onchange="CollegeModule.updateAppStatus('${a.ApplicationID}', this.value)">
                                            <option value="" disabled selected>Change Status</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Shortlisted">Shortlisted</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                        <button class="icon-btn" title="Message Student" onclick="CollegeModule.openChat('${s.StudentID}')"><i class="fas fa-envelope"></i></button>
                                    </div>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    updateAppStatus: (appId, newStatus) => {
        DB.update('Applications', a => a.ApplicationID === appId, { Status: newStatus });
        const statusBadge = document.getElementById(`status-${appId}`);
        if(statusBadge) {
            statusBadge.className = `badge badge-${newStatus.toLowerCase()}`;
            statusBadge.innerText = newStatus;
        }
        App.showToast(`Application status updated to ${newStatus}`);

        const app = DB.get('Applications').find(a => a.ApplicationID === appId);
        const student = DB.get('Students').find(s => s.StudentID === app.StudentID);
        let msg = `Your application for ${app.Program} at ${App.currentUser.Name} has been ${newStatus}.`;
        NotificationService.add(student.StudentID, 'student', msg, newStatus === 'Shortlisted' ? 'success' : (newStatus === 'Rejected' ? 'danger' : 'info'));
    },

    renderTests: () => {
        App.navigate('tests', 'Manage Test Questions');
        const view = document.getElementById('main-view');
        const collegeId = App.currentUser.CollegeID;
        const questions = DB.get('TestQuestions').filter(q => q.CollegeID === collegeId);
        
        view.innerHTML = `
            <div class="grid-2">
                <div class="card">
                    <h3 class="mb-3">Add New Question</h3>
                    <form onsubmit="CollegeModule.addQuestion(event)">
                        <div class="form-group"><label class="form-label">Question Text</label><input type="text" id="q-text" class="form-control" required></div>
                        <div class="grid-2" style="gap:1rem; margin-bottom:0;">
                            <div class="form-group"><label class="form-label">Option A</label><input type="text" id="q-optA" class="form-control" required></div>
                            <div class="form-group"><label class="form-label">Option B</label><input type="text" id="q-optB" class="form-control" required></div>
                            <div class="form-group"><label class="form-label">Option C</label><input type="text" id="q-optC" class="form-control" required></div>
                            <div class="form-group"><label class="form-label">Option D</label><input type="text" id="q-optD" class="form-control" required></div>
                        </div>
                        <div class="form-group"><label class="form-label">Correct Answer</label><select id="q-correct" class="form-control" required><option value="A">Option A</option><option value="B">Option B</option><option value="C">Option C</option><option value="D">Option D</option></select></div>
                        <button type="submit" class="btn btn-gold"><i class="fas fa-plus"></i> Add Question</button>
                    </form>
                </div>
                <div class="card">
                    <h3 class="mb-3">Existing Questions (${questions.length})</h3>
                    <div style="max-height: 400px; overflow-y: auto; padding-right: 10px;">
                        ${questions.length === 0 ? '<p class="text-muted">No questions added yet.</p>' : 
                            questions.map((q, idx) => `
                                <div class="card mb-3" style="box-shadow:none; border: 1px solid var(--border-color); padding: 1rem;">
                                    <h4 style="font-size: 1rem; margin-bottom: 0.5rem;">Q${idx+1}. ${q.QuestionText}</h4>
                                    <ul style="list-style:none; font-size: 0.9rem; color: var(--text-muted);">
                                        <li class="${q.CorrectAnswer === 'A' ? 'text-success font-weight-bold' : ''}">A. ${q.OptionA}</li>
                                        <li class="${q.CorrectAnswer === 'B' ? 'text-success font-weight-bold' : ''}">B. ${q.OptionB}</li>
                                        <li class="${q.CorrectAnswer === 'C' ? 'text-success font-weight-bold' : ''}">C. ${q.OptionC}</li>
                                        <li class="${q.CorrectAnswer === 'D' ? 'text-success font-weight-bold' : ''}">D. ${q.OptionD}</li>
                                    </ul>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
            </div>
        `;
    },

    addQuestion: (e) => {
        e.preventDefault();
        DB.insert('TestQuestions', {
            QuestionID: DB.generateId('Q'), CollegeID: App.currentUser.CollegeID,
            QuestionText: document.getElementById('q-text').value,
            OptionA: document.getElementById('q-optA').value, OptionB: document.getElementById('q-optB').value,
            OptionC: document.getElementById('q-optC').value, OptionD: document.getElementById('q-optD').value,
            CorrectAnswer: document.getElementById('q-correct').value
        });
        App.showToast('Question added successfully!'); CollegeModule.renderTests();
    },

    renderAnnouncements: () => {
        App.navigate('announcements', 'College Announcements');
        const view = document.getElementById('main-view');
        const anns = App.currentUser.Announcements || [];
        
        view.innerHTML = `
            <div class="card">
                <h3 class="mb-3">Post a New Announcement</h3>
                <form onsubmit="CollegeModule.postAnnouncement(event)">
                    <div class="form-group"><textarea id="ann-text" class="form-control" rows="3" required placeholder="Type your announcement here... It will be visible to all students."></textarea></div>
                    <button type="submit" class="btn btn-primary">Post Announcement</button>
                </form>
            </div>
            <div class="card mt-4">
                <h3 class="mb-3">Past Announcements</h3>
                ${anns.length === 0 ? '<p class="text-muted">No announcements posted yet.</p>' : 
                    '<ul style="list-style:none; margin:0; padding:0;">' + 
                    anns.slice().reverse().map(a => `
                        <li style="padding: 1rem 0; border-bottom: 1px solid var(--border-color);">
                            <p style="margin: 0 0 0.5rem 0;">${a.Text}</p>
                            <small class="text-muted">${new Date(a.Date).toLocaleString()}</small>
                        </li>
                    `).join('') + '</ul>'
                }
            </div>
        `;
    },

    postAnnouncement: (e) => {
        e.preventDefault();
        const text = document.getElementById('ann-text').value;
        const newAnn = { Text: text, Date: new Date().toISOString(), AnnID: DB.generateId('ANN') };
        
        let c = App.currentUser;
        if(!c.Announcements) c.Announcements = [];
        c.Announcements.push(newAnn);
        
        DB.update('Colleges', col => col.CollegeID === c.CollegeID, { Announcements: c.Announcements });
        localStorage.setItem('pakEduUser', JSON.stringify(c));
        App.showToast('Announcement posted successfully!');
        CollegeModule.renderAnnouncements();
    },

    activeChatPartner: null,

    renderInbox: () => {
        App.navigate('inbox', 'Inbox & Messages');
        const view = document.getElementById('main-view');
        const cId = App.currentUser.CollegeID;
        const allMsgs = DB.get('Messages').filter(m => m.SenderID === cId || m.ReceiverID === cId);
        
        const threads = {};
        allMsgs.forEach(m => {
            const otherId = m.SenderID === cId ? m.ReceiverID : m.SenderID;
            if(!threads[otherId]) threads[otherId] = { id: otherId, msgs: [] };
            threads[otherId].msgs.push(m);
        });
        
        Object.values(threads).forEach(t => t.msgs.sort((a,b) => new Date(a.Timestamp) - new Date(b.Timestamp)));
        
        let threadsHtml = Object.values(threads).map(t => {
            const stu = DB.get('Students').find(s => s.StudentID === t.id);
            const lastMsg = t.msgs[t.msgs.length - 1];
            return `
                <div class="thread-item ${CollegeModule.activeChatPartner === t.id ? 'active' : ''}" onclick="CollegeModule.openChat('${t.id}')">
                    <div class="thread-name">${stu ? stu.Name : 'Unknown Student'}</div>
                    <div class="thread-preview">${lastMsg.SenderID === cId ? 'You: ' : ''}${lastMsg.Text}</div>
                </div>
            `;
        }).join('');
        
        if(Object.keys(threads).length === 0) threadsHtml = '<div style="padding: 1rem; color: var(--text-muted); text-align:center;">No conversations yet.</div>';

        view.innerHTML = `
            <div class="chat-container">
                <div class="chat-sidebar">
                    <div class="chat-sidebar-header"><i class="fas fa-comments"></i> Students</div>
                    <div class="chat-threads">${threadsHtml}</div>
                </div>
                <div class="chat-main" id="chat-main">
                    ${CollegeModule.activeChatPartner ? CollegeModule.getChatBoxHtml() : '<div style="flex:1; display:flex; align-items:center; justify-content:center; color:var(--text-muted);"><p>Select a student to message</p></div>'}
                </div>
            </div>
        `;
        if(CollegeModule.activeChatPartner) CollegeModule.scrollChatToBottom();
    },

    openChat: (studentId) => {
        CollegeModule.activeChatPartner = studentId;
        CollegeModule.renderInbox();
    },

    getChatBoxHtml: () => {
        const sId = CollegeModule.activeChatPartner;
        const stu = DB.get('Students').find(s => s.StudentID === sId);
        const cId = App.currentUser.CollegeID;
        const msgs = DB.get('Messages').filter(m => (m.SenderID === cId && m.ReceiverID === sId) || (m.SenderID === sId && m.ReceiverID === cId));
        msgs.sort((a,b) => new Date(a.Timestamp) - new Date(b.Timestamp));
        
        return `
            <div class="chat-header">
                <div><i class="fas fa-user-graduate"></i> ${stu ? stu.Name : 'Unknown'}</div>
            </div>
            <div class="chat-messages" id="chat-messages">
                ${msgs.length === 0 ? '<p style="text-align:center; color:var(--text-muted); margin-top:2rem;">Start a conversation!</p>' : 
                  msgs.map(m => `
                    <div class="msg-bubble ${m.SenderID === cId ? 'sent' : 'received'}">
                        ${m.Text}
                        <span class="msg-time">${new Date(m.Timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                `).join('')}
            </div>
            <form class="chat-input-area" onsubmit="CollegeModule.sendMessage(event)">
                <input type="text" id="chat-input-text" class="chat-input" placeholder="Type a reply..." required autocomplete="off">
                <button type="submit" class="chat-send-btn"><i class="fas fa-paper-plane"></i></button>
            </form>
        `;
    },

    sendMessage: (e) => {
        e.preventDefault();
        const text = document.getElementById('chat-input-text').value;
        if(!text.trim() || !CollegeModule.activeChatPartner) return;
        
        DB.insert('Messages', {
            MsgID: DB.generateId('M'),
            SenderID: App.currentUser.CollegeID,
            ReceiverID: CollegeModule.activeChatPartner,
            Text: text,
            Timestamp: new Date().toISOString()
        });
        
        NotificationService.add(CollegeModule.activeChatPartner, 'student', `New message from ${App.currentUser.Name}`, 'info', 'fa-comment');
        CollegeModule.renderInbox();
    },

    scrollChatToBottom: () => {
        const el = document.getElementById('chat-messages');
        if(el) el.scrollTop = el.scrollHeight;
    },

    renderProfile: () => {
        App.navigate('profile', 'College Profile');
        const view = document.getElementById('main-view');
        const c = App.currentUser;
        
        view.innerHTML = `
            <div class="card" style="max-width: 800px; margin: 0 auto;">
                <div class="college-header mb-4" style="border-bottom: 1px solid var(--border-color); padding-bottom: 1.5rem;">
                    <div class="college-logo" style="width: 80px; height: 80px; font-size: 2rem;"><i class="fas ${c.Logo || 'fa-university'}"></i></div>
                    <div><h2>${c.Name}</h2><p class="text-muted"><i class="fas fa-map-marker-alt"></i> ${c.City} | ${c.Type} College</p></div>
                </div>
                
                <form onsubmit="CollegeModule.updateProfile(event)">
                    <div class="form-group"><label class="form-label">About College / Description</label><textarea id="prof-desc" class="form-control" rows="3" required>${c.Description || ''}</textarea></div>
                    <div class="grid-2" style="gap: 1.5rem; margin-bottom:0;">
                        <div class="form-group"><label class="form-label">Available Seats</label><input type="number" id="prof-seats" class="form-control" value="${c.Seats}" required></div>
                        <div class="form-group"><label class="form-label">Admission Fee (Rs)</label><input type="number" id="prof-fee" class="form-control" value="${c.Fee}" required></div>
                        <div class="form-group"><label class="form-label">Application Deadline</label><input type="date" id="prof-deadline" class="form-control" value="${c.Deadline}" required></div>
                        <div class="form-group"><label class="form-label">Contact Email</label><input type="email" id="prof-email" class="form-control" value="${c.ContactEmail}" required></div>
                        <div class="form-group"><label class="form-label">Merit Cutoff Percentage (%)</label><input type="number" id="prof-cutoff" class="form-control" value="${c.MeritCutoff || 50}" min="0" max="100" required></div>
                    </div>
                    <div class="form-group mt-2"><label class="form-label">Programs Offered (comma separated)</label><textarea id="prof-programs" class="form-control" rows="2" required>${c.Programs.join(', ')}</textarea></div>
                    <button type="submit" class="btn btn-primary mt-2 btn-block">Save Profile Changes</button>
                </form>
            </div>
            
            <div class="card mt-4" style="max-width: 800px; margin: 0 auto;">
                <h3 class="mb-3">College Images</h3>
                <div class="grid-3 mb-3" id="prof-images">
                    ${(c.Images || []).map((img, idx) => `
                        <div style="position: relative;">
                            <img src="${img}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px;">
                            <button onclick="CollegeModule.deleteImage(${idx})" style="position: absolute; top: 5px; right: 5px; background: var(--danger); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">&times;</button>
                        </div>
                    `).join('')}
                </div>
                <div class="form-group"><label class="form-label">Upload New Picture</label><input type="file" class="form-control" accept="image/*" onchange="CollegeModule.uploadImage(this)"></div>
            </div>
        `;
    },

    updateProfile: (e) => {
        e.preventDefault();
        const updateData = {
            Seats: parseInt(document.getElementById('prof-seats').value), Fee: parseInt(document.getElementById('prof-fee').value),
            Deadline: document.getElementById('prof-deadline').value, ContactEmail: document.getElementById('prof-email').value,
            Programs: document.getElementById('prof-programs').value.split(',').map(s => s.trim()),
            MeritCutoff: parseInt(document.getElementById('prof-cutoff').value),
            Description: document.getElementById('prof-desc').value
        };
        DB.update('Colleges', c => c.CollegeID === App.currentUser.CollegeID, updateData);
        App.currentUser = { ...App.currentUser, ...updateData };
        localStorage.setItem('pakEduUser', JSON.stringify(App.currentUser));
        App.showToast('Profile updated successfully!');
    },

    uploadImage: (input) => {
        if(input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const c = App.currentUser;
                if(!c.Images) c.Images = [];
                c.Images.push(e.target.result);
                DB.update('Colleges', col => col.CollegeID === c.CollegeID, { Images: c.Images });
                localStorage.setItem('pakEduUser', JSON.stringify(c));
                App.showToast('Image uploaded successfully!'); CollegeModule.renderProfile();
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    deleteImage: (index) => {
        const c = App.currentUser;
        if(c.Images && c.Images.length > index) {
            c.Images.splice(index, 1);
            DB.update('Colleges', col => col.CollegeID === c.CollegeID, { Images: c.Images });
            localStorage.setItem('pakEduUser', JSON.stringify(c));
            App.showToast('Image deleted.'); CollegeModule.renderProfile();
        }
    }
};
