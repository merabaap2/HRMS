import { NextRequest, NextResponse } from 'next/server';
import { getAttendance, saveAttendance, getEmployees, addActivity, readRawState, writeRawState } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { AttendanceRecord } from '@/types';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const days = searchParams.get('days');
  const empId = searchParams.get('empId');

  const attendance = getAttendance();

  // If role is EMPLOYEE, restrict strictly to their own attendance records
  if (session && session.role === 'EMPLOYEE') {
    const myRecords = attendance.filter(a => a.empId === session.empId);
    if (date) {
      return NextResponse.json(myRecords.filter(a => a.date === date));
    }
    return NextResponse.json(myRecords);
  }

  if (empId) {
    const records = attendance.filter(a => a.empId === empId);
    return NextResponse.json(records);
  }

  if (days) {
    const numDays = Math.min(Math.max(parseInt(days, 10) || 7, 1), 30);
    const dates: string[] = [];
    const now = new Date();
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    const filtered = attendance.filter(a => dates.includes(a.date));
    return NextResponse.json({ dates, records: filtered });
  }

  if (date) {
    const records = attendance.filter(a => a.date === date);
    return NextResponse.json(records);
  }

  // Default: return today's attendance
  const today = getTodayStr();
  const records = attendance.filter(a => a.date === today);
  return NextResponse.json(records);
}

