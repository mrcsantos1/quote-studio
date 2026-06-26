import { useState } from 'react';
import { Shell } from '@/components/Shell';
import { Preview } from '@/components/Preview';
import { LayoutEditor } from '@/components/LayoutEditor';

export function App() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [layoutOpen, setLayoutOpen] = useState(false);
  return (
    <>
      <Shell onPreview={() => setPreviewOpen(true)} onEditLayout={() => setLayoutOpen(true)} />
      {previewOpen && <Preview onClose={() => setPreviewOpen(false)} />}
      {layoutOpen && <LayoutEditor onClose={() => setLayoutOpen(false)} />}
    </>
  );
}
