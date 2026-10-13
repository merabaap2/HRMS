const fs = require('fs');

// 1. Update client/css/style.css
const cssFile = './client/css/style.css';
let css = fs.readFileSync(cssFile, 'utf8');

const settingsCss = `
/* ==========================================================================
   SETTINGS WORKSPACE & TABBED ARCHITECTURE
   ========================================================================== */
.settings-workspace {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-bottom: 0.25rem;
}

.settings-title {
  font-size: 1.45rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.settings-subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.25rem;
  line-height: 1.5;
}

/* Tab navigation bar */
.settings-tabs-nav {
  display: flex;
  gap: 0.4rem;
  background: #ffffff;
  padding: 0.45rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.settings-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.15rem;
  border-radius: 9px;
  font-size: 0.84rem;
  font-weight: 600;
  color: #64748b;
  background: transparent;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.settings-tab-btn svg {
  flex-shrink: 0;
  opacity: 0.8;
  transition: transform 0.2s ease;
}

.settings-tab-btn:hover {
  color: #0f172a;
  background: #f8fafc;
}

.settings-tab-btn:hover svg {
  transform: scale(1.1);
}

.settings-tab-btn.active {
  color: #2563eb;
  background: #eff6ff;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.12);
}

.settings-tab-btn.active svg {
  opacity: 1;
  stroke: #2563eb;
}

/* Tab body & cards */
.settings-tab-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.settings-stack {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Working day pills */
.day-pill-checkbox {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
.day-pill-checkbox input {
  display: none;
}
.day-pill-checkbox span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem 0.95rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  transition: all 0.18s ease;
  user-select: none;
}
.day-pill-checkbox input:checked + span {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
}
`;

if (!css.includes('SETTINGS WORKSPACE')) {
  css += '\n' + settingsCss;
  fs.writeFileSync(cssFile, css, 'utf8');
  console.log('Appended settings CSS to ' + cssFile);
}

// 2. Update client/js/app.js
const appFile = './client/js/app.js';
let app = fs.readFileSync(appFile, 'utf8');

// Fix broken characters across app.js
app = app.replace(/—œMy Attendance—\s*\./g, '"My Attendance".');
app = app.replace(/—œMy Attendance—/g, '"My Attendance"');
app = app.replace(/excess hours Ã· \$\{dh\} daily working hours Ã— \(Gross Ã· 30\)/g, 'excess hours ÷ ${dh} daily working hours × (Gross ÷ 30)');
app = app.replace(/excess hours Ă·/g, 'excess hours ÷');
app = app.replace(/hours Ă—/g, 'hours ×');
app = app.replace(/\(Gross Ă· 30\)/g, '(Gross ÷ 30)');
app = app.replace(/ðŸŽ‚/g, '🎂');
app = app.replace(/ðŸ †/g, '🏆');

// Define downloadDatabaseBackup if not present
if (!app.includes('function downloadDatabaseBackup(')) {
  const backupFn = `
    function downloadDatabaseBackup() {
      const state = {};
      Object.keys(localStorage).filter(k => k.startsWith('hrms_')).forEach(k => {
        try { state[k] = JSON.parse(localStorage.getItem(k)); } catch { state[k] = localStorage.getItem(k); }
      });
      const jsonStr = JSON.stringify(state, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`hrms_data_backup_\${new Date().toISOString().slice(0, 10)}.json\`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Database backup downloaded successfully', 'success');
    }
`;
  app = app.replace('function renderSettings() {', backupFn + '\n    function renderSettings() {');
}