// Office Geofence Configuration (Enterprise Campus Coordinates)
const DEFAULT_OFFICE_LAT = 17.4401; // Hyderabad HITEC City / Campus HQ
const DEFAULT_OFFICE_LNG = 78.3489;
const DEFAULT_GEOFENCE_RADIUS_METERS = 500; // 500 meters allowed perimeter

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      empId,
      method = 'face',
      photo,
      notes,
      latitude,
      longitude,
      faceMatchScore,
      bypassGeofence = false
    } = body;

    if (!empId) {
      return NextResponse.json({ error: 'empId is required' }, { status: 400 });
    }

    // Role check: An EMPLOYEE can ONLY punch for themselves!
    if (session.role === 'EMPLOYEE' && session.empId && session.empId !== empId) {
      return NextResponse.json({ error: 'Forbidden: You can only record attendance for your own verified profile' }, { status: 403 });
    }

    const employees = getEmployees();
    const employee = employees.find(e => e.id === empId || e.empCode === empId);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // 1. LOAD SYSTEM SETTINGS CONFIGURATION
    const state = readRawState();
    let officeCfg = { open: '09:30', close: '18:30', grace: 15 };
    let geofenceCfg = { lat: DEFAULT_OFFICE_LAT, lng: DEFAULT_OFFICE_LNG, radius: DEFAULT_GEOFENCE_RADIUS_METERS };
    let faceCfg = { mode: 'off', threshold: 0.5 };

    try {
      if (state['hrms_office']) officeCfg = JSON.parse(state['hrms_office']);
      if (state['hrms_geofence']) geofenceCfg = JSON.parse(state['hrms_geofence']);
      if (state['hrms_face_cfg']) faceCfg = JSON.parse(state['hrms_face_cfg']);
    } catch {}

    // 2. GEOFENCE LOCATION VERIFICATION
    let distanceMeters: number | undefined = undefined;
    if (latitude !== undefined && longitude !== undefined) {
      const officeLat = employee.assignedOfficeLat || geofenceCfg.lat || DEFAULT_OFFICE_LAT;
      const officeLng = employee.assignedOfficeLng || geofenceCfg.lng || DEFAULT_OFFICE_LNG;
      const maxRadius = employee.geofenceRadiusMeters || geofenceCfg.radius || DEFAULT_GEOFENCE_RADIUS_METERS;

      distanceMeters = calculateDistanceMeters(latitude, longitude, officeLat, officeLng);

      if (!bypassGeofence && distanceMeters > maxRadius) {
        return NextResponse.json({
          error: `Geofence Violation: You are ${distanceMeters}m away from the authorized office premises (Allowed: within ${maxRadius}m). Attendance punch rejected.`,
          distanceMeters,
          maxRadius
        }, { status: 400 });
      }
    }

    // 3. BIOMETRIC FACIAL MATCH VERIFICATION
    if (method === 'face' && faceMatchScore !== undefined) {
      const thresholdPct = (faceCfg.threshold || 0.5) * 100;
      if (faceCfg.mode === 'block' && faceMatchScore < thresholdPct) {
        return NextResponse.json({
          error: `Face Verification Blocked: Facial match score (${faceMatchScore.toFixed(1)}%) is below the configured strictness threshold (${thresholdPct}%). Check-in refused.`,
          faceMatchScore
        }, { status: 400 });
      }
    }

    const today = getTodayStr();
    const attendance = getAttendance();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let record = attendance.find(a => a.empId === employee.id && a.date === today);

    // Append selfie to hrms_selfies audit log if photo is provided
    if (photo) {
      try {
        const rawSelfies = state['hrms_selfies'] ? JSON.parse(state['hrms_selfies']) : [];
        const newSelfie = {
          id: `sf-${Date.now()}`,
          empId: employee.id,
          name: employee.name,
          date: today,
          type: record ? 'Check Out' : 'Check In',
          time: timeStr,
          distance: distanceMeters !== undefined ? `${distanceMeters} m` : 'on geofence',
          face: faceMatchScore ? `Match (${faceMatchScore.toFixed(0)}%)` : 'Match',
          photo
        };
        rawSelfies.unshift(newSelfie);
        state['hrms_selfies'] = JSON.stringify(rawSelfies.slice(0, 50));
        writeRawState(state);
      } catch (err) {
        console.error('Failed to update selfie audit history:', err);
      }
    }

    if (record) {
      // Clock Out
      record.outTime = timeStr;
      if (photo) record.photo = photo;
      if (notes) record.notes = notes;
      if (latitude) record.latitude = latitude;
      if (longitude) record.longitude = longitude;
      if (distanceMeters !== undefined) record.distanceMeters = distanceMeters;
      if (faceMatchScore !== undefined) record.faceMatchScore = faceMatchScore;
      saveAttendance(attendance);

      const locSuffix = distanceMeters !== undefined ? ` [${distanceMeters}m from HQ]` : '';
      const faceSuffix = faceMatchScore !== undefined ? ` [Face: ${faceMatchScore.toFixed(1)}% match]` : '';

      addActivity(
        `${employee.name} (${employee.empCode}) clocked out at ${timeStr} via ${method}${locSuffix}${faceSuffix}`,
        session.name,
        'info'
      );

      return NextResponse.json({ success: true, action: 'clock_out', record });
    } else {
      // Clock In - evaluate against configured office opening time + grace period
      const [openH, openM] = (officeCfg.open || '09:30').split(':').map(Number);
      const openTotalMinutes = (openH || 9) * 60 + (openM || 30);
      const graceMinutes = Number(officeCfg.grace) || 15;
      const nowTotalMinutes = now.getHours() * 60 + now.getMinutes();
      const isLate = nowTotalMinutes > (openTotalMinutes + graceMinutes);

      const newRecord: AttendanceRecord = {
        id: `att_${employee.id}_${today}`,
        empId: employee.id,
        date: today,
        inTime: timeStr,
        status: isLate ? 'late' : 'present',
        method: method,
        photo: photo,
        notes: notes,
        latitude: latitude,
        longitude: longitude,
        distanceMeters: distanceMeters,
        faceMatchScore: faceMatchScore
      };

      attendance.push(newRecord);
      saveAttendance(attendance);

      const locSuffix = distanceMeters !== undefined ? ` [${distanceMeters}m from HQ]` : '';
      const faceSuffix = faceMatchScore !== undefined ? ` [Face: ${faceMatchScore.toFixed(1)}% match]` : '';

      addActivity(
        `${employee.name} (${employee.empCode}) clocked in at ${timeStr} [${newRecord.status.toUpperCase()}] via ${method}${locSuffix}${faceSuffix}`,
        session.name,
        isLate ? 'warning' : 'success'
      );

      return NextResponse.json({ success: true, action: 'clock_in', record: newRecord });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error processing punch' }, { status: 500 });
  }
}
