const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../client/css/style.css');
const jsPath = path.join(__dirname, '../client/js/app.js');
const clientIndexPath = path.join(__dirname, '../client/index.html');
const rootIndexPath = path.join(__dirname, '../index.html');

console.log('--- FIXING DASHBOARD & UI MISALIGNMENTS ---');

// ==========================================
// 1. UPDATE CSS (client/css/style.css)
// ==========================================
let css = fs.readFileSync(cssPath, 'utf8');

const dashboardCssFixes = `
/* =========================================================
   DASHBOARD & TOPBAR MISALIGNMENT FIXES
   ========================================================= */

/* Topbar & Collapse Toggle */
.topbar {
  background: #ffffff !important;
  border-bottom: 1px solid #e2e8f0 !important;
  padding: 0.75rem 1.5rem !important;
  min-height: 64px;
  box-sizing: border-box;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 90 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

.topbar-left {
  display: flex !important;
  align-items: center !important;
  gap: 0.85rem !important;
}

.collapse-toggle {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 38px !important;
  height: 38px !important;
  border-radius: 9px !important;
  border: 1px solid #e2e8f0 !important;
  background: #ffffff !important;
  color: #334155 !important;
  cursor: pointer !important;
  transition: all 0.15s ease !important;
  padding: 0 !important;
}
.collapse-toggle:hover {
  background: #f8fafc !important;
  color: #2563eb !important;
  border-color: #cbd5e1 !important;
}
.collapse-toggle svg {
  width: 20px !important;
  height: 20px !important;
}

.search-box {
  display: flex !important;
  align-items: center !important;
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 10px !important;
  padding: 0.45rem 0.85rem !important;
  gap: 0.5rem !important;
  width: 280px !important;
  height: 38px !important;
  box-sizing: border-box !important;
  transition: all 0.18s ease !important;
}
.search-box:focus-within {
  background: #ffffff !important;
  border-color: #2563eb !important;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12) !important;
}

/* Stat KPI Cards - Clean & Responsive */
.stats-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important;
  gap: 1.25rem !important;
  margin-bottom: 1.5rem !important;
}

.stat-card {
  background: #ffffff !important;
  border-radius: 14px !important;
  padding: 1.25rem 1.35rem !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
  border: 1px solid #e2e8f0 !important;
  display: flex !important;
  align-items: flex-start !important;
  justify-content: space-between !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  box-sizing: border-box !important;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.08) !important;
  border-color: #cbd5e1 !important;
}

.stat-info h3 {
  font-size: 0.82rem !important;
  font-weight: 600 !important;
  color: #64748b !important;
  margin: 0 0 0.4rem 0 !important;
  letter-spacing: -0.01em;
}
.stat-info .value {
  font-size: 1.85rem !important;
  font-weight: 800 !important;
  color: #0f172a !important;
  letter-spacing: -0.03em !important;
  line-height: 1.1 !important;
}
.stat-info .change {
  font-size: 0.76rem !important;
  font-weight: 600 !important;
  margin-top: 0.45rem !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.25rem !important;
}
.change.up { color: #059669 !important; }
.change.down { color: #dc2626 !important; }

.stat-icon {
  width: 46px !important;
  height: 46px !important;
  border-radius: 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
}
.stat-icon svg {
  width: 22px !important;
  height: 22px !important;
}

/* Status Badges */
.badge {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.35rem !important;
  padding: 0.28rem 0.75rem !important;
  border-radius: 999px !important;
  font-size: 0.74rem !important;
  font-weight: 600 !important;
  line-height: 1 !important;
  white-space: nowrap !important;
}
.badge.active {
  background: #ecfdf5 !important;
  color: #065f46 !important;
  border: 1px solid #a7f3d0 !important;
}
.badge.on-leave {
  background: #fffbeb !important;
  color: #b45309 !important;
  border: 1px solid #fde68a !important;
}
.badge.probation {
  background: #eff6ff !important;
  color: #1e40af !important;
  border: 1px solid #bfdbfe !important;
}
.badge.inactive {
  background: #f1f5f9 !important;
  color: #475569 !important;
  border: 1px solid #cbd5e1 !important;
}
.badge.pending {
  background: #fffbeb !important;
  color: #b45309 !important;
  border: 1px solid #fde68a !important;
}
.badge.approved {
  background: #ecfdf5 !important;
  color: #065f46 !important;
  border: 1px solid #a7f3d0 !important;
}
.badge.rejected {
  background: #fef2f2 !important;
  color: #991b1b !important;
  border: 1px solid #fecaca !important;
}

/* Grid-2 & Card Layout Balance */
.grid-2 {
  display: grid !important;
  grid-template-columns: 1.45fr 1fr !important;
  gap: 1.25rem !important;
  margin-bottom: 1.5rem !important;
  align-items: stretch !important;
}
.grid-2 > .card {
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
  margin-bottom: 0 !important;
}
.grid-2 > .card > .card-body {
  flex: 1 !important;
  padding: 1.25rem 1.5rem !important;
}

/* Pending Leave Requests - Clean Item Layout */
.leave-item {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 0.85rem 0.5rem !important;
  border-bottom: 1px solid #f1f5f9 !important;
  gap: 0.75rem !important;
  transition: background 0.15s ease !important;
}
.leave-item:last-child {
  border-bottom: none !important;
}
.leave-item:hover {
  background: #f8fafc !important;
  border-radius: 8px !important;
}

.leave-info {
  display: flex !important;
  align-items: center !important;
  gap: 0.75rem !important;
  min-width: 0 !important;
}

.leave-dates {
  font-size: 0.76rem !important;
  color: #64748b !important;
  margin-top: 0.15rem !important;
}

/* Table Wrap Clean Scrollbars without ghost thumbs */
.table-wrap {
  overflow-x: auto !important;
  scrollbar-width: thin !important;
}
.table-wrap table {
  width: 100% !important;
  border-collapse: collapse !important;
}

@media (max-width: 992px) {
  .grid-2 {
    grid-template-columns: 1fr !important;
  }
}
`;

