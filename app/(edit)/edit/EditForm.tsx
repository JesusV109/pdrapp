'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/app/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

type Source = 'order' | 'pallet';

export default function EditForm({ source, id }: { source: Source; id: string }) {
  const router = useRouter();
  const [data, setData] = useState<Record<string, string> | null>(null);
  const [busy, setBusy] = useState(false);

  /* fetch once */
  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, source === 'order' ? 'orders' : 'pallets', id));
      if (!snap.exists()) {
        alert('Not found');
        router.back();
        return;
      }
      setData(snap.data());
    })();
  }, [id, source, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!data) return;
    setData({ ...data, [e.target.name]: e.target.value });
  }

  async function save() {
    if (!data) return;
    setBusy(true);
    try {
      await updateDoc(doc(db, source === 'order' ? 'orders' : 'pallets', id), data);
      router.push('/orders');
    } catch (err) {
      console.error(err);
      alert('Save failed');
    } finally {
      setBusy(false);
    }
  }

  if (!data) return null;

  return (
    <main className="flex flex-col gap-4 p-8 max-w-lg">
      <h1 className="text-2xl font-semibold">Edit {source}</h1>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex flex-col gap-1">
          <label className="font-medium capitalize">{key}</label>
          <input
            className="border p-2 rounded"
            name={key}
            value={value}
            onChange={handleChange}
          />
        </div>
      ))}
      <button
        onClick={save}
        disabled={busy}
        className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
      >
        {busy ? 'Saving…' : 'Save'}
      </button>
    </main>
  );
}
