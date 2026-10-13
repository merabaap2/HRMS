const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '../client/js/app.js');
let js = fs.readFileSync(jsPath, 'utf8');

console.log('Original app.js length:', js.length);

// 1. Update EMP_MENUS and EMP_PAGES so My Attendance is first
js = js.replace(
  "const EMP_PAGES = ['myleave', 'myresign', 'myletters', 'myperf', 'myatt', 'myperm', 'mystat', 'myservice'];",
  "const EMP_PAGES = ['myatt', 'myleave', 'myperm', 'myletters', 'myperf', 'myservice', 'mystat', 'myresign'];"
);

js = js.replace(
  "const EMP_MENUS = [['myleave', 'My Leave'], ['myresign', 'My Resignation'], ['myletters', 'My Letters'], ['myatt', 'My Attendance'], ['myperm', 'My Permissions & OD'], ['myperf', 'My Performance'], ['mystat', 'My Statutory Statements'], ['myservice', 'My Service']];",
  "const EMP_MENUS = [['myatt', 'My Attendance'], ['myleave', 'My Leave'], ['myperm', 'My Permissions & OD'], ['myletters', 'My Letters'], ['myperf', 'My Performance'], ['myservice', 'My Service'], ['mystat', 'My Statutory Statements'], ['myresign', 'My Resignation']];"
);

// 2. Add setRoleTab and simplify login screen logic around line 2688
const oldLoginPresetCode = `    function setLoginPreset(user, pass, btn) {
      const uEl = document.getElementById('loginUser');
      const pEl = document.getElementById('loginPass');
      if (uEl) uEl.value = user;
      if (pEl) pEl.value = pass;
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      const hint = document.getElementById('pwdHintText');
      if (hint) hint.textContent = user === 'admin' ? 'Default: admin123' : 'DOB: 01011900';
      const err = document.getElementById('loginErr');
      if (err) err.textContent = '';
    }`;

const newLoginPresetCode = `    function setRoleTab(role) {
      const uEl = document.getElementById('loginUser');
      const pEl = document.getElementById('loginPass');
      const btnAdmin = document.getElementById('tabAdmin');
      const btnEmp = document.getElementById('tabEmployee');
      const roleDesc = document.getElementById('roleDescBadge');
      const submitText = document.getElementById('loginSubmitText');
      const hint = document.getElementById('pwdHintText');
      const err = document.getElementById('loginErr');
      if (err) err.textContent = '';

      if (role === 'admin') {
        if (btnAdmin) btnAdmin.classList.add('active');
        if (btnEmp) btnEmp.classList.remove('active');
        if (uEl) uEl.value = 'admin';
        if (pEl) pEl.value = 'admin123';
        if (hint) hint.textContent = 'Preset: admin123';
        if (roleDesc) roleDesc.innerHTML = '<strong>HR Administrator</strong> · Live management &amp; dashboard';
        if (submitText) submitText.textContent = 'Sign in as Admin';
      } else {
        if (btnAdmin) btnAdmin.classList.remove('active');
        if (btnEmp) btnEmp.classList.add('active');
        if (uEl) uEl.value = 'EMP001';
        if (pEl) pEl.value = '01011900';
        if (hint) hint.textContent = 'Default pass: DOB (DDMMYYYY)';
        if (roleDesc) roleDesc.innerHTML = '<strong>Employee Self-Service</strong> · Face cam punch &amp; requests';
        if (submitText) submitText.textContent = 'Sign in as Employee';
      }
    }
    window.setRoleTab = setRoleTab;

    function setLoginPreset(user, pass, btn) {
      setRoleTab(user === 'admin' ? 'admin' : 'employee');
    }`;

js = js.replace(oldLoginPresetCode, newLoginPresetCode);

// 3. Update logout function to give clean feedback and reset to simple admin tab
const oldLogoutCode = `    function logout(reason) {
      try { sessionStorage.removeItem('hrms_session'); sessionStorage.removeItem('hrms_last_active'); } catch {}
      session = null;
      ['idleWarn', 'popupShow', 'attDone'].forEach(id => document.getElementById(id)?.remove());
      document.querySelectorAll('.modal-backdrop.show').forEach(m => m.classList.remove('show'));
      try { selfieStop(); } catch {}
      document.getElementById('loginScreen').classList.add('show'); showLastLogin();
      const el = document.getElementById('loginErr'); if (el) el.textContent = reason === 'idle' ? 'You were signed out after 5 minutes of inactivity.' : '';
    }`;

