export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import bwipjs          from 'bwip-js';
import { nanoid }      from 'nanoid';
import { db }          from '@/app/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(req) {
  try {
    const { store, po, pallet, quantity } = await req.json();
    if (![store, po, pallet, quantity].every(Boolean)) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const key = nanoid(8);
    await setDoc(doc(db, 'pallets', key), {
      store,
      po,
      pallet,
      quantity,
      location: '',
      created: Date.now(),
    });

    const png = await bwipjs.toBuffer({
      bcid:        'code128',
      text:        key,
      scale:       3,
      height:      10,
      includetext: true,
      textsize:    10,
    });

    return NextResponse.json({
      key,
      barcode: `data:image/png;base64,${Buffer.from(png).toString('base64')}`,
    });
  } catch (err) {
    console.error('generate-barcode error', err);
    return NextResponse.json({ error: err.message || 'internal' }, { status: 500 });
  }
}
