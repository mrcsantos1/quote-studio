// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';
import { sanitizeHtml } from './sanitize';

describe('sanitizeHtml (NFR-3 — piso 1)', () => {
  test('remove <script>', () => {
    expect(sanitizeHtml('<p>oi</p><script>alert(1)</script>')).toBe('<p>oi</p>');
  });

  test('remove handlers inline como onerror', () => {
    const out = sanitizeHtml('<img src=x onerror="alert(1)">');
    expect(out).not.toContain('onerror');
  });

  test('preserva formatação básica permitida', () => {
    const html = '<p><strong>Negrito</strong> e <em>itálico</em></p>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  test('preserva o chip de token (span + data-token + class + title)', () => {
    const html = '<span class="qs-token" data-token="SAP:netPrice" title="SAP:netPrice">R$ 1,00</span>';
    const out = sanitizeHtml(html);
    expect(out).toContain('data-token="SAP:netPrice"');
    expect(out).toContain('class="qs-token"');
  });
});
