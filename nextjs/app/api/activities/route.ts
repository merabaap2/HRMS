import { NextRequest, NextResponse } from 'next/server';
import { getActivities } from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

export async function GET(req: NextRequest) {
  const activities = getActivities();
  return NextResponse.json(activities, { headers: NO_CACHE_HEADERS });
}
