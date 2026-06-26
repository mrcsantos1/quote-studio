import { describe, expect, test } from 'vitest';
import { canIncludeNote, isDeletableNote, makeNote } from './notes';
import { layoutCompleto } from '@/fixtures/layoutCompleto';

const slot = (id: string) => layoutCompleto.slots.find((s) => s.id === id)!;

describe('regras de nota (EDIT-3)', () => {
  test('notas PER_SPLIT editáveis são deletáveis/incluíveis', () => {
    expect(isDeletableNote(slot('technical'))).toBe(true);
    expect(canIncludeNote(slot('commercial'))).toBe(true);
  });

  test('PRODUCT (read-only) e blocos ONCE não são notas', () => {
    expect(isDeletableNote(slot('product'))).toBe(false);
    expect(isDeletableNote(slot('intro'))).toBe(false);
    expect(canIncludeNote(slot('cover'))).toBe(false);
  });
});

describe('makeNote', () => {
  test('cria instância PER_SPLIT nova, origin OPTIONAL, não modificada', () => {
    const n = makeNote(slot('technical'), 'split-w22', 5);
    expect(n.slotId).toBe('technical');
    expect(n.splitId).toBe('split-w22');
    expect(n.origin).toBe('OPTIONAL');
    expect(n.modified).toBe(false);
    expect(n.order).toBe(5);
    expect(n.contentByLang.PT.html).toBe(n.defaultContentByLang.PT.html);
    expect(n.instanceId).toMatch(/technical--split-w22/);
  });
});
