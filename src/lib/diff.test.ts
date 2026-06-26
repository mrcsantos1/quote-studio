import { describe, expect, test } from 'vitest';
import { diffHtml } from './diff';

const types = (segs: ReturnType<typeof diffHtml>) => segs.map((s) => s.type);
const text = (segs: ReturnType<typeof diffHtml>, t: string) =>
  segs.filter((s) => s.type === t).map((s) => s.value).join('').trim();

describe('diffHtml (REV-2, trabalho×default)', () => {
  test('conteúdo idêntico → tudo equal', () => {
    const segs = diffHtml('<p>Olá mundo</p>', '<p>Olá mundo</p>');
    expect(types(segs).every((t) => t === 'equal')).toBe(true);
  });

  test('palavra adicionada → segmento add', () => {
    const segs = diffHtml('<p>Olá mundo</p>', '<p>Olá belo mundo</p>');
    expect(types(segs)).toContain('add');
    expect(text(segs, 'add')).toContain('belo');
  });

  test('palavra removida → segmento remove', () => {
    const segs = diffHtml('<p>Olá belo mundo</p>', '<p>Olá mundo</p>');
    expect(types(segs)).toContain('remove');
    expect(text(segs, 'remove')).toContain('belo');
  });

  test('substituição mostra remove + add', () => {
    const segs = diffHtml('<p>preço alto</p>', '<p>preço baixo</p>');
    expect(text(segs, 'remove')).toContain('alto');
    expect(text(segs, 'add')).toContain('baixo');
  });
});