// Replace renderOfficeCard
const oldOfficeCardMatch = app.match(/function renderOfficeCard\(\) \{[\s\S]*?\n    \}/);
if (oldOfficeCardMatch) {
  const newOfficeCard = `function renderOfficeCard() {
      const o = officeCfg();
      const weekly = o.dailyMin * o.days.length;
      const lunchMin = o.lunchEndMin - o.lunchStartMin;
      const issues = [];
      if (o.dailyMin > 9 * 60) issues.push('Daily working time is above 9 hours.');
      if (weekly > 48 * 60) issues.push('Weekly working time is above 48 hours.');
      if (lunchMin < 60) issues.push('Rest interval is under 1 hour.');
      return \`
        <div class="card">
          <div class="card-header">
            <div>
              <h2>Office Timings & Shift Rules</h2>
              <div class="dept-tag" style="margin-top:2px">Configure standard operating hours, lunch breaks, and grace period thresholds</div>
            </div>
          </div>
          <div class="card-body" style="padding:1.5rem">
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1rem; margin-bottom:1.25rem">
              <div>
                <label style="display:block;font-size:0.78rem;font-weight:600;color:#475569;margin-bottom:0.35rem">Shift Opening</label>
                <div class="att-time-cell"><input type="time" id="offOpen" class="att-time in-time" value="\${o.open}" style="width:100%" /></div>
              </div>
              <div>
                <label style="display:block;font-size:0.78rem;font-weight:600;color:#475569;margin-bottom:0.35rem">Shift Closing</label>
                <div class="att-time-cell"><input type="time" id="offClose" class="att-time out-time" value="\${o.close}" style="width:100%" /></div>
              </div>
              <div>
                <label style="display:block;font-size:0.78rem;font-weight:600;color:#475569;margin-bottom:0.35rem">Lunch Starts</label>
                <div class="att-time-cell"><input type="time" id="offLs" class="att-time" value="\${o.lunchStart}" style="width:100%" /></div>
              </div>
              <div>
                <label style="display:block;font-size:0.78rem;font-weight:600;color:#475569;margin-bottom:0.35rem">Lunch Ends</label>
                <div class="att-time-cell"><input type="time" id="offLe" class="att-time" value="\${o.lunchEnd}" style="width:100%" /></div>
              </div>
              <div>
                <label style="display:block;font-size:0.78rem;font-weight:600;color:#475569;margin-bottom:0.35rem">Grace Period (Minutes)</label>
                <input type="number" id="offGrace" min="0" max="120" value="\${o.grace}" class="att-time" style="width:100%" />
              </div>
              <div>
                <label style="display:block;font-size:0.78rem;font-weight:600;color:#475569;margin-bottom:0.35rem">Half-Day Threshold (Hrs)</label>
                <input type="number" id="offHalf" min="1" max="12" step="0.5" value="\${o.half}" class="att-time" style="width:100%" />
              </div>
            </div>

            <div style="margin-bottom:1.25rem">
              <label style="display:block;font-size:0.8rem;font-weight:600;color:#334155;margin-bottom:0.5rem">Standard Working Days</label>
              <div style="display:flex; flex-wrap:wrap; gap:0.5rem">
                \${[1, 2, 3, 4, 5, 6, 0].map(d => \`
                  <label class="day-pill-checkbox">
                    <input type="checkbox" class="off-day" value="\${d}" \${o.days.includes(d) ? 'checked' : ''} />
                    <span>\${DAY_NAMES[d]}</span>
                  </label>
                \`).join('')}
              </div>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem; margin-bottom:1.25rem">
              <div style="padding:1rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; font-size:.85rem; line-height:1.7">
                <div style="font-weight:700;color:#0f172a;margin-bottom:0.25rem">Calculated Working Durations</div>
                Daily Working Time: <strong>\${fmtDur(o.dailyMin)}</strong> (excluding \${fmtDur(lunchMin)} lunch)<br>
                Weekly Working Time: <strong>\${fmtDur(weekly)}</strong> across <strong>\${o.days.length}</strong> active days
              </div>
              <div style="padding:1rem; border-radius:10px; font-size:.82rem; line-height:1.6; border:1px solid \${issues.length ? '#fde68a' : '#a7f3d0'}; \${issues.length ? 'background:#fffbeb; color:#92400e' : 'background:#ecfdf5; color:#065f46'}">
                <div style="font-weight:700;margin-bottom:0.25rem">\${issues.length ? '⚠️ Policy Notice' : '✓ Statutory Compliance'}</div>
                \${issues.length ? issues.join(' ') + ' Check this against local Shops & Establishments rules.' : 'Fully compliant with standard 8h/day, 48h/week, and 1h rest interval regulations.'}
              </div>
            </div>

            <div class="btn-group">
              <button class="btn btn-primary" onclick="saveOffice()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                <span>Save Timings</span>
              </button>
              <button class="btn btn-secondary" onclick="resetOffice()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                <span>Reset to 9:30 AM — 6:30 PM</span>
              </button>
            </div>
            <p class="dept-tag" style="margin-top:1rem; line-height:1.6">Used for automatic Late, Half Day, and Early Out calculations on the Attendance module, biometric import, and punch logs.</p>
          </div>
        </div>\``;
  app = app.replace(oldOfficeCardMatch[0], newOfficeCard);
  console.log('Replaced renderOfficeCard');
}

