import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/admin';
import { doc, getDoc } from 'firebase-admin/firestore';

export const runtime = 'nodejs';          // Firestore needs Node runtime

// Correctly‑typed GET handler
export async function GET(
  _req: NextRequest,
  { params }: { params: { key: string } }
) {
  const snap = await getDoc(doc(adminDb, 'pallets', params.key));

  if (!snap.exists()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(snap.data(), { status: 200 });
}
