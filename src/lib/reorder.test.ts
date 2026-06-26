import { describe, expect, test } from 'vitest';
import { reorderBlocks } from './reorder';
import { layoutCompleto } from '@/fixtures/layoutCompleto';
import { quotationQ012345 } from '@/fixtures/quotation';

const blocks = quotationQ012345.blocks;
const orderOf = (bs: typeof blocks, id: string) => bs.find((b) => b.instanceId === id)!.order;

describe('reorderBlocks (DND-1/2)', () => {
  test('reordena notas reordenáveis dentro do mesmo split', () => {
    const out = reorderBlocks(blocks, layoutCompleto, 'technical--split-w22', 'commercial--split-w22');
    expect(orderOf(out, 'technical--split-w22')).toBe(orderOf(blocks, 'commercial--split-w22'));
    expect(orderOf(out, 'commercial--split-w22')).toBe(orderOf(blocks, 'technical--split-w22'));
  });

  test('não toca o bloco read-only (PRODUCT) do grupo', () => {
    const out = reorderBlocks(blocks, layoutCompleto, 'technical--split-w22', 'commercial--split-w22');
    expect(orderOf(out, 'product--split-w22')).toBe(orderOf(blocks, 'product--split-w22'));
  });

  test('DND-2: mover um bloco reorderable=false é no-op', () => {
    const out = reorderBlocks(blocks, layoutCompleto, 'product--split-w22', 'technical--split-w22');
    expect(out).toEqual(blocks);
  });

  test('DND-1: não cruza fronteira de grupo (splits diferentes)', () => {
    const out = reorderBlocks(blocks, layoutCompleto, 'technical--split-w22', 'technical--split-w40');
    expect(out).toEqual(blocks);
  });

  test('mover sobre si mesmo é no-op', () => {
    const out = reorderBlocks(blocks, layoutCompleto, 'technical--split-w22', 'technical--split-w22');
    expect(out).toEqual(blocks);
  });

  test('não muta o array original (pureza)', () => {
    const snapshot = structuredClone(blocks);
    reorderBlocks(blocks, layoutCompleto, 'technical--split-w22', 'commercial--split-w22');
    expect(blocks).toEqual(snapshot);
  });
});
