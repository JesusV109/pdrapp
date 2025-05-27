import { Suspense } from 'react';
import PlacePallet from './PlacePallet';

export default function PlacePage() {
  return (
    <Suspense fallback={<p className="p-8">Loading…</p>}>
      <PlacePallet />
    </Suspense>
  );
}
