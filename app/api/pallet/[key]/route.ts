import { NextResponse } from 'next/server';
import { db } from '@/app/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore';

export async function GET(
  _req: Request,
  { params }: { params: { key: string } }
) {
  const snap = await getDoc(doc(db, 'pallets', params.key));
  if (!snap.exists()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(snap.data(), { status: 200 });
}