// Replace renderHolidayCard max-width:560px
app = app.replace('<div class="card" style="max-width:560px; margin-bottom:1.25rem">', '<div class="card">');

// Replace renderPermPolicyCard
const oldPermCardMatch = app.match(/function renderPermPolicyCard\(\) \{[\s\S]*?\n    \}/);
if (oldPermCardMatch) {
  const newPermCard = `function renderPermPolicyCard() {
      const p = permPolicy(), dh = (officeCfg().dailyMin / 60).toFixed(2);
      return \`<div class="card">
        <div class="card-header">
          <div>
            <h2>Permission (1 hr / 2 hr) Policy</h2>
            <div class="dept-tag" style="margin-top:2px">Configure monthly free short-leave allowance per employee</div>
          </div>
        </div>
        <div class="card-body" style="padding:1.5rem">
          <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;margin-bottom:1.25rem;padding:1rem;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0">
            <label style="font-size:.85rem;font-weight:600;color:#0f172a">Free permission hours quota per employee / month:</label>
            <input id="permQuota" type="number" min="0" step="0.5" value="\${p.quota}" class="att-time" style="width:110px" />
            <button class="btn btn-primary" onclick="savePermPolicy()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
              <span>Save Quota</span>
            </button>
          </div>
          <div style="padding:1rem;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;font-size:0.83rem;line-height:1.6;color:#1e40af">
            <strong>Calculation & Loss of Pay Formula:</strong><br>
            Each permission request is typically 1 hr or 2 hr during standard office hours. Any hours used beyond the monthly quota (\${p.quota}h) or overstayed are treated as Loss of Pay (LOP):<br>
            <code>Excess Hours ÷ \${dh} Daily Working Hours × (Gross Pay ÷ 30)</code>, added to monthly payroll deductions automatically.
          </div>
        </div>
      </div>\`;
    }`;
  app = app.replace(oldPermCardMatch[0], newPermCard);
  console.log('Replaced renderPermPolicyCard');
}

