export const runtime = 'nodejs'; 

import { NextResponse } from 'next/server';
import { db } from '../../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

/* ── GET /api/pallet/[key] ──  fetch pallet info */
export async function GET(_req, { params }) {
  const snap = await getDoc(doc(db, 'pallets', params.key));

  if (!snap.exists()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(snap.data(), { status: 200 });
}

export async function POST(req, { params }) {
  const { location } = await req.json();
  if (!location) {
    return NextResponse.json({ error: 'Missing location' }, { status: 400 });
  }

  await updateDoc(doc(db, 'pallets', params.key), { location });
  return NextResponse.json({ message: 'Location updated' }, { status: 200 });}