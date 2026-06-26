import type { LayoutTemplate, QuotationDocument, TokenDef } from '@/types/contracts';
import { projectTree } from '@/lib/projectTree';
import { renderBlockHtml } from '@/lib/renderBlock';

const BAND_SLOTS = new Set(['header', 'footer']);

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/**
 * Monta o HTML do documento completo para a prévia/impressão (FID-5). A prévia
 * ignora o filtro de split (mostra ALL); header/footer viram elementos correntes
 * (FID-3) e cada bloco é rotulado (`data-block-label`) para detectar divisão (FID-6).
 * Reusa `renderBlockHtml` — mesmo conteúdo sanitizado + tokens da edição.
 */
export function buildPreviewHtml(
  doc: QuotationDocument,
  template: LayoutTemplate,
  catalog: TokenDef[],
): string {
  const full: QuotationDocument = { ...doc, visibleSplit: 'ALL' };
  const groups = projectTree(full, template);
  const blockById = new Map(doc.blocks.map((b) => [b.instanceId, b]));

  const header = doc.blocks.find((b) => b.slotId === 'header');
  const footer = doc.blocks.find((b) => b.slotId === 'footer');
  const headerHtml = header ? renderBlockHtml(header, doc.activeLang, catalog) : '';
  const footerHtml = footer ? renderBlockHtml(footer, doc.activeLang, catalog) : '';

  const slotById = new Map(template.slots.map((s) => [s.id, s]));
  const body = groups
    .flatMap((g) => g.nodes.filter((n) => !BAND_SLOTS.has(n.slotId)))
    .map((n) => {
      const inst = blockById.get(n.instanceId);
      if (!inst) return '';
      const inner = renderBlockHtml(inst, doc.activeLang, catalog);
      const fullPage = slotById.get(n.slotId)?.fullPage ? ' qs-print-block--fullpage' : '';
      return `<section class="qs-print-block${fullPage}" data-block-label="${escapeAttr(n.label)}">${inner}</section>`;
    })
    .join('');

  return (
    `<div class="qs-print-header">${headerHtml}</div>` +
    `<div class="qs-print-footer">${footerHtml}</div>` +
    `<div class="qs-print-doc">${body}</div>`
  );
}
