import type { LayoutTemplate } from '@/types/contracts';

// Layout "Completo": slots em ordem de documento. A projeção (lib/projectTree.ts)
// usa esta ordem para decidir ONCE-inicial (antes do 1º PER_SPLIT),
// grupos por split (PER_SPLIT) e ONCE-final (após o último PER_SPLIT).
// PRODUCT é read-only estruturado (D8/Q2): editable=false. HEADER/FOOTER são
// banda corrente (FID-3) e não reordenáveis.
// `removable`/`fullPage` (BLK) são editáveis em runtime pelo editor de layout.
export const layoutCompleto: LayoutTemplate = {
  id: 'completo',
  name: 'Completo',
  page: {
    size: 'A4',
    marginsMm: { top: 20, right: 18, bottom: 20, left: 18 },
    baseFontPt: 10.5,
  },
  slots: [
    { id: 'cover', type: 'COVER', label: 'Capa', cardinality: 'ONCE', editable: false, reorderable: false, removable: true, fullPage: true, defaultSource: 'ENGINE' },
    { id: 'header', type: 'HEADER', label: 'Cabeçalho', cardinality: 'ONCE', editable: false, reorderable: false, removable: true, defaultSource: 'ENGINE' },
    { id: 'intro', type: 'INTRO', label: 'Introdução', cardinality: 'ONCE', editable: true, reorderable: true, removable: true, defaultSource: 'ENGINE' },
    { id: 'product', type: 'PRODUCT', label: 'Produto', cardinality: 'PER_SPLIT', editable: false, reorderable: false, removable: false, defaultSource: 'ENGINE' },
    { id: 'technical', type: 'TECHNICAL_NOTES', label: 'Notas técnicas', cardinality: 'PER_SPLIT', editable: true, reorderable: true, removable: true, defaultSource: 'OPTIONAL' },
    { id: 'commercial', type: 'COMMERCIAL_NOTES', label: 'Notas comerciais', cardinality: 'PER_SPLIT', editable: true, reorderable: true, removable: true, defaultSource: 'OPTIONAL' },
    { id: 'closing', type: 'CLOSING', label: 'Encerramento', cardinality: 'ONCE', editable: true, reorderable: true, removable: true, defaultSource: 'ENGINE' },
    { id: 'footer', type: 'FOOTER', label: 'Rodapé', cardinality: 'ONCE', editable: false, reorderable: false, removable: true, defaultSource: 'ENGINE' },
  ],
};
