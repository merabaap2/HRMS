const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../client/css/style.css');
const jsPath = path.join(__dirname, '../client/js/app.js');
const indexClientPath = path.join(__dirname, '../client/index.html');
const indexRootPath = path.join(__dirname, '../index.html');

console.log('--- STARTING COMPREHENSIVE UI/UX UPGRADE ---');

// ==========================================
// 1. UPDATE CSS (Buttons, Inputs, Responsiveness)
// ==========================================
let css = fs.readFileSync(cssPath, 'utf8');

const enhancedCss = `
/* =========================================================
   EXECUTIVE ACTION BUTTONS & FORM INPUT ENHANCEMENTS
   ========================================================= */

/* Action Button Variants */
.btn-approve {
  background: #ecfdf5 !important;
  color: #065f46 !important;
  border: 1px solid #a7f3d0 !important;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(16, 185, 129, 0.08);
}
.btn-approve:hover {
  background: #10b981 !important;
  color: #ffffff !important;
  border-color: #059669 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.28);
}

.btn-reject {
  background: #fff1f2 !important;
  color: #9f1239 !important;
  border: 1px solid #fecdd3 !important;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(225, 29, 72, 0.08);
}
.btn-reject:hover {
  background: #e11d48 !important;
  color: #ffffff !important;
  border-color: #be123c !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(225, 29, 72, 0.28);
}

.btn-edit {
  background: #eff6ff !important;
  color: #1d4ed8 !important;
  border: 1px solid #bfdbfe !important;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.08);
}
.btn-edit:hover {
  background: #2563eb !important;
  color: #ffffff !important;
  border-color: #1d4ed8 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.28);
}

.btn-delete {
  background: #fef2f2 !important;
  color: #b91c1c !important;
  border: 1px solid #fecaca !important;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(239, 68, 68, 0.08);
}
.btn-delete:hover {
  background: #ef4444 !important;
  color: #ffffff !important;
  border-color: #dc2626 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.28);
}

/* Base button responsiveness */
.btn {
  white-space: nowrap;
  user-select: none;
  font-family: inherit;
}
.btn:active {
  transform: scale(0.98) translateY(0) !important;
}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

/* Universal Inputs & Selects Polish */
input[type="time"],
input[type="date"],
input[type="text"],
input[type="password"],
input[type="email"],
input[type="number"],
input[type="month"],
input[type="tel"],
select,
textarea {
  font-family: inherit;
  font-size: 0.86rem;
  color: #0f172a;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.55rem 0.85rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  box-sizing: border-box;
}

input[type="time"]:focus,
input[type="date"]:focus,
input[type="text"]:focus,
input[type="password"]:focus,
input[type="email"]:focus,
input[type="number"]:focus,
input[type="month"]:focus,
input[type="tel"]:focus,
select:focus,
textarea:focus {
  border-color: #2563eb !important;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.16) !important;
  outline: none !important;
}

/* Custom File Upload Input */
.custom-file-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.custom-file-wrap input[type="file"] {
  font-size: 0.8rem;
  color: #475569;
  padding: 0.4rem;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.18s ease;
}
.custom-file-wrap input[type="file"]:hover {
  border-color: #2563eb;
  background: #eff6ff;
}

/* Settings Workspace & Layout Grid */
.settings-workspace {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.settings-title {
  font-size: 1.45rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
  margin: 0 0 0.35rem;
}

.settings-subtitle {
  font-size: 0.84rem;
  color: #64748b;
  margin: 0;
  max-width: 800px;
  line-height: 1.5;
}

/* Executive Tabs Navigation Bar */
.settings-tabs-nav {
  display: flex;
  gap: 0.5rem;
  padding: 0.4rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow-x: auto;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
}

.settings-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.84rem;
  font-weight: 600;
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

/* Section Callout Boxes */
.callout-box {
  padding: 1rem 1.15rem;
  border-radius: 10px;
  font-size: 0.83rem;
  line-height: 1.6;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}
.callout-box.info {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
}
.callout-box.success {
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #065f46;
}
.callout-box.warning {
  background: #fffbeb;
  border-color: #fde68a;
  color: #92400e;
}

/* Form Grid Rows */
.settings-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.1rem;
  margin-bottom: 1.25rem;
}

.settings-form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.settings-form-field label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
}

.settings-form-field .helper-text {
  font-size: 0.74rem;
  color: #64748b;
  line-height: 1.4;
}

/* Mobile & Tablet Responsiveness */
@media (max-width: 1024px) {
  .settings-form-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.85rem;
  }
}

@media (max-width: 768px) {
  .settings-tabs-nav {
    padding: 0.3rem;
    gap: 0.3rem;
  }
  .settings-tab-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.78rem;
  }
  .settings-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  .card-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 0.75rem !important;
  }
  .card-body {
    padding: 1.1rem !important;
  }
}
`;

