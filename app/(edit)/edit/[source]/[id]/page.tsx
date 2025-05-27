'use client';        

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import EditForm from  '../../EditForm';
console.log('👉 EditForm is', EditForm);

export default function EditEntryPage() {
  // next/navigation hook for client components
  const { source, id } = useParams<{
    source: 'order' | 'pallet';
    id: string;
  }>();

  /* If the router hasn’t hydrated yet */
  if (!source || !id) return <p className="p-8">Loading…</p>;

  return (
    <Suspense fallback={<p className="p-8">Loading…</p>}>
      <EditForm source={source} id={id} />
    </Suspense>
  );
}