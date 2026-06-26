import { useState } from 'react';
import { Shell } from '@/components/Shell';
import { Preview } from '@/components/Preview';

export function App() {
  const [previewOpen, setPreviewOpen] = useState(false);
  return (
    <>
      <Shell onPreview={() => setPreviewOpen(true)} />
      {previewOpen && <Preview onClose={() => setPreviewOpen(false)} />}
    </>
  );
}
