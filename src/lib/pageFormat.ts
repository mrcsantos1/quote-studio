import type { PageFormat } from '@/types/contracts';

// Dimensões físicas por tamanho de papel (mm). Fonte única — editor e Paged.js
// consomem as mesmas variáveis (FID-1), tornando divergência impossível.
const PAGE_SIZE_MM: Record<PageFormat['size'], { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
};

export type PageCssVars = Record<string, string>;

/** Deriva as CSS custom properties da geometria da página (FID-1/FID-2). */
export function pageFormatToCssVars(page: PageFormat): PageCssVars {
  const { w, h } = PAGE_SIZE_MM[page.size];
  const { top, right, bottom, left } = page.marginsMm;
  return {
    '--qs-page-w': `${w}mm`,
    '--qs-page-h': `${h}mm`,
    '--qs-margin-top': `${top}mm`,
    '--qs-margin-right': `${right}mm`,
    '--qs-margin-bottom': `${bottom}mm`,
    '--qs-margin-left': `${left}mm`,
    '--qs-content-w': `${w - left - right}mm`,
    '--qs-content-h': `${h - top - bottom}mm`,
    '--qs-base-font': `${page.baseFontPt}pt`,
  };
}