css += '\n' + dashboardCssFixes;
fs.writeFileSync(cssPath, css, 'utf8');
console.log('Appended dashboard layout and alignment CSS to client/css/style.css');

// ==========================================
// 2. UPDATE JS (client/js/app.js)
// ==========================================
let js = fs.readFileSync(jsPath, 'utf8');

// Fix avImg function to properly handle Base64 / data URLs and initials
const newAvImg = `    function avImg(e) {
      if (!e) return '?';
      const ph = (getPhotos(), photoMap)[e.id] || (e.avatar && (e.avatar.startsWith('data:') || e.avatar.startsWith('http') || e.avatar.startsWith('/')) ? e.avatar : null);
      if (ph) return \`<img src="\${ph}" alt="\${esc(e.name || '')}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block;" />\`;
      if (e.avatar && e.avatar.length <= 4 && !e.avatar.includes(';')) return esc(e.avatar);
      const initials = (e.name || '').split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
      return initials || '?';
    }`;

const avImgRegex = /function avImg\(e\)\s*\{[\s\S]*?return\s+ph\s*\?[\s\S]*?;\s*\}/;
if (avImgRegex.test(js)) {
  js = js.replace(avImgRegex, newAvImg);
  console.log('Replaced avImg with image/initials renderer');
} else {
  console.log('Warning: Could not match avImg regex');
}

