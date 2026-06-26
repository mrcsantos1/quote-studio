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

  test('preserva imagem https e data:image (EDIT-6)', () => {
    expect(sanitizeHtml('<img src="https://x/y.png" alt="a">')).toContain('src="https://x/y.png"');
    const data = '<img src="data:image/png;base64,iVBORw0KGgo=">';
    expect(sanitizeHtml(data)).toContain('data:image/png;base64');
  });

  test('remove src com javascript: na imagem', () => {
    const out = sanitizeHtml('<img src="javascript:alert(1)">');
    expect(out).not.toContain('javascript:');
  });

  test('preserva tabela com colspan/rowspan', () => {
    const html = '<table><tbody><tr><td colspan="2">a</td></tr></tbody></table>';
    const out = sanitizeHtml(html);
    expect(out).toContain('<table>');
    expect(out).toContain('colspan="2"');
  });
});