const newLogoutCode = `    function logout(reason) {
      try { sessionStorage.removeItem('hrms_session'); sessionStorage.removeItem('hrms_last_active'); } catch {}
      session = null;
      ['idleWarn', 'popupShow', 'attDone'].forEach(id => document.getElementById(id)?.remove());
      document.querySelectorAll('.modal-backdrop.show').forEach(m => m.classList.remove('show'));
      try { selfieStop(); } catch {}
      renderBottomNav(null);
      document.getElementById('loginScreen')?.classList.add('show');
      showLastLogin();
      setRoleTab('admin');
      showToast('Signed out of HRMS', 'info');
      const el = document.getElementById('loginErr'); if (el) el.textContent = reason === 'idle' ? 'You were signed out after 5 minutes of inactivity.' : '';
    }`;

js = js.replace(oldLogoutCode, newLogoutCode);

// 4. Update applyRole to render bottom nav bar
js = js.replace(
  "document.getElementById('loginScreen').classList.remove('show');\n      navigate(hr ? 'dashboard' : firstAllowed());",
  "document.getElementById('loginScreen').classList.remove('show');\n      renderBottomNav(hr ? 'admin' : 'employee');\n      navigate(hr ? 'dashboard' : firstAllowed());"
);

// 5. Replace openSelfie, selfieSubmitBase, and renderMyAtt with the modern biometric & GPS camera implementation
const oldPunchBlockRegex = /\/\/ ========== SELF ATTENDANCE \(selfie \+ location\) ==========[\s\S]*?\/\/ HR: office geofence \+ recent selfie log/;

