import { NextRequest, NextResponse } from 'next/server';
import { readRawState, writeRawState, getEmployees, getLeaves, getAttendance } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

const DEFAULT_OFFICE = {
  open: '09:30',
  close: '18:30',
  lunchStart: '13:00',
  lunchEnd: '14:00',
  grace: 15,
  half: 4,
  days: [1, 2, 3, 4, 5, 6]
};

const DEFAULT_WEEKOFF = {
  sunday: true,
  sats: [2, 4]
};

const DEFAULT_HOLIDAYS = [
  { id: 'hol-1', date: '2026-01-26', name: 'Republic Day', type: 'national', yearly: true },
  { id: 'hol-2', date: '2026-08-15', name: 'Independence Day', type: 'national', yearly: true },
  { id: 'hol-3', date: '2026-10-02', name: 'Gandhi Jayanti', type: 'national', yearly: true }
];

const DEFAULT_PERM_POLICY = { quota: 4 };
const DEFAULT_POPUP_CFG = { autoSecs: 30 };
const DEFAULT_GEOFENCE = { lat: 17.4486, lng: 78.3908, radius: 200 };
const DEFAULT_FACE_CFG = { mode: 'off', threshold: 0.5 };
export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

const DEFAULT_BIO_CFG = { photoFallback: true, emps: {} };

export async function GET() {
  const state = readRawState();

  const parseOr = (key: string, fallback: any) => {
    try {
      return state[key] ? JSON.parse(state[key]) : fallback;
    } catch {
      return fallback;
    }
  };

  const employees = getEmployees();
  const leaves = getLeaves();
  const attendance = getAttendance();

  const office = parseOr('hrms_office', DEFAULT_OFFICE);
  const weekoff = parseOr('hrms_weekoff', DEFAULT_WEEKOFF);
  const holidays = parseOr('hrms_holidays', DEFAULT_HOLIDAYS);
  const permPolicy = parseOr('hrms_perm_policy', DEFAULT_PERM_POLICY);
  const popupCfg = parseOr('hrms_popup_cfg', DEFAULT_POPUP_CFG);
  const popups = parseOr('hrms_popups', []);
  const geofence = parseOr('hrms_geofence', DEFAULT_GEOFENCE);
  const faceCfg = parseOr('hrms_face_cfg', DEFAULT_FACE_CFG);
  const bioCfg = parseOr('hrms_bio_cfg', DEFAULT_BIO_CFG);
  const selfies = parseOr('hrms_selfies', []);

  return NextResponse.json({
    office,
    weekoff,
    holidays,
    permPolicy,
    popupCfg,
    popups,
    geofence,
    faceCfg,
    bioCfg,
    selfies,
    counts: {
      employees: employees.length,
      leaves: leaves.length,
      attendance: attendance.length
    }
  }, { headers: NO_CACHE_HEADERS });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'HR_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized: Admin or HR Manager access required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { section, data } = body;

    const state = readRawState();

    switch (section) {
      case 'office':
        state['hrms_office'] = JSON.stringify(data);
        break;
      case 'weekoff':
        state['hrms_weekoff'] = JSON.stringify(data);
        break;
      case 'holidays':
        state['hrms_holidays'] = JSON.stringify(data);
        break;
      case 'permPolicy':
        state['hrms_perm_policy'] = JSON.stringify(data);
        break;
      case 'popupCfg':
        state['hrms_popup_cfg'] = JSON.stringify(data);
        break;
      case 'popups':
        state['hrms_popups'] = JSON.stringify(data);
        break;
      case 'geofence':
        state['hrms_geofence'] = JSON.stringify(data);
        break;
      case 'faceCfg':
        state['hrms_face_cfg'] = JSON.stringify(data);
        break;
      case 'bioCfg':
        state['hrms_bio_cfg'] = JSON.stringify(data);
        break;
      case 'resetAll': {
        // Reset to sample defaults
        state['hrms_office'] = JSON.stringify(DEFAULT_OFFICE);
        state['hrms_weekoff'] = JSON.stringify(DEFAULT_WEEKOFF);
        state['hrms_holidays'] = JSON.stringify(DEFAULT_HOLIDAYS);
        state['hrms_perm_policy'] = JSON.stringify(DEFAULT_PERM_POLICY);
        state['hrms_popup_cfg'] = JSON.stringify(DEFAULT_POPUP_CFG);
        state['hrms_popups'] = JSON.stringify([]);
        state['hrms_geofence'] = JSON.stringify(DEFAULT_GEOFENCE);
        state['hrms_face_cfg'] = JSON.stringify(DEFAULT_FACE_CFG);
        state['hrms_bio_cfg'] = JSON.stringify(DEFAULT_BIO_CFG);
        break;
      }
      default:
        return NextResponse.json({ error: 'Unknown settings section' }, { status: 400 });
    }

    writeRawState(state);
    return NextResponse.json({ success: true, section });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save settings' }, { status: 500 });
  }
}