if (!css.includes('.btn-approve {')) {
  css += '\n' + enhancedCss;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Appended comprehensive styles to client/css/style.css');
} else {
  console.log('Styles already present in client/css/style.css');
}

// ==========================================
// 2. UPDATE JS (app.js)
// ==========================================
let js = fs.readFileSync(jsPath, 'utf8');

// Fix Corrupted UTF-8 strings
js = js.replace(/LOP = Gross Ã· 30 Ã—/g, 'LOP = Gross ÷ 30 ×');
js = js.replace(/Basic Ã· 30/g, 'Basic ÷ 30');
js = js.replace(/Basic Ã· 30 Ã·/g, 'Basic ÷ 30 ÷');
js = js.replace(/Basic Ã· 30 Ã—/g, 'Basic ÷ 30 ×');
js = js.replace(/ðŸ †/g, '🏆');
js = js.replace(/ðŸŽ‰/g, '🎉');
js = js.replace(/ðŸŽ‚/g, '🎂');
js = js.replace(/models—¦/g, 'models...');
js = js.replace(/photos—¦/g, 'photos...');
js = js.replace(/location—¦/g, 'location...');

// New renderHolidayCard implementation
const newHolidayCard = `    function renderHolidayCard() {
      const w = weekoffCfg();
      const list = getHolidays().slice().sort((a, b) => a.date.slice(5).localeCompare(b.date.slice(5)) || a.date.localeCompare(b.date));
      return \`
        <div class="card" style="margin-bottom:1.5rem">
          <div class="card-header">
            <div>
              <h2>Weekly Off Schedule (Every Month)</h2>
              <div class="dept-tag" style="margin-top:2px">Configure standard recurring weekly rest days for statutory labor compliance</div>
            </div>
            <button class="btn btn-primary" onclick="saveWeekoff()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
              <span>Save Week-off Rules</span>
            </button>
          </div>
          <div class="card-body" style="padding:1.5rem">
            <div style="margin-bottom:1.25rem">
              <label style="display:block;font-size:0.8rem;font-weight:600;color:#334155;margin-bottom:0.6rem">Active Weekly Rest Days</label>
              <div style="display:flex; flex-wrap:wrap; gap:0.6rem">
                <label class="day-pill-checkbox">
                  <input type="checkbox" id="woSun" \${w.sunday ? 'checked' : ''} />
                  <span>Every Sunday</span>
                </label>
                \${[1, 2, 3, 4, 5].map(n => \`
                  <label class="day-pill-checkbox">
                    <input type="checkbox" class="wo-sat" value="\${n}" \${w.sats.includes(n) ? 'checked' : ''} />
                    <span>\${ordinal(n)} Saturday</span>
                  </label>
                \`).join('')}
              </div>
            </div>

            <div class="callout-box info">
              <div style="font-weight:700;margin-bottom:0.25rem">Active Rule in Force</div>
              Currently configured: <strong>\${weekoffSummary()}</strong>. Weekly offs and national holidays are protected paid rest days and never penalized as Loss of Pay (LOP).
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h2>Official Holiday Calendar &amp; Observances (\${list.length})</h2>
              <div class="dept-tag" style="margin-top:2px">Manage fixed and flexible company holidays across the calendar year</div>
            </div>
          </div>
          <div class="card-body" style="padding:1.5rem">
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; margin-bottom:1.5rem">
              <div style="font-size:0.86rem; font-weight:700; color:#0f172a; margin-bottom:0.85rem">Add New Holiday or Observance</div>
              <div class="settings-form-grid" style="margin-bottom:0.85rem">
                <div class="settings-form-field">
                  <label>Holiday Date</label>
                  <input type="date" id="holDate" style="width:100%" />
                </div>
                <div class="settings-form-field">
                  <label>Holiday Title / Occasion</label>
                  <input type="text" id="holName" placeholder="e.g. Republic Day, Diwali" style="width:100%" />
                </div>
                <div class="settings-form-field">
                  <label>Holiday Category</label>
                  <select id="holType" style="width:100%">
                    <option value="festival">Festival Holiday (Paid Off)</option>
                    <option value="national">National Holiday (Statutory Off)</option>
                    <option value="optional">Optional / Floating Holiday</option>
                  </select>
                </div>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem">
                <label style="display:flex; gap:0.5rem; align-items:center; font-size:0.82rem; font-weight:600; color:#475569; cursor:pointer">
                  <input type="checkbox" id="holYearly" style="width:16px; height:16px" />
                  <span>Repeat annually on this date (for fixed national days)</span>
                </label>
                <button class="btn btn-primary" onclick="addHoliday()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  <span>Add Holiday to Calendar</span>
                </button>
              </div>
            </div>

            <div class="table-wrap">
              \${list.length ? \`
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Holiday Name</th>
                      <th>Category</th>
                      <th>Frequency</th>
                      <th style="text-align:right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    \${list.map(h => \`
                      <tr>
                        <td>
                          <div style="font-weight:700; color:#0f172a">\${formatDate(h.date)}</div>
                        </td>
                        <td>
                          <div style="font-weight:600; color:#1e293b">\${esc(h.name)}</div>
                        </td>
                        <td>
                          <span class="badge \${h.type === 'national' ? 'active' : h.type === 'festival' ? 'probation' : 'inactive'}">
                            \${HOL_TYPES[h.type]}
                          </span>
                        </td>
                        <td class="dept-tag">
                          \${h.yearly ? 'Repeats Annually' : 'One-time Calendar Date'}
                        </td>
                        <td style="text-align:right">
                          <button class="btn btn-delete btn-sm" onclick="deleteHoliday('\${h.id}')">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            <span>Remove</span>
                          </button>
                        </td>
                      </tr>
                    \`).join('')}
                  </tbody>
                </table>
              \` : '<div class="empty-state">No holidays added to the calendar yet.</div>'}
            </div>
          </div>
        </div>\`;
    }`;

