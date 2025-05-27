export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig';

/* ── GET /api/pallet/[key] ── */
export async function GET(_req, { params }) {
  const snap = await getDoc(doc(db, 'pallets', params.key));
  if (!snap.exists()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(snap.data(), { status: 200 });
}

/* ── POST /api/pallet/[key]  body:{ location } ── */
export async function POST(req, { params }) {
  const { location } = await req.json();
  if (!location) {
    return NextResponse.json({ error: 'Missing location' }, { status: 400 });
  }

  // rules allow unauthenticated updates of 'location'
  await updateDoc(doc(db, 'pallets', params.key), { location });
  return NextResponse.json({ message: 'Location updated' }, { status: 200 });
}
