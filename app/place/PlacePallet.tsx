'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/app/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

/* ---------- types ---------- */
interface PalletData {
  id: string;
  store: string;
  po: string;
  pallet: string;
  quantity: string;
  created: number;
  location?: string;
}

/* ---------- component ---------- */
export default function PlacePallet() {
  const params     = useSearchParams();
  const initialKey = params.get('key') ?? '';

  const [key,      setKey]      = useState(initialKey);
  const [pallet,   setPallet]   = useState<PalletData | null>(null);
  const [location, setLocation] = useState('');
  const router                  = useRouter();

  /* fetch pallet by key */
  async function fetchPallet() {
    try {
      const snap = await getDoc(doc(db, 'pallets', key));
      if (!snap.exists()) {
        alert('Key not found');
        setPallet(null);
        return;
      }
      setPallet({ id: snap.id, ...(snap.data() as Omit<PalletData, 'id'>) });
    } catch (error) {
      console.error(error);
      alert('Error fetching pallet');
    }
  }

  /* save location */
  async function save() {
    if (!location) {
      alert('Enter a location first');
      return;
    }
    try {
      await updateDoc(doc(db, 'pallets', key), { location });
      router.push('/orders');          // back to list
    } catch (error) {
      console.error(error);
      alert('Failed to save location');
    }
  }

  return (
    <main className="flex flex-col gap-4 p-8 max-w-lg">
      <h1 className="text-2xl font-semibold">Place Pallet</h1>

      <input
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="Scan or enter UPC key"
        className="border p-2 rounded"
      />

      <button onClick={fetchPallet} className="btn-primary w-40">
        Load pallet
      </button>

      {pallet && (
        <>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
{JSON.stringify(pallet, null, 2)}
          </pre>

          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location"
            className="border p-2 rounded"
          />

          <button onClick={save} className="btn-primary w-40">
            Save location
          </button>
        </>
      )}
    </main>
  );
}
