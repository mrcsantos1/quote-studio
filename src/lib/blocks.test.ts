import { describe, expect, test } from 'vitest';
import { absentOnceSlots, isRemovable, makeBlockInstance, perSplitAddableSlots } from './blocks';
import { layoutCompleto } from '@/fixtures/layoutCompleto';
import { quotationQ012345 } from '@/fixtures/quotation';

const slot = (id: string) => layoutCompleto.slots.find((s) => s.id === id)!;

describe('isRemovable (BLK)', () => {
  test('reflete a flag removable do slot', () => {
    expect(isRemovable(slot('cover'))).toBe(true);
    expect(isRemovable(slot('product'))).toBe(false);
  });
});

describe('makeBlockInstance', () => {
  test('bloco ONCE: sem splitId, origin OPTIONAL, não modificado', () => {
    const b = makeBlockInstance(slot('cover'), 0);
    expect(b.slotId).toBe('cover');
    expect(b.splitId).toBeUndefined();
    expect(b.origin).toBe('OPTIONAL');
    expect(b.modified).toBe(false);
    expect(b.contentByLang.PT.html).toBe(b.defaultContentByLang.PT.html);
  });

  test('bloco PER_SPLIT: carrega splitId', () => {
    const b = makeBlockInstance(slot('technical'), 2, 'split-w22');
    expect(b.splitId).toBe('split-w22');
  });
});

describe('absentOnceSlots', () => {
  test('documento completo → nenhum slot ONCE removível ausente', () => {
    expect(absentOnceSlots(quotationQ012345.blocks, layoutCompleto)).toEqual([]);
  });

  test('removida a capa → ela aparece como ausente/re-adicionável', () => {
    const blocks = quotationQ012345.blocks.filter((b) => b.slotId !== 'cover');
    expect(absentOnceSlots(blocks, layoutCompleto).map((s) => s.id)).toEqual(['cover']);
  });
});

describe('perSplitAddableSlots', () => {
  test('lista os slots PER_SPLIT removíveis', () => {
    expect(perSplitAddableSlots(layoutCompleto).map((s) => s.id)).toEqual(['technical', 'commercial']);
  });
});
