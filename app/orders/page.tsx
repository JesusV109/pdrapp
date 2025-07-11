'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { auth, db } from '@/app/firebaseConfig';
import {
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  type DocumentData,
  type QuerySnapshot,
  type QueryDocumentSnapshot,
  type DocumentSnapshot,
} from 'firebase/firestore';

/* ---------- types ---------- */
type Source = 'order' | 'pallet';

interface OrderDoc {
  id: string;  source: Source;
  location: string; companyName: string; numberOrder: string;
  po: string; destination: string; palletNumber: string;
  /* pallet keys (for union) */
  store?: string; pallet?: string; quantity?: string;
}

interface PalletDoc {
  id: string;  source: Source;
  store: string; po: string; pallet: string; quantity: string; created: number;
  location?: string; companyName?: string; numberOrder?: string;
  destination?: string; palletNumber?: string;
}

type Row = OrderDoc | PalletDoc;

/* ---------- constants ---------- */
const PAGE_SIZE = 100;

/* ---------- page component ---------- */
export default function OrdersAndPallets() {
  /* state */
  const [user, setUser]     = useState<User | null>(null);
  const [rows, setRows]     = useState<Row[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  /* --- auth listener --- */
  useEffect(() => onAuthStateChanged(auth, setUser), []);

  /* --- live ORDERS listener --- */
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'orders'), snap => {
      const orders = snap.docs.map(
        d => ({
          id: d.id,
          source: 'order',
          ...(d.data() as Omit<OrderDoc, 'id' | 'source'>),
        }),
      ) as OrderDoc[];
      setRows(prev => [
        ...prev.filter(r => r.source !== 'order'),
        ...orders,
      ]);
    });
    return unsub;
  }, [user]);

  /* --- load ALL pallets in pages --- */
  const loadPallets = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    let cursor: DocumentSnapshot<DocumentData> | null = null;

    while (true) {
      const snap: QuerySnapshot<DocumentData> = await getDocs(
        query(
          collection(db, 'pallets'),
          orderBy('created', 'desc'),
          ...(cursor ? [startAfter(cursor)] : []),
          limit(PAGE_SIZE),
        ),
      );

      const batch = snap.docs.map(
        (d: QueryDocumentSnapshot<DocumentData>) => ({
          id: d.id,
          source: 'pallet',
          ...(d.data() as Omit<PalletDoc, 'id' | 'source'>),
        }),
      ) as PalletDoc[];

      setRows(prev => [
        ...prev.filter(r => r.source !== 'pallet'),
        ...batch,
      ]);

      cursor = snap.docs[snap.docs.length - 1] ?? null;
      if (batch.length < PAGE_SIZE) break;   // reached last page
    }

    setLoading(false);
  }, [user]);

  /* first load */
  useEffect(() => { if (user) loadPallets(); }, [user, loadPallets]);

  /* --- delete & archive --- */
  async function handleDelete(row: Row) {
    if (!confirm('Delete this entry?')) return;
    await addDoc(collection(db, 'deletedOrders'), {
      ...row,
      deletedAt: new Date().toISOString(),
    });
    await deleteDoc(doc(db, row.source === 'order' ? 'orders' : 'pallets', row.id));
  }

  /* --- auth gate --- */
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h1 className="mb-4 text-xl">Please sign in to view data.</h1>
        <Link href="/signIn" className="text-blue-600 underline">Go to Sign In</Link>
      </div>
    );
  }

  /* ---- filter ---- */
  const term      = search.toLowerCase();
  const filtered  = rows.filter(r =>
    JSON.stringify(r).toLowerCase().includes(term),
  );

  /* ---------- UI ---------- */
  return (
    <div className="flex flex-col items-center w-screen min-h-screen p-8">
      <h1 className="mb-4 text-2xl font-semibold">Orders &amp; Pallets</h1>

      <input
        className="w-full max-w-xl p-2 mb-6 border rounded"
        placeholder="Search anything…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading && rows.length === 0 && <p>Loading…</p>}

      {filtered.length > 0 && (
        <ul className="w-full max-w-xl space-y-4">
          {filtered.map(r => (
            <li key={r.id} className="p-4 border rounded shadow-sm space-y-1">
              {/* tag */}
              <span className={
                r.source === 'order'
                  ? 'inline-block px-2 py-0.5 text-xs rounded bg-purple-200 text-purple-800'
                  : 'inline-block px-2 py-0.5 text-xs rounded bg-green-200 text-green-800'
              }>
                {r.source}
              </span>

              {'location' in r && (
                <p><strong>Location:</strong> {r.location || <em className="text-gray-400">—</em>}</p>
              )}

              {r.source === 'order' ? (
                <>
                  <p><strong>Company:</strong> {r.companyName}</p>
                  <p><strong>Order #:</strong> {r.numberOrder}</p>
                  <p><strong>PO:</strong> {r.po}</p>
                  <p><strong>Destination:</strong> {r.destination}</p>
                  <p><strong>Pallet #:</strong> {r.palletNumber}</p>
                </>
              ) : (
                <>
                  <p><strong>Store:</strong> {r.store}</p>
                  <p><strong>PO:</strong> {r.po}</p>
                  <p><strong>Pallet:</strong> {r.pallet}</p>
                  <p><strong>Qty:</strong> {r.quantity}</p>
                </>
              )}

              <div className="flex gap-3 mt-3">
                <Link
                  href={`/edit/${r.source}/${r.id}`}
                  className="px-3 py-1 text-white bg-blue-600 rounded hover:bg-blue-700 text-sm"
                >
                  edit
                </Link>
                <button
                  onClick={() => handleDelete(r)}
                  className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600 text-sm"
                >
                  delete
                </button>
              </div>
            </li>
          ))}

          {/* bottom padding so last card isn’t glued to viewport */}
          <li aria-hidden className="py-4" />
        </ul>
      )}
    </div>
  );
}