// Replace renderHolidayCard in js
const holRegex = /function renderHolidayCard\(\)\s*\{[\s\S]*?return\s*`[\s\S]*?`;\s*\}/;
if (holRegex.test(js)) {
  js = js.replace(holRegex, newHolidayCard);
  console.log('Replaced renderHolidayCard with executive layout');
} else {
  console.log('Warning: Could not match renderHolidayCard regex');
}

// New renderPopupCard implementation
const newPopupCard = `    function renderPopupCard() {
      const iso = localISO(), emps = getEmployees().filter(e => e.status !== 'inactive');
      const list = getPopups().slice().sort((a, b) => popFrom(a).localeCompare(popFrom(b)));
      const st = p => popType(p) === 'birthday' ? 'Auto' : p.yearly ? (popupOn(p, iso) ? 'Showing now' : 'Every year') : popTo(p) < iso ? 'Past' : popFrom(p) > iso ? 'Upcoming' : 'Showing now';
      return \`
        <div class="card" style="margin-bottom:1.5rem">
          <div class="card-header">
            <div>
              <h2>Greeting Popups &amp; Celebrations</h2>
              <div class="dept-tag" style="margin-top:2px">Configure automated login greetings, festival announcements, and birthday wishes</div>
            </div>
            <div style="display:flex; align-items:center; gap:0.6rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:0.35rem 0.75rem">
              <label style="font-size:0.78rem; font-weight:600; color:#475569">Auto-close timer:</label>
              <input id="popAuto" type="number" min="0" max="3600" value="\${popAutoSecs()}" style="width:65px; padding:0.25rem 0.5rem; text-align:center" />
              <span class="dept-tag">sec</span>
              <button class="btn btn-secondary btn-sm" onclick="savePopCfg()">Save</button>
            </div>
          </div>
          <div class="card-body" style="padding:1.5rem">
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; margin-bottom:1.5rem">
              <div style="font-size:0.86rem; font-weight:700; color:#0f172a; margin-bottom:0.85rem">Schedule New Greeting or Announcement</div>
              
              <div class="settings-form-grid" style="margin-bottom:1rem">
                <div class="settings-form-field">
                  <label>Occasion Type</label>
                  <select id="popKind" onchange="popFormType()" style="width:100%">
                    \${Object.entries(POP_KINDS).map(([k, v]) => \`<option value="\${k}">\${v}</option>\`).join('')}
                  </select>
                </div>
                <div class="settings-form-field" id="popEmpWrap" style="display:none">
                  <label>Target Employee</label>
                  <select id="popEmp" style="width:100%">
                    <option value="">Select employee...</option>
                    \${emps.map(e => \`<option value="\${e.id}">\${esc(e.name)} (\${esc(e.empCode || '')})</option>\`).join('')}
                  </select>
                </div>
                <div class="settings-form-field" style="grid-column: span 2">
                  <label>Celebration Title / Greeting Header</label>
                  <input id="popTitle" list="popIdeas" placeholder="e.g. Happy Diwali, Happy New Year" style="width:100%" />
                  <datalist id="popIdeas">\${POPUP_IDEAS.map(x => \`<option value="\${x}">\`).join('')}</datalist>
                  <datalist id="achIdeas">\${ACHIEVE_IDEAS.map(x => \`<option value="\${x}">\`).join('')}</datalist>
                </div>
              </div>

              <div id="popDates" class="settings-form-grid" style="margin-bottom:1rem">
                <div class="settings-form-field">
                  <label>Active From Date</label>
                  <input type="date" id="popFrom_" style="width:100%" onchange="if(!popTo_.value||popTo_.value<this.value)popTo_.value=this.value" />
                </div>
                <div class="settings-form-field">
                  <label>Active To Date</label>
                  <input type="date" id="popTo_" style="width:100%" />
                </div>
                <div class="settings-form-field">
                  <label>Banner Image (Required for festivals)</label>
                  <input type="file" id="popFile" accept="image/*" onchange="popupPick(this)" style="width:100%" />
                </div>
              </div>

              <div class="settings-form-field" style="margin-bottom:1rem">
                <label>Personal Message / Congratulatory Note (Optional)</label>
                <textarea id="popMsg" rows="2" placeholder="Write custom wishes shown to the employee or team..." style="width:100%"></textarea>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem">
                <label id="popYearlyWrap" style="display:flex; gap:0.5rem; align-items:center; font-size:0.82rem; font-weight:600; color:#475569; cursor:pointer">
                  <input type="checkbox" id="popYearly" style="width:16px; height:16px" />
                  <span>Repeat annually for recurring celebrations</span>
                </label>
                <button class="btn btn-primary" onclick="addPopup()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  <span>Publish Greeting Popup</span>
                </button>
              </div>
              <div id="popPrev" style="margin-top:0.75rem"></div>
            </div>

            <div class="table-wrap">
              \${list.length ? \`
                <table>
                  <thead>
                    <tr>
                      <th style="width:70px">Media</th>
                      <th>Greeting &amp; Occasion</th>
                      <th>Active Duration</th>
                      <th>Status</th>
                      <th style="text-align:right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    \${list.map(p => {
                      const t = popType(p);
                      const e = t === 'achievement' ? findEmployee(p.empId) : null;
                      return \`
                        <tr>
                          <td>
                            \${p.image ? \`<img src="\${p.image}" style="height:44px; width:44px; object-fit:cover; border-radius:8px; border:1px solid #e2e8f0" />\` : \`<div style="width:44px; height:44px; display:flex; align-items:center; justify-content:center; background:#eff6ff; border-radius:8px; font-size:1.4rem">\${t === 'birthday' ? '🎂' : '🏆'}</div>\`}
                          </td>
                          <td>
                            <div style="font-weight:700; color:#0f172a">\${esc(p.title)}</div>
                            <div class="dept-tag">\${POP_KINDS[t]}\${e ? ' · ' + esc(e.name) : ''}</div>
                          </td>
                          <td class="dept-tag">
                            \${t === 'birthday' ? "Automatic on each employee's DOB" : popRange(p) + ' · All Day'}
                          </td>
                          <td>
                            <span class="badge \${!p.enabled ? 'inactive' : st(p) === 'Past' ? 'on-leave' : 'active'}">
                              \${p.enabled ? st(p) : 'Disabled'}
                            </span>
                          </td>
                          <td style="text-align:right">
                            <div class="btn-group" style="justify-content:flex-end">
                              <button class="btn btn-secondary btn-sm" onclick="showPopupImage('\${p.id}')">Preview</button>
                              <button class="btn btn-secondary btn-sm" onclick="togglePopup('\${p.id}')">\${p.enabled ? 'Disable' : 'Enable'}</button>
                              <button class="btn btn-delete btn-sm" onclick="deletePopup('\${p.id}')">Delete</button>
                            </div>
                          </td>
                        </tr>
                      \`;
                    }).join('')}
                  </tbody>
                </table>
              \` : '<div class="empty-state">No scheduled greetings or popups configured.</div>'}
            </div>
          </div>
        </div>\`;
    }`;

