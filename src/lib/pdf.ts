// Caminho relativo ao dist do Paged.js (o `exports` do pacote não expõe o subpath
// como bare specifier; um caminho relativo contorna isso). Enviado ao Gotenberg.
import pagedSource from '../../node_modules/pagedjs/dist/paged.polyfill.min.js?raw';
import type { LayoutTemplate, QuotationDocument, TokenDef } from '@/types/contracts';
import { buildPdfDocument } from '@/preview/buildPdfDocument';

// Endpoint do Gotenberg: em dev usa o proxy /gotenberg (vite.config); em prod, um BFF.
const PDF_ENDPOINT = import.meta.env.VITE_GOTENBERG_URL || '/gotenberg';

/**
 * Gera o PDF no Gotenberg (PDF-1): manda o HTML standalone (Paged.js embutido,
 * sem marca d'água) + o polyfill como arquivo irmão. O Gotenberg pagina no
 * Chromium e espera `window.QS_PAGED_DONE` antes de imprimir. Texto vetorial
 * selecionável (sem transform). Devolve o Blob do PDF.
 */
export async function generatePdf(
  doc: QuotationDocument,
  template: LayoutTemplate,
  catalog: TokenDef[],
): Promise<Blob> {
  const form = new FormData();
  form.append('files', new File([buildPdfDocument(doc, template, catalog)], 'index.html', { type: 'text/html' }));
  form.append('files', new File([pagedSource], 'paged.polyfill.js', { type: 'text/javascript' }));
  // Geometria vem do CSS @page (Paged.js); margens do Gotenberg em 0.
  form.append('preferCssPageSize', 'true');
  form.append('printBackground', 'true');
  for (const m of ['marginTop', 'marginBottom', 'marginLeft', 'marginRight']) form.append(m, '0');
  form.append('waitForExpression', 'window.QS_PAGED_DONE === true');

  const res = await fetch(`${PDF_ENDPOINT}/forms/chromium/convert/html`, { method: 'POST', body: form });
  if (!res.ok) {
    throw new Error(`Falha ao gerar PDF (HTTP ${res.status}). O Gotenberg está rodando? (docker compose up)`);
  }
  return res.blob();
}

/** Gera e dispara o download do PDF (nome = cotação + revisão). */
export async function downloadPdf(
  doc: QuotationDocument,
  template: LayoutTemplate,
  catalog: TokenDef[],
): Promise<void> {
  const blob = await generatePdf(doc, template, catalog);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${doc.quotationId}-rev${doc.revision}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
