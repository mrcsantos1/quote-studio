import { describe, expect, test } from 'vitest';
import { buildPagedStyles } from './previewStyles';
import { layoutCompleto } from '@/fixtures/layoutCompleto';

describe('buildPagedStyles (FID-5/7)', () => {
  const css = buildPagedStyles(layoutCompleto.page);

  test('define tamanho A4 físico e margens', () => {
    expect(css).toContain('size: 210mm 297mm');
    expect(css).toContain('20mm');
    expect(css).toContain('18mm');
  });

  test('contador "Página X de Y" via counter(page)/counter(pages)', () => {
    expect(css).toContain('counter(page)');
    expect(css).toContain('counter(pages)');
  });

  test('inclui marca d\'água', () => {
    expect(css.toUpperCase()).toContain('RASCUNHO');
  });
});
