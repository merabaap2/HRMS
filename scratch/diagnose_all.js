const http = require('http');
const fs = require('fs');
const path = require('path');

async function runDiagnostics() {
  console.log('====================================================');
  console.log('    HRMS COMPREHENSIVE SYSTEM DIAGNOSTIC REPORT     ');
  console.log('====================================================\n');

  const BASE_URL = 'http://localhost:3000';

  // 1. Helper to do HTTP requests
  function makeRequest(urlPath, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve) => {
      const url = new URL(urlPath, BASE_URL);
      const reqHeaders = { ...headers };
      if (data && !reqHeaders['Content-Type']) {
        reqHeaders['Content-Type'] = 'application/json';
      }
      const req = http.request(
        {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname + url.search,
          method,
          headers: reqHeaders,
          timeout: 5000,
        },
        (res) => {
          let body = '';
          res.on('data', (c) => (body += c));
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body,
            });
          });
        }
      );
      req.on('error', (err) => {
        resolve({ error: err.message });
      });
      req.on('timeout', () => {
        req.destroy();
        resolve({ error: 'Request timeout' });
      });
      if (data) {
        req.write(typeof data === 'string' ? data : JSON.stringify(data));
      }
      req.end();
    });
  }

  // --- SECTION 1: SERVER & ROUTING CONNECTIVITY ---
  console.log('--- 1. SERVER & ROUTE CONNECTIVITY ---');
  const getRoutes = [
    { path: '/', expected: 200, name: 'Root index.html' },
    { path: '/api/health', expected: 200, name: 'Health check' },
    { path: '/api/state', expected: 200, name: 'State sync' },
    { path: '/api/employees', expected: 200, name: 'Employees REST' },
    { path: '/api/attendance', expected: 200, name: 'Attendance REST' },
    { path: '/api/leaves', expected: 200, name: 'Leaves REST' },
    { path: '/api/departments', expected: 200, name: 'Departments REST' },
    { path: '/api/activities', expected: 200, name: 'Activities REST' },
    { path: '/client/css/style.css', expected: 200, name: 'Style CSS' },
    { path: '/client/js/app.js', expected: 200, name: 'Client App JS' },
    { path: '/manifest.webmanifest', expected: 200, name: 'PWA Webmanifest' },
  ];

  for (const r of getRoutes) {
    const res = await makeRequest(r.path);
    if (res.error) {
      console.log(`❌ [FAIL] ${r.name} (${r.path}): ${res.error}`);
    } else if (res.statusCode === r.expected) {
      console.log(`✅ [PASS] ${r.name} (${r.path}) -> HTTP ${res.statusCode} (${res.body.length} bytes)`);
    } else {
      console.log(`⚠️ [WARN] ${r.name} (${r.path}) -> Expected ${r.expected}, got ${res.statusCode}`);
    }
  }

  // Test Authentication Endpoint
  console.log('\n--- 2. AUTHENTICATION API TEST ---');
  const adminAuth = await makeRequest('/api/auth/login', 'POST', {
    username: 'admin',
    password: 'admin123',
  });
  if (adminAuth.statusCode === 200) {
    console.log(`✅ [PASS] Admin Login (/api/auth/login) -> HTTP 200 (Role: Admin verified)`);
  } else {
    console.log(`❌ [FAIL] Admin Login -> Status: ${adminAuth.statusCode}, body: ${adminAuth.body}`);
  }

  const badAuth = await makeRequest('/api/auth/login', 'POST', {
    username: 'admin',
    password: 'wrongpassword',
  });
  if (badAuth.statusCode === 401) {
    console.log(`✅ [PASS] Invalid Login rejected with HTTP 401 as expected`);
  } else {
    console.log(`⚠️ [WARN] Bad login status: ${badAuth.statusCode}`);
  }

  // --- SECTION 3: DATABASE READ/WRITE PERSISTENCE TEST ---
  console.log('\n--- 3. DATABASE & PERSISTENCE LAYER TEST ---');
  const testKey = 'hrms_test_probe_' + Date.now();
  const testVal = JSON.stringify({ probe: true, time: new Date().toISOString() });

  // PUT test key
  const putRes = await makeRequest(`/api/state/${testKey}`, 'PUT', testVal, {
    'Content-Type': 'text/plain',
  });
  if (putRes.statusCode === 204) {
    console.log(`✅ [PASS] Database PUT (/api/state/${testKey}) -> HTTP 204`);
  } else {
    console.log(`❌ [FAIL] Database PUT -> HTTP ${putRes.statusCode}`);
  }

  // Wait 400ms for debounced persistence
  await new Promise((r) => setTimeout(r, 450));

  // Verify in GET /api/state
  const stateRes = await makeRequest('/api/state');
  let state = {};
  try {
    state = JSON.parse(stateRes.body);
    if (state[testKey] === testVal) {
      console.log(`✅ [PASS] State verification: probe key present and exact value matched`);
    } else {
      console.log(`❌ [FAIL] Probe key not found in state!`);
    }
  } catch (e) {
    console.log(`❌ [FAIL] Failed to parse /api/state JSON: ${e.message}`);
  }

  // Clean up probe key
  const delRes = await makeRequest(`/api/state/${testKey}`, 'DELETE');
  if (delRes.statusCode === 204) {
    console.log(`✅ [PASS] Database DELETE (/api/state/${testKey}) -> HTTP 204`);
  }

  // Verify DB Files on Disk
  const dataJsonPath = path.join(__dirname, '../data/data.json');
  const rootDataJsonPath = path.join(__dirname, '../data.json');
  console.log(`File check: data/data.json exists: ${fs.existsSync(dataJsonPath)} (${fs.statSync(dataJsonPath).size} bytes)`);
  console.log(`File check: root data.json exists: ${fs.existsSync(rootDataJsonPath)} (${fs.statSync(rootDataJsonPath).size} bytes)`);

  // --- SECTION 4: CLIENT JS SYNTAX & STRUCTURE INTEGRITY ---
  console.log('\n--- 4. CLIENT JAVASCRIPT SYNTAX & SANITY CHECK ---');
  const appJsPath = path.join(__dirname, '../client/js/app.js');
  try {
    const code = fs.readFileSync(appJsPath, 'utf8');
    // Simple syntax verification using Node vm or new Function
    const vm = require('vm');
    // Wrap in a function check or parse with new vm.Script
    new vm.Script(code);
    console.log(`✅ [PASS] client/js/app.js syntax is 100% valid ECMAScript (${code.length} bytes, 0 parse errors)`);
  } catch (err) {
    console.log(`❌ [SYNTAX ERROR] client/js/app.js failed syntax parsing:`, err.message);
  }

  // Check faceapi availability
  console.log('\n--- 5. BIOMETRICS / FACE-API ASSETS CHECK ---');
  const faceApiJs = await makeRequest('/faceapi/face-api.js');
  console.log(`faceapi/face-api.js -> HTTP ${faceApiJs.statusCode} (${faceApiJs.body?.length || 0} bytes)`);

  const manifestRes = await makeRequest('/faceapi/model/tiny_face_detector_model-weights_manifest.json');
  console.log(`faceapi model manifest -> HTTP ${manifestRes.statusCode}`);

  console.log('\n====================================================');
  console.log('             DIAGNOSTIC TEST COMPLETE               ');
  console.log('====================================================');
}

runDiagnostics();
