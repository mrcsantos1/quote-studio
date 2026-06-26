// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';
import { renderBlockHtml } from './renderBlock';
import type { BlockInstance } from '@/types/contracts';
import { tokenCatalog } from '@/fixtures/tokenCatalog';

function block(html: string): BlockInstance {
  const content = { PT: { format: 'html' as const, html }, EN: { format: 'html' as const, html: '' } };
  return {
    instanceId: 'b', slotId: 's',
    defaultContentByLang: content, contentByLang: content,
    modified: false, origin: 'DEFAULT', order: 0,
  };
}

describe('renderBlockHtml (TOK-4 + NFR-3)', () => {
  test('expande token e sanitiza num passo', () => {
    const out = renderBlockHtml(block('Preço {{token:SAP:netPrice}}'), 'PT', tokenCatalog);
    expect(out).toContain('R$ 482.350,00');
    expect(out).toContain('data-token="SAP:netPrice"');
  });

  test('remove markup perigoso mesmo vindo do conteúdo do bloco', () => {
    const out = renderBlockHtml(block('<p>ok</p><script>alert(1)</script>'), 'PT', tokenCatalog);
    expect(out).toBe('<p>ok</p>');
  });
});