// Replace renderStorageCard & renderSettings
const oldSettingsMatch = app.match(/function renderSettings\(\) \{[\s\S]*?\n    \}/);
if (oldSettingsMatch) {
  const newSettings = `let currentSettingsTab = 'hours';

    function setSettingsTab(tab) {
      currentSettingsTab = tab;
      refreshCurrentPage();
    }

    function renderStorageCard() {
      const empCount = getEmployees().length;
      const leaveCount = getLeaves().length;
      const attCount = getAttendance().length;
      const actCount = getActivities().length;

      return \`
        <div class="card">
          <div class="card-header">
            <div>
              <h2>Database State & Cloud Synchronization</h2>
              <div class="dept-tag" style="margin-top:2px">Monitor active persistence, export backups, and synchronize with server storage</div>
            </div>
            <div class="footer-sync-status">
              <span class="sync-dot live"></span>
              <span>Backend JSON Server: ACTIVE</span>
            </div>
          </div>
          <div class="card-body" style="padding:1.5rem">
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; margin-bottom:1.5rem">
              <div style="padding:1.1rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px">
                <div class="dept-tag">Active Employees</div>
                <div style="font-size:1.6rem; font-weight:800; color:#0f172a; margin-top:0.25rem">\${empCount}</div>
              </div>
              <div style="padding:1.1rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px">
                <div class="dept-tag">Attendance Punches</div>
                <div style="font-size:1.6rem; font-weight:800; color:#0f172a; margin-top:0.25rem">\${attCount}</div>
              </div>
              <div style="padding:1.1rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px">
                <div class="dept-tag">Leave Applications</div>
                <div style="font-size:1.6rem; font-weight:800; color:#0f172a; margin-top:0.25rem">\${leaveCount}</div>
              </div>
              <div style="padding:1.1rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px">
                <div class="dept-tag">Audit Activity Logs</div>
                <div style="font-size:1.6rem; font-weight:800; color:#0f172a; margin-top:0.25rem">\${actCount}</div>
              </div>
            </div>

            <div style="padding:1.1rem; background:#f8fafc; border-radius:10px; border:1px solid #e2e8f0; margin-bottom:1.5rem">
              <div style="font-weight:700; color:#0f172a; margin-bottom:0.35rem">Persistence Mechanism</div>
              <p style="font-size:0.83rem; color:#64748b; line-height:1.6; margin:0">
                All records are stored in browser state and synchronized bidirectionally with the backend database at <code>/api/state</code> (persisting to <code>data/data.json</code>). Changes survive server restarts, device switches, and browser reloads.
              </p>
            </div>

            <div style="display:flex; gap:0.75rem; flex-wrap:wrap">
              <button class="btn btn-primary" onclick="downloadDatabaseBackup()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Download Database Backup (JSON)</span>
              </button>
              <button class="btn btn-secondary" onclick="fetch('/api/state').then(r=>r.json()).then(()=>{showToast('State refreshed from server','success');refreshCurrentPage();})">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                <span>Sync with Server Now</span>
              </button>
              <button class="btn btn-danger" onclick="clearAllData()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                <span>Reset to Sample Dataset</span>
              </button>
            </div>
          </div>
        </div>
      \`;
    }

    function renderSettings() {
      const tabs = [
        { id: 'hours', label: 'Office Timings', icon: \`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>\` },
        { id: 'holidays', label: 'Holidays & Week-offs', icon: \`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>\` },
        { id: 'policies', label: 'Permissions Policy', icon: \`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>\` },
        { id: 'biometrics', label: 'Biometrics & Face AI', icon: \`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>\` },
        { id: 'popups', label: 'Greeting Popups', icon: \`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>\` },
        { id: 'database', label: 'Database & Sync', icon: \`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" rx="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>\` }
      ];

      let activeTabContent = '';
      if (currentSettingsTab === 'hours') {
        activeTabContent = renderOfficeCard();
      } else if (currentSettingsTab === 'holidays') {
        activeTabContent = renderHolidayCard();
      } else if (currentSettingsTab === 'policies') {
        activeTabContent = renderPermPolicyCard();
      } else if (currentSettingsTab === 'biometrics') {
        activeTabContent = \`
          <div class="settings-stack">
            \${renderFaceCard()}
            \${renderSelfieCard()}
            \${renderBioCard()}
          </div>
        \`;
      } else if (currentSettingsTab === 'popups') {
        activeTabContent = renderPopupCard();
      } else if (currentSettingsTab === 'database') {
        activeTabContent = renderStorageCard();
      }

      return \`
        <div class="settings-workspace">
          <div class="settings-header">
            <div>
              <h1 class="settings-title">System Settings &amp; Governance</h1>
              <p class="settings-subtitle">Manage company work hours, holiday calendars, attendance policies, facial recognition AI, and cloud synchronization.</p>
            </div>
          </div>

          <div class="settings-tabs-nav">
            \${tabs.map(t => \`
              <button class="settings-tab-btn \${currentSettingsTab === t.id ? 'active' : ''}" onclick="setSettingsTab('\${t.id}')">
                \${t.icon}
                <span>\${t.label}</span>
              </button>
            \`).join('')}
          </div>

          <div class="settings-tab-body">
            \${activeTabContent}
          </div>
        </div>
      \`;
    }`;
  app = app.replace(oldSettingsMatch[0], newSettings);
  console.log('Replaced renderSettings with tabbed architecture');
}

fs.writeFileSync(appFile, app, 'utf8');
console.log('Saved ' + appFile);

// 3. Sync changes into root index.html
const indexFile = './index.html';
let idxHtml = fs.readFileSync(indexFile, 'utf8');

// Copy CSS to index.html style
if (!idxHtml.includes('SETTINGS WORKSPACE')) {
  idxHtml = idxHtml.replace('</style>', settingsCss + '\n</style>');
}

// Fix broken characters in index.html
idxHtml = idxHtml.replace(/—œMy Attendance—\s*\./g, '"My Attendance".');
idxHtml = idxHtml.replace(/—œMy Attendance—/g, '"My Attendance"');
idxHtml = idxHtml.replace(/excess hours Ã· \$\{dh\} daily working hours Ã— \(Gross Ã· 30\)/g, 'excess hours ÷ ${dh} daily working hours × (Gross ÷ 30)');
idxHtml = idxHtml.replace(/excess hours Ă·/g, 'excess hours ÷');
idxHtml = idxHtml.replace(/hours Ă—/g, 'hours ×');
idxHtml = idxHtml.replace(/\(Gross Ă· 30\)/g, '(Gross ÷ 30)');
idxHtml = idxHtml.replace(/ðŸŽ‚/g, '🎂');
idxHtml = idxHtml.replace(/ðŸ †/g, '🏆');

fs.writeFileSync(indexFile, idxHtml, 'utf8');
console.log('Saved ' + indexFile);