const newPunchBlock = `// ========== SELF ATTENDANCE (selfie face cam + location) ==========
    let selfieStream = null, selfieGeo = null, selfieCamFacing = 'user';
    const getGeo = () => load(STORAGE_KEYS.geo) || {};
    const getSelfies = () => load(STORAGE_KEYS.selfies) || [];
    function distM(a, b, c, d) {
      const R = 6371000, r = x => x * Math.PI / 180,
            h = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2;
      return Math.round(2 * R * Math.asin(Math.sqrt(h)));
    }
    function selfieStop() {
      if (selfieStream) {
        selfieStream.getTracks().forEach(t => t.stop());
        selfieStream = null;
      }
    }
    const _closeModal = closeModal;
    closeModal = function (id) {
      if (id === 'perfModal') selfieStop();
      _closeModal(id);
    };

    async function startSelfieCamera() {
      selfieStop();
      const vid = document.getElementById('selfieVid');
      const camStatus = document.getElementById('punchCamStatus');
      const oval = document.getElementById('punchFaceOval');
      const liveBadge = document.getElementById('punchLiveBadge');
      if (!vid) return;

      if (camStatus) camStatus.innerHTML = '🔄 Accessing camera stream...';

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (camStatus) {
          camStatus.innerHTML = '<span style="color:#ef4444">⚠️ Camera requires HTTPS or localhost connection.</span>';
        }
        return;
      }

      try {
        selfieStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: selfieCamFacing,
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        });
      } catch (err) {
        console.warn('FacingMode camera failed, trying fallback to default video:', err);
        try {
          selfieStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch (err2) {
          console.error('All camera attempts failed:', err2);
          if (camStatus) {
            camStatus.innerHTML = '<span style="color:#ef4444">⚠️ Camera access blocked. Allow camera permission in browser.</span>';
          }
          if (liveBadge) liveBadge.innerHTML = '<span style="color:#ef4444">● Blocked</span>';
          return;
        }
      }

      if (vid && selfieStream) {
        vid.srcObject = selfieStream;
        vid.setAttribute('playsinline', '');
        vid.setAttribute('webkit-playsinline', '');
        vid.muted = true;
        vid.play().catch(() => {});
        vid.onloadedmetadata = () => {
          if (camStatus) camStatus.innerHTML = '<span style="color:#10b981">🟢 Camera Active · Center your face inside the oval</span>';
          if (oval) oval.classList.add('ready');
          if (liveBadge) liveBadge.innerHTML = \`<span style="color:#10b981">● Live (\${selfieCamFacing === 'user' ? 'Front' : 'Back'})</span>\`;
        };
      }
    }
    window.startSelfieCamera = startSelfieCamera;

    function toggleSelfieCamera() {
      selfieCamFacing = selfieCamFacing === 'user' ? 'environment' : 'user';
      startSelfieCamera();
    }
    window.toggleSelfieCamera = toggleSelfieCamera;

    function fetchSelfieLocation() {
      const geoStatus = document.getElementById('punchGeoStatus');
      const geofenceInfo = document.getElementById('punchGeofenceInfo');
      if (geoStatus) geoStatus.innerHTML = '<span class="geo-pulse-dot"></span> Acquiring high-accuracy GPS coordinates...';

      if (!navigator.geolocation) {
        if (geoStatus) geoStatus.innerHTML = '<span style="color:#ef4444">⚠️ Geolocation not supported by this browser</span>';
        return;
      }

      let resolved = false;

      function onPosition(pos) {
        if (resolved) return;
        resolved = true;
        selfieGeo = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy || 0)
        };

        const latFmt = selfieGeo.lat.toFixed(5);
        const lngFmt = selfieGeo.lng.toFixed(5);

        if (geoStatus) {
          geoStatus.innerHTML = \`<span style="color:#10b981;font-weight:700">📍 GPS Locked:</span> <strong>\${latFmt}°, \${lngFmt}°</strong> <span class="badge" style="background:#e0f2fe;color:#0369a1;font-size:.72rem;margin-left:.35rem">±\${selfieGeo.accuracy}m</span>\`;
        }

        // Office Geofence check
        const g = getGeo();
        if (g && g.lat != null && g.lng != null && g.radius) {
          const dist = distM(selfieGeo.lat, selfieGeo.lng, +g.lat, +g.lng);
          const ok = dist <= +g.radius;
          if (geofenceInfo) {
            if (ok) {
              geofenceInfo.innerHTML = \`<div class="geofence-tag in-range">🏢 Office distance: <strong>\${dist}m</strong> (Allowed: \${g.radius}m) · In Office Zone ✅</div>\`;
            } else {
              geofenceInfo.innerHTML = \`<div class="geofence-tag out-range">⚠️ Office distance: <strong>\${dist}m</strong> (Allowed: \${g.radius}m) · Outside Office Zone ❌</div>\`;
            }
          }
        } else {
          if (geofenceInfo) {
            geofenceInfo.innerHTML = \`<div class="geofence-tag in-range">🌐 Global Attendance Active · Punch allowed from any location ✅</div>\`;
          }
        }
      }

      function onFail(err) {
        console.warn('High-accuracy GPS attempt failed, trying fallback:', err);
        navigator.geolocation.getCurrentPosition(
          onPosition,
          err2 => {
            if (resolved) return;
            resolved = true;
            console.error('All location attempts failed:', err2);
            if (geoStatus) {
              geoStatus.innerHTML = '<span style="color:#ef4444">⚠️ Location access unavailable or blocked. Please enable GPS permissions on your phone.</span>';
            }
            if (geofenceInfo) {
              geofenceInfo.innerHTML = '<button type="button" class="btn btn-secondary" style="padding:.35rem .75rem;font-size:.75rem;margin-top:.2rem" onclick="retrySelfieLocation()">🔄 Tap to Retry GPS</button>';
            }
          },
          { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
        );
      }

      navigator.geolocation.getCurrentPosition(onPosition, onFail, {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 10000
      });
    }

    function retrySelfieLocation() {
      selfieGeo = null;
      fetchSelfieLocation();
    }
    window.retrySelfieLocation = retrySelfieLocation;

    function openSelfie(kind) {
      const iso = localISO(), r = getAttendance().find(a => a.empId === session.empId && a.date === iso);
      if (dayOffInfo(iso).off) { showToast('Today is a holiday / weekly off', 'error'); return; }
      if (r && (r.status === 'leave' || r.status === 'holiday')) { showToast('You are on approved leave today', 'error'); return; }
      selfieGeo = null;
      selfieCamFacing = 'user';

      const title = kind === 'in' ? 'Check In — Face & Location' : 'Check Out — Face & Location';
      const body = \`
        <div class="punch-modal-body">
          <div class="punch-cam-container">
            <div class="punch-top-bar">
              <span class="punch-live-badge" id="punchLiveBadge"><span class="geo-pulse-dot" style="background:#10b981;margin:0"></span> Initializing</span>
              <button type="button" class="punch-cam-flip-btn" onclick="toggleSelfieCamera()" title="Switch camera">🔄 Flip</button>
            </div>
            <video id="selfieVid" autoplay playsinline webkit-playsinline muted class="punch-video"></video>
            <div class="punch-face-oval" id="punchFaceOval"><div class="punch-scan-bar"></div></div>
          </div>
          <div id="punchCamStatus" class="punch-status-line">Starting camera and biometric frame...</div>

          <div class="punch-geo-card">
            <div id="punchGeoStatus" class="punch-geo-status"><span class="geo-pulse-dot"></span> Acquiring GPS location...</div>
            <div id="punchGeofenceInfo" class="punch-geofence-info"></div>
            <div style="text-align:right">
              <button type="button" class="btn btn-secondary" style="padding:.25rem .65rem;font-size:.72rem" onclick="retrySelfieLocation()">🔄 Refresh GPS</button>
            </div>
          </div>

          \${lateWarn(kind)}
        </div>
      \`;

      const foot = \`
        <button class="btn btn-secondary" onclick="closeModal('perfModal')">Cancel</button>
        <button class="btn btn-primary btn-punch-submit" id="selfieBtn" onclick="selfieSubmit('\${kind}')" style="min-width:160px;height:44px;font-weight:700">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="display:inline-block;vertical-align:-3px;margin-right:4px"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
          Capture &amp; Submit
        </button>
      \`;

      perfModalShow(title, body, foot);
      startSelfieCamera();
      fetchSelfieLocation();
    }
    window.openSelfie = openSelfie;

    function selfieSubmitBase(kind, face) {
      const v = document.getElementById('selfieVid');
      if (!selfieStream || !v || !v.videoWidth) {
        showToast('Please wait for camera stream to initialize', 'error');
        return;
      }
      if (!selfieGeo) {
        showToast('Acquiring GPS location... Tap "Refresh GPS" if delayed', 'warning');
        retrySelfieLocation();
        return;
      }
      const g = getGeo(); let dist = null, ok = true;
      if (g.lat != null && g.lng != null && g.radius) {
        dist = distM(selfieGeo.lat, selfieGeo.lng, +g.lat, +g.lng);
        ok = dist <= +g.radius;
      }
      if (!ok) {
        showToast(\`You are \${dist}m from the office (allowed radius: \${g.radius}m)\`, 'error');
        return;
      }
      const c = document.createElement('canvas'), k = 240 / v.videoWidth;
      c.width = 240; c.height = Math.round(v.videoHeight * k);
      c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
      const photo = c.toDataURL('image/jpeg', .5), iso = localISO(), hm = new Date().toTimeString().slice(0, 5), now = new Date().toISOString();
      const list = getAttendance(); let r = list.find(a => a.empId === session.empId && a.date === iso);
      if (!r) { r = { id: uid(), empId: session.empId, date: iso, createdAt: now }; list.unshift(r); }
      const geo = { lat: +selfieGeo.lat.toFixed(5), lng: +selfieGeo.lng.toFixed(5), dist };
      if (kind === 'in') {
        r.inTime = hm; r.outTime = ''; r.status = officeClassify(hmToMin(hm), null).status; r.source = bioSourceLabel(); r.geoIn = geo;
        if (r.status === 'late') r.lateApproval = { status: 'pending', reason: (document.getElementById('selfieReason')?.value || '').trim(), at: now }; else delete r.lateApproval;
      } else {
        r.outTime = hm; let st = officeClassify(hmToMin(r.inTime), hmToMin(hm)).status; const ap = r.lateApproval?.status;
        if (st === 'late' && ap === 'excused') st = 'present'; if (ap === 'rejected') st = 'absent'; r.status = st; r.geoOut = geo;
      }
      const sid = uid();
      if (face && FACE_FLAG.includes(face.state)) {
        r.faceFlag = { status: 'pending', sid, state: face.state, d: face.d, kind };
        if (!/ · Face/.test(r.source || '')) r.source = (r.source || 'Selfie') + ' · Face ' + FACE_LABEL[face.state].toLowerCase();
      } else if (face && face.state === 'match') {
        delete r.faceFlag;
      }
      setAttendance(list);
      const keep = new Set([...Array(3)].map((_, i) => localISO(new Date(Date.now() - i * 864e5))));
      try {
        save(STORAGE_KEYS.selfies, [{ id: sid, empId: session.empId, date: iso, kind, time: hm, photo, ...(face ? { face: { state: face.state, d: face.d } } : {}), ...geo }, ...getSelfies()].filter(x => keep.has(x.date)));
      } catch { }
      addActivity(\`<strong>\${esc(findEmployee(session.empId)?.name)}</strong> checked \${kind === 'in' ? 'in' : 'out'} at \${hm} (face selfie)\${kind === 'in' && r.lateApproval?.status === 'pending' ? ' — LATE, awaiting HR approval' : ''}\`, 'green');
      closeModal('perfModal');
      showToast(kind === 'in' ? (r.lateApproval?.status === 'pending' ? 'Checked in at ' + hm + ' — marked LATE, sent to HR' : 'Checked in successfully at ' + hm) : 'Checked out successfully at ' + hm, 'success');
      updateLateBadge();
      refreshCurrentPage();
      if (!isHR()) attendanceDonePopup(kind, hm, photo, r.lateApproval?.status === 'pending');
    }
    window.selfieSubmitBase = selfieSubmitBase;

    function renderMyAtt() {
      const iso = localISO(), all = getAttendance().filter(a => a.empId === session?.empId).sort((a, b) => b.date.localeCompare(a.date)), t = all.find(a => a.date === iso);
      const inDone = /Selfie/.test(t?.source || '') && t.inTime, outDone = inDone && t.outTime;
      const off = dayOffInfo(iso);
      const o = officeCfg();
      const g = getGeo();
      const geofenceText = (g && g.lat != null && g.lng != null && g.radius) ? \`🏢 Geofence: \${g.radius}m office perimeter\` : '🌐 Global punch enabled';

      const now = new Date();
      const dateFormatted = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

      // Start live clock ticker
      if (!window.__punchClockInterval) {
        window.__punchClockInterval = setInterval(() => {
          const el = document.getElementById('liveClockDigits');
          if (el) {
            el.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
          }
        }, 1000);
      }

      return \`
        <!-- Biometric Hero Punch Card -->
        <div class="punch-hero-card">
          <div class="punch-date-display">📅 \${dateFormatted}</div>
          <div class="punch-clock-display" id="liveClockDigits">\${timeFormatted}</div>
          <div style="display:inline-flex;align-items:center;gap:.4rem;background:rgba(255,255,255,0.18);padding:.35rem .85rem;border-radius:99px;font-size:.82rem;font-weight:600;margin-bottom:.5rem">
            \${off.off ? '🏖️ Holiday / Weekly Off' : inDone ? (outDone ? '🏁 Day Completed (Out: ' + t.outTime + ')' : '🟢 Present · Checked in at ' + t.inTime) : '⏳ Not Checked In Yet'}
          </div>

          <div class="punch-btn-group">
            <button class="btn btn-punch-in" \${off.off || inDone ? 'disabled' : ''} onclick="openSelfie('in')">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
              Check In
            </button>
            <button class="btn btn-punch-out" \${off.off || !inDone ? 'disabled' : ''} onclick="openSelfie('out')">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>
              \${outDone ? 'Update Out' : 'Check Out'}
            </button>
          </div>

          <div style="font-size:.76rem;color:#bfdbfe;margin-top:.7rem">
            \${geofenceText} &middot; Office opens \${to12h(o.open)} (Grace \${o.grace}m)
          </div>
        </div>

        <!-- Employee Quick Mobile Self-Service Hub -->
        <div style="margin-bottom:.6rem;font-weight:700;font-size:.9rem;color:#334155">Self-Service Options</div>
        <div class="emp-services-grid">
          <div class="emp-service-card" onclick="navigate('myleave')">
            <div class="emp-service-icon" style="background:#eff6ff;color:#2563eb">📅</div>
            <div class="emp-service-title">Leave Requests</div>
            <div class="emp-service-desc">Apply &amp; check balance</div>
          </div>
          <div class="emp-service-card" onclick="navigate('myperm')">
            <div class="emp-service-icon" style="background:#f0fdf4;color:#16a34a">⏱️</div>
            <div class="emp-service-title">Permission / OD</div>
            <div class="emp-service-desc">1-hr &amp; 2-hr permissions</div>
          </div>
          <div class="emp-service-card" onclick="navigate('myletters')">
            <div class="emp-service-icon" style="background:#fef3c7;color:#d97706">📄</div>
            <div class="emp-service-title">My Letters</div>
            <div class="emp-service-desc">Offer &amp; experience letters</div>
          </div>
          <div class="emp-service-card" onclick="navigate('myperf')">
            <div class="emp-service-icon" style="background:#fdf2f8;color:#db2777">⭐</div>
            <div class="emp-service-title">Performance</div>
            <div class="emp-service-desc">Appraisals &amp; reviews</div>
          </div>
          <div class="emp-service-card" onclick="navigate('myservice')">
            <div class="emp-service-icon" style="background:#f5f3ff;color:#7c3aed">📋</div>
            <div class="emp-service-title">Service Book</div>
            <div class="emp-service-desc">Tenure &amp; milestones</div>
          </div>
          <div class="emp-service-card" onclick="navigate('mystat')">
            <div class="emp-service-icon" style="background:#f0fdfa;color:#0d9488">📑</div>
            <div class="emp-service-title">Statutory Slips</div>
            <div class="emp-service-desc">PF, ESI &amp; wage statements</div>
          </div>
          <div class="emp-service-card" onclick="navigate('myresign')">
            <div class="emp-service-icon" style="background:#fff1f2;color:#e11d48">🚪</div>
            <div class="emp-service-title">Resignation</div>
            <div class="emp-service-desc">Submit &amp; track clearance</div>
          </div>
          <div class="emp-service-card" onclick="toggleSidebar()">
            <div class="emp-service-icon" style="background:#f1f5f9;color:#475569">⚙️</div>
            <div class="emp-service-title">More Menus</div>
            <div class="emp-service-desc">View full sidebar menu</div>
          </div>
        </div>

        <!-- Recent Logs Card -->
        <div class="card" style="margin-top:1.25rem">
          <div class="card-header" style="display:flex;align-items:center;justify-content:space-between">
            <h2>Recent Attendance History</h2>
            <span class="badge" style="background:#f1f5f9;color:#475569">\${all.length} Records</span>
          </div>
          <div class="card-body table-wrap">
            \${all.length ? \`
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>In Time</th>
                    <th>Out Time</th>
                    <th>Source / Mode</th>
                    <th>Late Approval</th>
                  </tr>
                </thead>
                <tbody>
                  \${all.slice(0, 31).map(a => \`
                    <tr>
                      <td><strong>\${formatDate(a.date)}</strong></td>
                      <td>\${attBadge(a.status)}</td>
                      <td>\${a.inTime || '—'}</td>
                      <td>\${a.outTime || '—'}</td>
                      <td class="dept-tag">\${esc(a.source || 'Selfie · Mobile')}</td>
                      <td>\${lateBadge(a)}</td>
                    </tr>
                  \`).join('')}
                </tbody>
              </table>
            \` : '<div class="empty-state">No attendance records yet</div>'}
          </div>
        </div>
      \`;
    }
    window.renderMyAtt = renderMyAtt;

    // HR: office geofence + recent selfie log`;

