// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';
import { buildPdfDocument } from './buildPdfDocument';
import { layoutCompleto } from '@/fixtures/layoutCompleto';
import { quotationQ012345 } from '@/fixtures/quotation';
import { tokenCatalog } from '@/fixtures/tokenCatalog';

describe('buildPdfDocument (PDF-1)', () => {
  const html = buildPdfDocument(quotationQ012345, layoutCompleto, tokenCatalog);

  test('é um documento HTML completo com os estilos paginados', () => {
    expect(html).toMatch(/<!doctype html>/i);
    expect(html).toContain('<style>');
    expect(html).toContain('counter(pages)');
  });

  test('embute o init do Paged.js e referencia o polyfill', () => {
    expect(html).toContain('window.QS_PAGED_DONE');
    expect(html).toContain('paged.polyfill.js');
  });

  test('inclui o corpo do documento (mesma fidelidade da prévia)', () => {
    expect(html).toContain('data-block-label="Introdução"');
    expect(html).toContain('Eng. Marina Coelho'); // token resolvido
  });

  test('PDF-2: NÃO contém marca d\'água', () => {
    expect(html.toUpperCase()).not.toContain('RASCUNHO');
  });
});
