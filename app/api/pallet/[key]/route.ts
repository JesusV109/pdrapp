import { NextRequest, NextResponse } from 'next/server';

// IF you added an @/* alias in tsconfig, keep this:
import { db } from '@/app/firebaseConfig'

// IF you did **not** add an alias, use the relative path instead:
// import { db } from '../../../firebaseConfig';

import { doc, getDoc } from 'firebase/firestore';

// ───── GET handler ─────
export async function GET(
  _req: NextRequest,
  { params }: { params: { key: string } }
) {
  const snap = await getDoc(doc(db, 'pallets', params.key));

  if (!snap.exists()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(snap.data(), { status: 200 });
}