// Replace renderPopupCard in js
const popRegex = /function renderPopupCard\(\)\s*\{[\s\S]*?return\s*`[\s\S]*?`;\s*\}/;
if (popRegex.test(js)) {
  js = js.replace(popRegex, newPopupCard);
  console.log('Replaced renderPopupCard with executive layout');
} else {
  console.log('Warning: Could not match renderPopupCard regex');
}

// New Biometrics renderFaceCard, renderSelfieCard, renderBioCard
const newFaceCard = `    function renderFaceCard() {
      const c = getFaceCfg();
      return \`
        <div class="card">
          <div class="card-header">
            <div>
              <h2>Facial Recognition &amp; AI Anti-Spoofing</h2>
              <div class="dept-tag" style="margin-top:2px">Compare live check-in selfies against registered employee photos</div>
            </div>
          </div>
          <div class="card-body" style="padding:1.5rem">
            <div class="settings-form-grid" style="align-items:flex-end">
              <div class="settings-form-field">
                <label>Operational Mode</label>
                <select id="faceMode" style="width:100%">
                  <option value="off" \${c.mode === 'off' ? 'selected' : ''}>Off (HR reviews visually)</option>
                  <option value="warn" \${c.mode === 'warn' ? 'selected' : ''}>Flag Mismatches for HR Approval</option>
                  <option value="block" \${c.mode === 'block' ? 'selected' : ''}>Block Check-in on Mismatch</option>
                </select>
                <div class="helper-text">Select how AI mismatches are handled during employee check-in</div>
              </div>
              <div class="settings-form-field">
                <label>Tolerance Strictness Threshold</label>
                <input id="faceThr" type="number" step="0.01" min="0.3" max="0.7" value="\${c.threshold}" style="width:100%" />
                <div class="helper-text">0.50 recommended (lower value = stricter face matching)</div>
              </div>
              <div class="settings-form-field">
                <button class="btn btn-primary" onclick="saveFaceCfg()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
                  <span>Save AI Config</span>
                </button>
              </div>
            </div>

            <div class="btn-group" style="margin-bottom:1rem">
              <button class="btn btn-secondary" onclick="faceTest()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                <span>Test Face Matching System</span>
              </button>
              <button class="btn btn-secondary" onclick="faceEnrollAll()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                <span>Validate Registered Employee Photos</span>
              </button>
            </div>
            <div id="faceOut" class="dept-tag" style="line-height:1.7"></div>
          </div>
        </div>\`;
    }`;

