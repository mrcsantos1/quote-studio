import type { LayoutTemplate, QuotationDocument, TokenDef } from '@/types/contracts';
import { buildPreviewHtml } from './buildPreviewHtml';
import { buildPagedStyles } from './previewStyles';

/**
 * HTML standalone enviado ao Gotenberg (PDF-1). É a MESMA prévia (buildPreviewHtml
 * + buildPagedStyles), porém **sem marca d'água** (PDF-2), com o Paged.js embutido
 * para paginar dentro do Chromium do Gotenberg — um motor só dos dois lados.
 *
 * `window.QS_PAGED_DONE` é setado pelo hook `after` do Paged.js; o Gotenberg espera
 * por essa expressão antes de imprimir (ver lib/pdf.ts). O `paged.polyfill.js` é
 * anexado como arquivo irmão no multipart.
 */
export function buildPdfDocument(
  doc: QuotationDocument,
  template: LayoutTemplate,
  catalog: TokenDef[],
): string {
  const styles = buildPagedStyles(template.page, { watermark: false });
  const body = buildPreviewHtml(doc, template, catalog);
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<style>${styles}</style>
<script>window.PagedConfig = { auto: true, after() { window.QS_PAGED_DONE = true; } };</script>
<script src="paged.polyfill.js"></script>
</head>
<body>${body}</body>
</html>`;
}