js = js.replace(oldPunchBlockRegex, newPunchBlock);

// 6. Add renderBottomNav function and wire it into navigate()
const bottomNavFunction = `
    // ========== MOBILE BOTTOM NAVIGATION BAR ==========
    function renderBottomNav(role) {
      const bNav = document.getElementById('mobileBottomNav');
      if (!bNav) return;
      if (!role) {
        bNav.innerHTML = '';
        bNav.style.display = 'none';
        return;
      }
      bNav.style.display = 'flex';

      if (role === 'admin') {
        const leaveCnt = getLeaves().filter(l => l.status === 'pending').length;
        bNav.innerHTML = \`
          <button type="button" class="bottom-nav-item \${currentPage === 'dashboard' ? 'active' : ''}" data-page="dashboard" onclick="navigate('dashboard')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            <span>Overview</span>
          </button>
          <button type="button" class="bottom-nav-item \${currentPage === 'employees' ? 'active' : ''}" data-page="employees" onclick="navigate('employees')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>
            <span>Staff</span>
          </button>
          <button type="button" class="bottom-nav-item \${currentPage === 'attendance' ? 'active' : ''}" data-page="attendance" onclick="navigate('attendance')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Attendance</span>
          </button>
          <button type="button" class="bottom-nav-item \${currentPage === 'leave' ? 'active' : ''}" data-page="leave" onclick="navigate('leave')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
            <span>Leaves</span>
            \${leaveCnt > 0 ? \`<span class="b-badge" id="bLeaveBadge">\${leaveCnt}</span>\` : ''}
          </button>
          <button type="button" class="bottom-nav-item" onclick="toggleSidebar()">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
            <span>More</span>
          </button>
        \`;
      } else {
        bNav.innerHTML = \`
          <button type="button" class="bottom-nav-item punch-highlight \${currentPage === 'myatt' ? 'active' : ''}" data-page="myatt" onclick="navigate('myatt')">
            <div class="punch-icon-bg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
            </div>
            <span>Punch</span>
          </button>
          <button type="button" class="bottom-nav-item \${currentPage === 'myleave' ? 'active' : ''}" data-page="myleave" onclick="navigate('myleave')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75"/></svg>
            <span>My Leaves</span>
          </button>
          <button type="button" class="bottom-nav-item \${currentPage === 'myperm' ? 'active' : ''}" data-page="myperm" onclick="navigate('myperm')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Permission</span>
          </button>
          <button type="button" class="bottom-nav-item \${currentPage === 'myletters' ? 'active' : ''}" data-page="myletters" onclick="navigate('myletters')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.24a2.25 2.25 0 01-1.07 1.92l-7.5 4.62a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.92V6.75"/></svg>
            <span>Letters</span>
          </button>
          <button type="button" class="bottom-nav-item" onclick="toggleSidebar()">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
            <span>All Menus</span>
          </button>
        \`;
      }
    }
    window.renderBottomNav = renderBottomNav;
`;

