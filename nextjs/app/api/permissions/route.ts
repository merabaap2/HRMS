import { NextRequest, NextResponse } from 'next/server';
import { getPermissions, savePermissions, getEmployees, addActivity, readRawState } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { PermissionRecord } from '@/types';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const permissions = getPermissions();

  if (session.role === 'EMPLOYEE') {
    const myPerms = permissions.filter(p => p.empId === session.empId);
    return NextResponse.json(myPerms);
  }

  const { searchParams } = new URL(req.url);
  const empId = searchParams.get('empId');
  if (empId) {
    return NextResponse.json(permissions.filter(p => p.empId === empId));
  }

  return NextResponse.json(permissions);
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const targetEmpId = session.role === 'EMPLOYEE' ? session.empId : (data.empId || session.empId);

    if (!targetEmpId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const employees = getEmployees();
    const emp = employees.find(e => e.id === targetEmpId);

    const permType = data.type || 'permission';
    const hours = Number(data.hours) || 1;
    const permDate = data.date || new Date().toISOString().split('T')[0];

    // Read configured permission quota from settings
    const rawState = readRawState();
    let permQuota = 4;
    try {
      if (rawState['hrms_perm_policy']) {
        const parsed = JSON.parse(rawState['hrms_perm_policy']);
        if (parsed.quota) permQuota = Number(parsed.quota);
      }
    } catch {}

    const permissions = getPermissions();

    if (permType === 'permission') {
      const currentMonth = permDate.slice(0, 7);
      const usedHours = permissions
        .filter(p => p.empId === targetEmpId && p.type === 'permission' && (p.date || '').startsWith(currentMonth) && p.status !== 'rejected')
        .reduce((sum, p) => sum + p.hours, 0);

      if (usedHours + hours > permQuota) {
        return NextResponse.json({
          error: `Monthly quota exceeded. You have already used or requested ${usedHours}h of your ${permQuota}h monthly quota.`
        }, { status: 400 });
      }
    }

    const newPerm: PermissionRecord = {
      id: `perm_${Date.now()}`,
      empId: targetEmpId,
      type: permType,
      hours: hours,
      fromTime: data.fromTime || '14:00',
      toTime: data.toTime || '15:00',
      reason: data.reason || 'Personal requisition',
      status: 'pending',
      date: permDate
    };

    permissions.unshift(newPerm);
    savePermissions(permissions);

    addActivity(
      `Permission requested: ${emp?.name || targetEmpId} (${newPerm.hours}h - ${newPerm.reason})`,
      session.name,
      'warning'
    );

    return NextResponse.json({ success: true, permission: newPerm }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating permission' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'HR_MANAGER')) {
    return NextResponse.json({ error: 'Forbidden: Admin access required to review permissions' }, { status: 403 });
  }

  try {
    const { id, status } = await req.json();
    if (!id || (status !== 'approved' && status !== 'rejected')) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const permissions = getPermissions();
    const perm = permissions.find(p => p.id === id);
    if (!perm) {
      return NextResponse.json({ error: 'Permission request not found' }, { status: 404 });
    }

    perm.status = status;
    perm.decidedBy = session.name;
    perm.decidedAt = new Date().toISOString();
    savePermissions(permissions);

    const employees = getEmployees();
    const emp = employees.find(e => e.id === perm.empId);

    addActivity(
      `Permission request ${status.toUpperCase()}: ${emp?.name || perm.empId} by ${session.name}`,
      session.name,
      status === 'approved' ? 'success' : 'danger'
    );

    return NextResponse.json({ success: true, permission: perm });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error reviewing permission' }, { status: 500 });
  }
}