// Update renderDashboard to put the 4 KPI stat cards at the top, then Attendance, then Recent items
const newRenderDashboard = `    function renderDashboard() {
      const emps = getEmployees();
      const leaves = getLeaves();
      const pendingLeaves = leaves.filter(l => l.status === 'pending');
      const onLeave = emps.filter(e => e.status === 'on-leave').length;
      const active = emps.filter(e => e.status === 'active' || e.status === 'probation').length;
      const activities = getActivities().slice(0, 6);

      const kpis = \`
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-info">
              <h3>Total Employees</h3>
              <div class="value">\${emps.length}</div>
              <div class="change up">\${active} active staff</div>
            </div>
            <div class="stat-icon blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-info">
              <h3>Active Staff</h3>
              <div class="value">\${active}</div>
              <div class="change up">\${emps.length ? Math.round(active / emps.length * 100) : 0}% attendance rate</div>
            </div>
            <div class="stat-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-info">
              <h3>On Leave</h3>
              <div class="value">\${onLeave}</div>
              <div class="change down">\${pendingLeaves.length} pending \${pendingLeaves.length === 1 ? 'request' : 'requests'}</div>
            </div>
            <div class="stat-icon amber">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-info">
              <h3>Pending Approvals</h3>
              <div class="value">\${pendingLeaves.length}</div>
              <div class="change up">Awaiting review</div>
            </div>
            <div class="stat-icon purple">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
        </div>
      \`;

      const mainGrids = \`
        <div class="grid-2">
          <div class="card">
            <div class="card-header">
              <h2>Recent Employees</h2>
              <a href="#" class="link" onclick="navigate('employees'); return false;">View all</a>
            </div>
            <div class="card-body table-wrap">
              \${emps.length === 0 ? '<div class="empty-state">No employees yet. Add one!</div>' : \`
              <table>
                <thead><tr><th>Employee</th><th>Department</th><th>Status</th></tr></thead>
                <tbody>
                  \${emps.slice(0, 5).map(e => \`
                    <tr>
                      <td>
                        <div class="emp-cell">
                          <div class="emp-avatar" style="background:\${e.color}">\${avImg(e)}</div>
                          <div>
                            <div class="emp-name">\${e.name}</div>
                            <div class="emp-email">\${e.role}</div>
                          </div>
                        </div>
                      </td>
                      <td class="dept-tag">\${e.dept}</td>
                      <td>\${statusBadge(e.status)}</td>
                    </tr>
                  \`).join('')}
                </tbody>
              </table>\`}
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h2>Pending Leave Requests</h2>
              <a href="#" class="link" onclick="navigate('leave'); return false;">View all</a>
            </div>
            <div class="card-body" style="display:flex; flex-direction:column; justify-content:space-between">
              <div>
                \${pendingLeaves.length === 0 ? '<div class="empty-state" style="padding:2rem">No pending leave requests</div>' :
                  pendingLeaves.slice(0, 4).map(l => {
                    const emp = findEmployee(l.empId);
                    return \`
                    <div class="leave-item">
                      <div class="leave-info">
                        <div class="emp-avatar" style="background:\${emp?.color || '#64748b'}">\${avImg(emp)}</div>
                        <div>
                          <div class="emp-name">\${emp?.name || 'Unknown'}</div>
                          <div class="leave-dates">\${l.type} &bull; \${formatDate(l.from)} &mdash; \${formatDate(l.to)}</div>
                        </div>
                      </div>
                      <div class="btn-group">
                        <button class="btn btn-approve btn-sm" onclick="updateLeaveStatus('\${l.id}','approved')">Approve</button>
                        <button class="btn btn-reject btn-sm" onclick="updateLeaveStatus('\${l.id}','rejected')">Reject</button>
                      </div>
                    </div>\`;
                  }).join('')}
              </div>
              <div style="margin-top:1rem; padding:0.75rem 1rem; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; color:#64748b">
                <span>Active pending queue: <strong>\${pendingLeaves.length}</strong></span>
                <a href="#" onclick="navigate('leave'); return false;" style="color:#2563eb; font-weight:600; text-decoration:none">Manage Leaves &rarr;</a>
              </div>
            </div>
          </div>
        </div>

        <div class="grid-2">
          <div class="card">
            <div class="card-header">
              <h2>Recent Activity</h2>
              <span class="dept-tag" style="font-size:0.75rem">Live Logs</span>
            </div>
            <div class="card-body">
              <ul class="activity-list">
                \${activities.length === 0 ? '<li class="activity-item"><div class="activity-content"><div class="activity-text">No activity yet</div></div></li>' :
                  activities.map(a => {
                    const text = a.text || a.action || (a.user ? \`\${a.user}: Activity logged\` : 'System activity');
                    const time = timeAgo(a.time || a.createdAt || a.timestamp);
                    const color = a.color || (a.type === 'success' ? 'green' : a.type === 'warning' ? 'amber' : a.type === 'danger' || a.type === 'error' ? 'red' : 'blue');
                    return \`
                    <li class="activity-item">
                      <div class="activity-dot \${color}"></div>
                      <div class="activity-content">
                        <div class="activity-text">\${text}</div>
                        <div class="activity-time">\${time}</div>
                      </div>
                    </li>\`;
                  }).join('')}
              </ul>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h2>Quick Actions</h2>
              <span class="dept-tag" style="font-size:0.75rem">Shortcuts</span>
            </div>
            <div class="card-body">
              <div class="quick-actions">
                <button class="btn btn-primary" onclick="openAddEmpModal()" style="width:100%; justify-content:center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                  <span>Add New Employee</span>
                </button>
                <button class="btn btn-secondary" onclick="openModal('leaveModal')" style="width:100%; justify-content:center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75"/></svg>
                  <span>Apply for Leave</span>
                </button>
                <button class="btn btn-secondary" onclick="navigate('attendance')" style="width:100%; justify-content:center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span>Mark Attendance</span>
                </button>
                <button class="btn btn-secondary" onclick="navigate('payroll')" style="width:100%; justify-content:center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                  <span>Process Payroll</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      \`;

      return kpis + renderAttDash() + mainGrids;
    }`;

// Replace renderDashboard in client/js/app.js
js = js.replace(/function renderDashboard\(\)\s*\{[\s\S]*?return\s+renderAttDash\(\)\s*\+\s*renderDashboardBase\(\);\s*\}/, newRenderDashboard);

fs.writeFileSync(jsPath, js, 'utf8');
console.log('Saved aligned dashboard in client/js/app.js');

// Bump cache version to v=2.7.0 in all HTML files
[clientIndexPath, rootIndexPath].forEach(p => {
  if (fs.existsSync(p)) {
    let html = fs.readFileSync(p, 'utf8');
    html = html.replace(/style\.css\?v=[0-9.]+/g, 'style.css?v=2.7.0');
    html = html.replace(/app\.js\?v=[0-9.]+/g, 'app.js?v=2.7.0');
    fs.writeFileSync(p, html, 'utf8');
    console.log('Updated cache version to v=2.7.0 in ' + p);
  }
});

console.log('--- DASHBOARD MISALIGNMENTS FIXED SUCCESSFULLY ---');
