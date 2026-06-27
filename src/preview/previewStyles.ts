import type { PageFormat } from '@/types/contracts';

const SIZE_MM: Record<PageFormat['size'], string> = { A4: '210mm 297mm' };

export interface PagedStyleOptions {
  /** Estampa "RASCUNHO" (FID-7). Só na prévia/visualização; ausente no download (PDF-2). */
  watermark?: boolean;
}

/**
 * CSS de impressão para o Paged.js (FID-5/7): @page com tamanho A4 físico,
 * margens da fonte única, header/footer correntes (FID-3), contador
 * "Página X de Y" e (opcional) marca d'água. Mesmo HTML/CSS porta p/ Gotenberg/Chromium.
 */
export function buildPagedStyles(page: PageFormat, opts: PagedStyleOptions = {}): string {
  const { watermark = true } = opts;
  const { top, right, bottom, left } = page.marginsMm;
  const watermarkCss = watermark
    ? `
/* Marca d'água (FID-7) — só na visualização; some no download (PDF-2). */
.pagedjs_pagebox::after {
  content: "RASCUNHO";
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%) rotate(-32deg);
  font-size: 80pt;
  font-weight: 700;
  color: rgba(37, 99, 235, 0.07);
  letter-spacing: 0.1em;
  pointer-events: none;
  z-index: 9999;
}`
    : '';
  return `
@page {
  size: ${SIZE_MM[page.size]};
  margin: ${top}mm ${right}mm ${bottom}mm ${left}mm;
  @top-left { content: element(runningHeader); }
  @bottom-left { content: element(runningFooter); }
  @bottom-right {
    content: "Página " counter(page) " de " counter(pages);
    font-size: 9pt;
    color: #555;
  }
}
.qs-print-header { position: running(runningHeader); font-size: 8.5pt; color: #54606d; display: flex; gap: 12px; }
.qs-print-footer { position: running(runningFooter); font-size: 8.5pt; color: #54606d; display: flex; gap: 12px; }
.qs-print-doc { font-size: ${page.baseFontPt}pt; line-height: 1.45; color: #14181d; }
.qs-print-block { margin-bottom: 10px; }
.qs-print-block h1 { font-size: 1.7em; }
/* Bloco em página cheia (BLK fullPage): página própria + altura útil */
.qs-print-block--fullpage { break-after: page; min-height: 100%; display: flex; flex-direction: column; justify-content: center; }
.qs-print-block img { max-width: 100%; }
.qs-print-block table { border-collapse: collapse; width: 100%; }
.qs-print-block th, .qs-print-block td { border: 1px solid #cbd2da; padding: 4px 6px; }
.qs-print-block blockquote { border-left: 3px solid #2563eb; background: #f1f5ff; margin: 8px 0; padding: 6px 10px; }
.qs-token { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 4px; padding: 0 4px; white-space: nowrap; }
.pagedjs_page { position: relative; }
${watermarkCss}
`;
}
