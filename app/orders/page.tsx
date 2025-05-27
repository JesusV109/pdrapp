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
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  startAfter,
  limit,
  getDocs,
  type DocumentSnapshot,
} from 'firebase/firestore';

/* ---------- types ---------- */
type Source = 'order' | 'pallet';

interface OrderDoc {
  id: string;
  source: Source;
  location: string;
  companyName: string;
  numberOrder: string;
  po: string;
  destination: string;
  palletNumber: string;
  store?: string;
  pallet?: string;
  quantity?: string;
}
interface PalletDoc {
  id: string;
  source: Source;
  store: string;
  po: string;
  pallet: string;
  quantity: string;
  created: number;
  location?: string;
  companyName?: string;
  numberOrder?: string;
  destination?: string;
  palletNumber?: string;
}
type Row = OrderDoc | PalletDoc;

/* ---------- constants ---------- */
const PAGE_SIZE = 100;

/* ---------- component ---------- */
export default function OrdersAndPallets() {
  const [user, setUser] = useState<User | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState('');
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  /* auth listener */
  useEffect(() => onAuthStateChanged(auth, setUser), []);

  /* live ORDERS listener */
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
      setRows(prev => [...prev.filter(r => r.source !== 'order'), ...orders]);
    });
    return unsub;
  }, [user]);

  /* load next page of pallets */
  const loadNextPage = useCallback(async () => {
    if (!user || loadingMore) return;
    setLoadingMore(true);

    const q = query(
      collection(db, 'pallets'),
      orderBy('created', 'desc'),
      limit(PAGE_SIZE),
      ...(lastDoc ? [startAfter(lastDoc)] : []),
    );

    const snap = await getDocs(q);
    const pallets = snap.docs.map(
      d => ({
        id: d.id,
        source: 'pallet',
        ...(d.data() as Omit<PalletDoc, 'id' | 'source'>),
      }),
    ) as PalletDoc[];

    setRows(prev => [...prev.filter(r => r.source !== 'pallet'), ...pallets]);
    setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
    setLoadingMore(false);
  }, [user, loadingMore, lastDoc]);

  /* first page when user is ready */
  useEffect(() => { if (user) loadNextPage(); }, [user, loadNextPage]);

  /* delete & archive */
  async function handleDelete(row: Row) {
    if (!confirm('Delete this entry?')) return;
    try {
      await addDoc(collection(db, 'deletedOrders'), {
        ...row,
        deletedAt: new Date().toISOString(),
      });
      await deleteDoc(doc(db, row.source === 'order' ? 'orders' : 'pallets', row.id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  /* auth gate */
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h1 className="mb-4 text-xl">Please sign in to view data.</h1>
        <Link href="/signIn" className="text-blue-600 underline">
          Go to Sign In
        </Link>
      </div>
    );
  }

  /* search filter */
  const term     = search.toLowerCase();
  const filtered = rows.filter(r =>
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

      {filtered.length === 0 ? (
        <p>No results.</p>
      ) : (
        /* ‑‑‑ scroll container: fixed height, its own y‑scroll ‑‑‑ */
        <div className="w-full max-w-xl max-h-[70vh] overflow-y-auto border rounded p-4 space-y-4">
          <ul className="space-y-4">
            {filtered.map(r => (
              <li key={r.id} className="p-4 border rounded shadow-sm space-y-1">
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
          </ul>

          {/* pagination button stays at bottom of the scroll area */}
          {lastDoc && (
            <button
              disabled={loadingMore}
              onClick={loadNextPage}
              className="mt-4 w-full border rounded py-2"
            >
              {loadingMore ? 'Loading…' : 'Load more pallets'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
