// ⬇️ keep this first so Vercel deploys on the Node.js runtime
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import bwipjs from 'bwip-js';
import { nanoid } from 'nanoid';

import { auth, db } from '@/app/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

/* ---------- one‑time sign‑in (per cold‑start) ---------- */
let signInOnce;
async function ensureBackendSignIn() {
  if (!signInOnce) {
    signInOnce = signInWithEmailAndPassword(
      auth,
      process.env.BACKEND_EMAIL,      // add these two env‑vars in Vercel
      process.env.BACKEND_PASSWORD,
    ).catch(err => {
      console.error('Firebase sign‑in failed', err);
      throw new Error('backend auth failed');
    });
  }
  return signInOnce;
}

/* ---------- POST /api/generate‑barcode ---------- */
export async function POST(req) {
  try {
    const { store, po, pallet, quantity } = await req.json();
    if (![store, po, pallet, quantity].every(Boolean)) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Firestore rule requires auth for CREATE on /pallets/*
    await ensureBackendSignIn();

    const key = nanoid(8);

    await setDoc(doc(db, 'pallets', key), {
      store,
      po,
      pallet,
      quantity,
      location: '',
      status: '',
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
    console.error('generate‑barcode error', err);
    return NextResponse.json({ error: err.message || 'internal' }, { status: 500 });
  }
}