// Insert bottom nav function right above `function navigate(`
js = js.replace('function navigate(page, updateNav = true) {', bottomNavFunction + '\n    function navigate(page, updateNav = true) {');

// Update navigate() to sync bottom nav active status and close sidebar
const oldNavUpdate = `      if (updateNav) {
        document.querySelectorAll('.nav-item').forEach(el => {
          el.classList.toggle('active', el.dataset.page === page);
        });
      }`;

const newNavUpdate = `      if (updateNav) {
        document.querySelectorAll('.nav-item').forEach(el => {
          el.classList.toggle('active', el.dataset.page === page);
        });
        document.querySelectorAll('.bottom-nav-item').forEach(el => {
          el.classList.toggle('active', el.dataset.page === page);
        });
      }`;

js = js.replace(oldNavUpdate, newNavUpdate);

// Close sidebar and overlay on mobile whenever any navigation occurs
js = js.replace(
  "document.getElementById('sidebar').classList.remove('open');\n      document.getElementById('overlay').classList.remove('show');",
  "document.getElementById('sidebar')?.classList.remove('open');\n      document.getElementById('overlay')?.classList.remove('show');\n      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}"
);

// Save updated app.js
fs.writeFileSync(jsPath, js, 'utf8');
console.log('Successfully updated client/js/app.js! New length:', js.length);
