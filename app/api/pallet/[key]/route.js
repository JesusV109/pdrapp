import { NextResponse } from 'next/server';
import { db } from '../../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(_req, { params }) {
  const { key } = params;

  const snap = await getDoc(doc(db, 'pallets', key));
  if (!snap.exists()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(snap.data(), { status: 200 });
}