const newSelfieCard = `    function renderSelfieCard() {
      const g = getGeo(), rows = getSelfies().slice(0, 20);
      return \`
        <div class="card">
          <div class="card-header">
            <div>
              <h2>Office Geofencing &amp; GPS Radar</h2>
              <div class="dept-tag" style="margin-top:2px">Restrict employee mobile punch-ins to physical office boundaries</div>
            </div>
          </div>
          <div class="card-body" style="padding:1.5rem">
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; margin-bottom:1.5rem">
              <div style="font-size:0.86rem; font-weight:700; color:#0f172a; margin-bottom:0.85rem">Office Geolocation Coordinates</div>
              <div class="settings-form-grid" style="margin-bottom:1rem">
                <div class="settings-form-field">
                  <label>Office Latitude</label>
                  <input id="geoLat" placeholder="e.g. 17.4435" value="\${g.lat ?? ''}" style="width:100%" />
                </div>
                <div class="settings-form-field">
                  <label>Office Longitude</label>
                  <input id="geoLng" placeholder="e.g. 78.3842" value="\${g.lng ?? ''}" style="width:100%" />
                </div>
                <div class="settings-form-field">
                  <label>Allowed Radius (Meters)</label>
                  <input id="geoRad" type="number" placeholder="200" value="\${g.radius ?? 200}" style="width:100%" />
                </div>
              </div>
              <div class="btn-group">
                <button class="btn btn-secondary" onclick="useMyLocation()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/><circle cx="12" cy="12" r="7"/></svg>
                  <span>Detect My Current GPS Location</span>
                </button>
                <button class="btn btn-primary" onclick="saveGeo()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
                  <span>Save Geofence</span>
                </button>
              </div>
            </div>

            <div style="font-weight:700; color:#0f172a; margin-bottom:0.75rem">Recent Punch-in Audit Gallery</div>
            <div class="table-wrap">
              \${rows.length ? \`
                <table>
                  <thead>
                    <tr>
                      <th style="width:60px">Selfie</th>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Punch Type</th>
                      <th>Time</th>
                      <th>Distance</th>
                      <th>AI Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    \${rows.map(x => \`
                      <tr>
                        <td>
                          <img src="\${x.photo}" title="Click to inspect" onclick="selfiePreview('\${x.id}')" style="height:44px; width:44px; object-fit:cover; border-radius:8px; cursor:zoom-in; border:1px solid #e2e8f0" />
                        </td>
                        <td>
                          <div style="font-weight:600; color:#0f172a">\${esc(findEmployee(x.empId)?.name || '—')}</div>
                        </td>
                        <td class="dept-tag">\${formatDate(x.date)}</td>
                        <td>
                          <span class="badge \${x.kind === 'in' ? 'active' : 'inactive'}">\${x.kind === 'in' ? 'Check In' : 'Check Out'}</span>
                        </td>
                        <td>\${x.time}</td>
                        <td class="dept-tag">\${x.dist != null ? x.dist + ' m' : 'No restriction'}</td>
                        <td>\${faceBadge(x.face, x.blocked)}</td>
                      </tr>
                    \`).join('')}
                  </tbody>
                </table>
              \` : '<div class="empty-state">No selfie punch-ins recorded yet (photos stored for 3 days).</div>'}
            </div>
          </div>
        </div>\`;
    }`;

