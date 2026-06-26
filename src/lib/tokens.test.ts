import { describe, expect, test } from 'vitest';
import { expandTokens, parseTokenRef } from './tokens';
import { tokenCatalog } from '@/fixtures/tokenCatalog';

describe('parseTokenRef', () => {
  test('extrai source e key de uma referência válida', () => {
    expect(parseTokenRef('{{token:SAP:netPrice}}')).toEqual({ source: 'SAP', key: 'netPrice' });
  });

  test('devolve null para texto que não é token', () => {
    expect(parseTokenRef('preço total')).toBeNull();
  });
});

describe('expandTokens', () => {
  test('TOK-2: substitui token conhecido por <span> com sample e data-token', () => {
    const out = expandTokens('Preço: {{token:SAP:netPrice}}.', tokenCatalog);
    expect(out).toContain('data-token="SAP:netPrice"');
    expect(out).toContain('R$ 482.350,00');
    expect(out).toContain('class="qs-token"');
  });

  test('preserva o texto fora dos tokens', () => {
    const out = expandTokens('Olá <strong>mundo</strong>', tokenCatalog);
    expect(out).toContain('Olá <strong>mundo</strong>');
  });

  test('token desconhecido não quebra: marca como não resolvido mantendo a chave', () => {
    const out = expandTokens('{{token:SAP:inexistente}}', tokenCatalog);
    expect(out).toContain('data-token="SAP:inexistente"');
    expect(out).toContain('qs-token--unknown');
  });

  test('escapa o sample para evitar injeção via catálogo', () => {
    const malicious = [{ source: 'SAP' as const, key: 'x', label: 'x', sample: '<img src=x onerror=alert(1)>' }];
    const out = expandTokens('{{token:SAP:x}}', malicious);
    expect(out).not.toContain('<img');
    expect(out).toContain('&lt;img');
  });
});
