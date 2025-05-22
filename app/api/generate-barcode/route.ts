import { NextRequest, NextResponse } from 'next/server';
import bwipjs from 'bwip-js';
import { nanoid } from 'nanoid';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig'; // Import your Firebase config

// POST  /api/generate-barcode
// Body: { store, po, pallet, quantity }
export async function POST(req: NextRequest) {
  const { store, po, pallet, quantity } = await req.json();

  if (!store || !po || !pallet || !quantity) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // 1. Create a short key & save the full record
  const key = nanoid(8);                      // e.g. "X4at91Qr"
  await setDoc(doc(db, 'pallets', key), {
    store, po, pallet, quantity,
    created: Date.now(),
  });

  // 2. Render barcode that only encodes the key
  const png = await bwipjs.toBuffer({
    bcid:        'code128',
    text:        key,
    scale:       3,
    height:      10,
    includetext: true,
    textsize:    10,
  });

  const b64 = Buffer.from(png).toString('base64');
  return NextResponse.json(
    {
      barcode: `data:image/png;base64,${b64}`,
      key,                 // optional: let Excel show or log it
    },
    { status: 200 }
  );
}