const newBioCard = `    function renderBioCard() {
      const cfg = getBioCfg(), on = cfg.emps || {}, all = getBio(), emps = getEmployees().filter(e => e.status !== 'inactive'), n = emps.filter(e => on[e.id]).length;
      return \`
        <div class="card">
          <div class="card-header">
            <div>
              <h2>Mobile &amp; Hardware Biometrics</h2>
              <div class="dept-tag" style="margin-top:2px">Configure WebAuthn hardware passkey and mobile fingerprint punch-ins</div>
            </div>
            <div class="btn-group">
              <button class="btn btn-approve btn-sm" onclick="setBioAll(true)">Enable for All Employees</button>
              <button class="btn btn-secondary btn-sm" onclick="setBioAll(false)">Disable for All</button>
            </div>
          </div>
          <div class="card-body" style="padding:1.5rem">
            <div class="callout-box info" style="margin-bottom:1.25rem">
              <strong>\${n} of \${emps.length}</strong> active employees have biometric requirements enforced. Employees register their device passkey / biometric lock during their first attendance punch.
            </div>

            <label style="display:flex; gap:0.6rem; align-items:center; font-size:0.84rem; font-weight:600; color:#334155; margin-bottom:1.25rem; cursor:pointer">
              <input type="checkbox" \${cfg.photoFallback === false ? '' : 'checked'} onchange="setBioFallback(this.checked)" style="width:17px; height:17px" />
              <span>Allow photo fallback if device biometric hardware is unavailable</span>
            </label>

            <div class="table-wrap">
              \${emps.length ? \`
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th style="text-align:center">Biometric Enforced</th>
                      <th>Registered Devices</th>
                      <th style="text-align:right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    \${emps.map(e => \`
                      <tr>
                        <td>\${empCell(e)}</td>
                        <td style="text-align:center">
                          <input type="checkbox" \${on[e.id] ? 'checked' : ''} onchange="setBioEmp('\${e.id}', this.checked)" style="width:18px; height:18px; cursor:pointer" />
                        </td>
                        <td>
                          \${(all[e.id] || []).length ? (all[e.id] || []).map(c => \`<div class="dept-tag">\${esc(c.name)} · \${formatDate((c.at || '').slice(0, 10))}</div>\`).join('') : '<span class="dept-tag">Not registered yet</span>'}
                        </td>
                        <td style="text-align:right">
                          \${(all[e.id] || []).length ? \`<button class="btn btn-delete btn-sm" onclick="resetBio('\${e.id}')">Reset Passkeys</button>\` : ''}
                        </td>
                      </tr>
                    \`).join('')}
                  </tbody>
                </table>
              \` : '<div class="empty-state">No active employees found.</div>'}
            </div>
          </div>
        </div>\`;
    }`;

