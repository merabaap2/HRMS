// ==========================================================================
// R & A ASSOCIATES HRMS - REST API DISPATCHER
// Connects frontend entities and clients to server backend database
// ==========================================================================

const db = require('../db');

function parseJSON(val, fallback = []) {
  try {
    return JSON.parse(val || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function handleEntityRoutes(req, res, url) {
  // GET /api/employees
  if (url === '/api/employees') {
    if (req.method === 'GET') {
      const emps = parseJSON(db.getKey('hrms_employees'));
      sendJSON(res, 200, emps);
      return true;
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', c => { body += c; });
      req.on('end', () => {
        try {
          const emp = JSON.parse(body);
          const emps = parseJSON(db.getKey('hrms_employees'));
          emps.unshift(emp);
          db.setKey('hrms_employees', JSON.stringify(emps));
          sendJSON(res, 201, emp);
        } catch (e) {
          sendJSON(res, 400, { error: 'Invalid JSON payload' });
        }
      });
      return true;
    }
  }

  // GET /api/attendance
  if (url === '/api/attendance') {
    if (req.method === 'GET') {
      const att = parseJSON(db.getKey('hrms_attendance'));
      sendJSON(res, 200, att);
      return true;
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', c => { body += c; });
      req.on('end', () => {
        try {
          const rec = JSON.parse(body);
          const att = parseJSON(db.getKey('hrms_attendance'));
          // Replace or unshift
          const idx = att.findIndex(a => a.empId === rec.empId && a.date === rec.date);
          if (idx !== -1) att[idx] = rec;
          else att.unshift(rec);
          db.setKey('hrms_attendance', JSON.stringify(att));
          sendJSON(res, 200, rec);
        } catch (e) {
          sendJSON(res, 400, { error: 'Invalid JSON payload' });
        }
      });
      return true;
    }
  }

  // GET /api/leaves
  if (url === '/api/leaves') {
    if (req.method === 'GET') {
      const leaves = parseJSON(db.getKey('hrms_leaves'));
      sendJSON(res, 200, leaves);
      return true;
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', c => { body += c; });
      req.on('end', () => {
        try {
          const reqLeave = JSON.parse(body);
          const leaves = parseJSON(db.getKey('hrms_leaves'));
          leaves.unshift(reqLeave);
          db.setKey('hrms_leaves', JSON.stringify(leaves));
          sendJSON(res, 201, reqLeave);
        } catch (e) {
          sendJSON(res, 400, { error: 'Invalid JSON payload' });
        }
      });
      return true;
    }
  }

  // GET /api/departments
  if (url === '/api/departments') {
    if (req.method === 'GET') {
      const depts = parseJSON(db.getKey('hrms_departments'));
      sendJSON(res, 200, depts);
      return true;
    }
  }

  // GET /api/activities
  if (url === '/api/activities') {
    if (req.method === 'GET') {
      const acts = parseJSON(db.getKey('hrms_activities'));
      sendJSON(res, 200, acts);
      return true;
    }
  }

  // POST /api/auth/login
  if (url === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body);
        const u = (username || '').trim().toLowerCase();
        if (u === 'admin' && password === 'admin123') {
          return sendJSON(res, 200, { ok: true, user: { role: 'ADMIN', username: 'admin', name: 'Admin User' } });
        }
        if (u === 'hradmin' && password === 'hradmin') {
          return sendJSON(res, 200, { ok: true, user: { role: 'HR_MANAGER', username: 'hradmin', name: 'HR Admin' } });
        }
        const emps = parseJSON(db.getKey('hrms_employees'));
        const emp = emps.find(e => (e.empCode || '').toLowerCase() === u && e.status !== 'inactive');
        if (emp) {
          return sendJSON(res, 200, { ok: true, user: { role: 'EMPLOYEE', empId: emp.id, username: emp.empCode, name: emp.name } });
        }
        sendJSON(res, 401, { error: 'Invalid username or password' });
      } catch {
        sendJSON(res, 400, { error: 'Bad request' });
      }
    });
    return true;
  }

  // /api/permissions
  if (url === '/api/permissions') {
    if (req.method === 'GET') {
      const perms = parseJSON(db.getKey('hrms_permissions'));
      sendJSON(res, 200, perms);
      return true;
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', c => { body += c; });
      req.on('end', () => {
        try {
          const reqPerm = JSON.parse(body);
          const perms = parseJSON(db.getKey('hrms_permissions'));
          const newPerm = {
            id: `perm_${Date.now()}`,
            ...reqPerm,
            status: 'pending'
          };
          perms.unshift(newPerm);
          db.setKey('hrms_permissions', JSON.stringify(perms));
          sendJSON(res, 201, { success: true, permission: newPerm });
        } catch {
          sendJSON(res, 400, { error: 'Invalid JSON payload' });
        }
      });
      return true;
    }
    if (req.method === 'PATCH') {
      let body = '';
      req.on('data', c => { body += c; });
      req.on('end', () => {
        try {
          const { id, status } = JSON.parse(body);
          const perms = parseJSON(db.getKey('hrms_permissions'));
          const perm = perms.find(p => p.id === id);
          if (perm) {
            perm.status = status;
            perm.decidedBy = 'HR Administrator';
            perm.decidedAt = new Date().toISOString();
            db.setKey('hrms_permissions', JSON.stringify(perms));
            return sendJSON(res, 200, { success: true, permission: perm });
          }
          sendJSON(res, 404, { error: 'Permission not found' });
        } catch {
          sendJSON(res, 400, { error: 'Bad request' });
        }
      });
      return true;
    }
  }

  // /api/resignations
  if (url === '/api/resignations') {
    if (req.method === 'GET') {
      const resignations = parseJSON(db.getKey('hrms_resignations'));
      sendJSON(res, 200, resignations);
      return true;
    }
    if (req.method === 'PATCH') {
      let body = '';
      req.on('data', c => { body += c; });
      req.on('end', () => {
        try {
          const { id, status } = JSON.parse(body);
          const resignations = parseJSON(db.getKey('hrms_resignations'));
          const r = resignations.find(item => item.id === id);
          if (r) {
            r.status = status;
            r.decidedBy = 'HR Administrator';
            db.setKey('hrms_resignations', JSON.stringify(resignations));
            return sendJSON(res, 200, { success: true, resignation: r });
          }
          sendJSON(res, 404, { error: 'Resignation not found' });
        } catch {
          sendJSON(res, 400, { error: 'Bad request' });
        }
      });
      return true;
    }
  }

  return false;
}

module.exports = { handleEntityRoutes };
