// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';
import { buildPreviewHtml } from './buildPreviewHtml';
import { layoutCompleto } from '@/fixtures/layoutCompleto';
import { quotationQ012345 } from '@/fixtures/quotation';
import { tokenCatalog } from '@/fixtures/tokenCatalog';

describe('buildPreviewHtml (FID-5)', () => {
  const html = buildPreviewHtml(quotationQ012345, layoutCompleto, tokenCatalog);

  test('inclui header/footer como elementos correntes', () => {
    expect(html).toContain('qs-print-header');
    expect(html).toContain('qs-print-footer');
  });

  test('cada bloco vem rotulado para detectar divisão (FID-6)', () => {
    expect(html).toContain('data-block-label="Introdução"');
    expect(html).toContain('data-block-label="Notas técnicas"');
  });

  test('tokens resolvidos no sample', () => {
    expect(html).toContain('Eng. Marina Coelho');
  });

  test('mostra ambos os splits independente do filtro visibleSplit', () => {
    const filtered = { ...quotationQ012345, visibleSplit: 'split-w22' };
    const out = buildPreviewHtml(filtered, layoutCompleto, tokenCatalog);
    expect(out).toContain('Motor W22');
    expect(out).toContain('Motor W40');
  });
});
