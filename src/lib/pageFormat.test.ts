import { describe, expect, test } from 'vitest';
import { pageFormatToCssVars } from './pageFormat';
import { layoutCompleto } from '@/fixtures/layoutCompleto';

describe('pageFormatToCssVars (FID-1)', () => {
  const vars = pageFormatToCssVars(layoutCompleto.page);

  test('A4 expõe largura/altura físicas em mm', () => {
    expect(vars['--qs-page-w']).toBe('210mm');
    expect(vars['--qs-page-h']).toBe('297mm');
  });

  test('margens viram custom properties em mm', () => {
    expect(vars['--qs-margin-top']).toBe('20mm');
    expect(vars['--qs-margin-left']).toBe('18mm');
  });

  test('largura útil = página menos margens laterais', () => {
    expect(vars['--qs-content-w']).toBe('174mm'); // 210 - 18 - 18
  });

  test('fonte base em pt', () => {
    expect(vars['--qs-base-font']).toBe('10.5pt');
  });
});
