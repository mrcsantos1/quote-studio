import { describe, expect, test } from 'vitest';
import { isModified, restored, withContent } from './blockEdits';
import type { BlockInstance } from '@/types/contracts';

function freshBlock(): BlockInstance {
  const mk = (html: string) => ({
    PT: { format: 'html' as const, html },
    EN: { format: 'html' as const, html: '[EN]' },
  });
  return {
    instanceId: 'b', slotId: 'intro',
    defaultContentByLang: mk('<p>default PT</p>'),
    contentByLang: mk('<p>default PT</p>'),
    modified: false, origin: 'DEFAULT', order: 0,
  };
}

describe('isModified (EDIT-2)', () => {
  test('bloco recém-carregado não está modificado', () => {
    expect(isModified(freshBlock())).toBe(false);
  });

  test('detecta divergência em qualquer idioma', () => {
    const b = freshBlock();
    b.contentByLang.PT = { format: 'html', html: '<p>editado</p>' };
    expect(isModified(b)).toBe(true);
  });
});

describe('withContent (EDIT-2)', () => {
  test('atualiza o idioma e marca modified=true', () => {
    const out = withContent(freshBlock(), 'PT', '<p>novo</p>');
    expect(out.contentByLang.PT.html).toBe('<p>novo</p>');
    expect(out.modified).toBe(true);
  });

  test('voltar ao texto default zera modified (round-trip)', () => {
    const out = withContent(freshBlock(), 'PT', '<p>default PT</p>');
    expect(out.modified).toBe(false);
  });

  test('não muta o baseline nem a instância de entrada (pureza)', () => {
    const b = freshBlock();
    const out = withContent(b, 'PT', '<p>x</p>');
    expect(b.contentByLang.PT.html).toBe('<p>default PT</p>'); // entrada intacta
    expect(out.defaultContentByLang.PT.html).toBe('<p>default PT</p>'); // baseline intacto
  });
});

describe('restored (EDIT-3 recarregar item / restaurar)', () => {
  test('volta o conteúdo ao default e limpa modified', () => {
    const edited = withContent(freshBlock(), 'PT', '<p>editado</p>');
    const out = restored(edited);
    expect(out.contentByLang.PT.html).toBe('<p>default PT</p>');
    expect(out.modified).toBe(false);
  });

  test('a cópia de trabalho restaurada não compartilha referência com o baseline', () => {
    const out = restored(freshBlock());
    expect(out.contentByLang).not.toBe(out.defaultContentByLang);
    expect(out.contentByLang.PT).not.toBe(out.defaultContentByLang.PT);
  });
});