const faceRegex = /function renderFaceCard\(\)\s*\{[\s\S]*?return\s*`[\s\S]*?`;\s*\}/;
if (faceRegex.test(js)) {
  js = js.replace(faceRegex, newFaceCard);
  console.log('Replaced renderFaceCard with executive layout');
}

const selfieRegex = /function renderSelfieCard\(\)\s*\{[\s\S]*?return\s*`[\s\S]*?`;\s*\}/;
if (selfieRegex.test(js)) {
  js = js.replace(selfieRegex, newSelfieCard);
  console.log('Replaced renderSelfieCard with executive layout');
}

const bioRegex = /function renderBioCard\(\)\s*\{[\s\S]*?return\s*`[\s\S]*?`;\s*\}/;
if (bioRegex.test(js)) {
  js = js.replace(bioRegex, newBioCard);
  console.log('Replaced renderBioCard with executive layout');
}

fs.writeFileSync(jsPath, js, 'utf8');
console.log('Saved updated client/js/app.js');

// Bump version in HTML files
[indexClientPath, indexRootPath].forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let html = fs.readFileSync(filePath, 'utf8');
    html = html.replace(/style\.css\?v=[0-9.]+/g, 'style.css?v=2.5.0');
    html = html.replace(/app\.js\?v=[0-9.]+/g, 'app.js?v=2.5.0');
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('Bumped cache version in ' + filePath);
  }
});

console.log('--- UI/UX UPGRADE APPLIED SUCCESSFULLY ---');
