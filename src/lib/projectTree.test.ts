import { describe, expect, test } from 'vitest';
import { projectTree } from './projectTree';
import { layoutCompleto } from '@/fixtures/layoutCompleto';
import { quotationQ012345 } from '@/fixtures/quotation';

describe('projectTree', () => {
  test('TREE-1: ordena ONCE-inicial → grupos por split → ONCE-final', () => {
    const groups = projectTree(quotationQ012345, layoutCompleto);

    expect(groups.map((g) => g.kind)).toEqual(['ONCE_TOP', 'SPLIT', 'SPLIT', 'ONCE_BOTTOM']);
    expect(groups[0].nodes.map((n) => n.instanceId)).toEqual(['cover', 'header', 'intro']);
    expect(groups[1].splitId).toBe('split-w22');
    expect(groups[1].nodes.map((n) => n.instanceId)).toEqual([
      'product--split-w22',
      'technical--split-w22',
      'commercial--split-w22',
    ]);
    expect(groups[2].splitId).toBe('split-w40');
    expect(groups[2].nodes.map((n) => n.instanceId)).toEqual([
      'product--split-w40',
      'technical--split-w40',
      'commercial--split-w40',
    ]);
    expect(groups[3].nodes.map((n) => n.instanceId)).toEqual(['closing', 'footer']);
  });

  test('TREE-2: visibleSplit ≠ ALL mostra apenas o split ativo (+ ONCE)', () => {
    const doc = { ...quotationQ012345, visibleSplit: 'split-w40' };
    const groups = projectTree(doc, layoutCompleto);

    expect(groups.map((g) => g.kind)).toEqual(['ONCE_TOP', 'SPLIT', 'ONCE_BOTTOM']);
    expect(groups[1].splitId).toBe('split-w40');
  });

  test('ordena nós dentro do grupo por `order`, não pela posição no array', () => {
    const shuffled = { ...quotationQ012345, blocks: [...quotationQ012345.blocks].reverse() };
    const groups = projectTree(shuffled, layoutCompleto);

    expect(groups[0].nodes.map((n) => n.instanceId)).toEqual(['cover', 'header', 'intro']);
  });

  test('cada nó carrega editable/reorderable do slot', () => {
    const groups = projectTree(quotationQ012345, layoutCompleto);
    const [cover, , intro] = groups[0].nodes;

    expect(cover.reorderable).toBe(false);
    expect(intro.editable).toBe(true);
  });

  test('PROJ-1: projeção não muta doc.blocks', () => {
    const before = structuredClone(quotationQ012345.blocks);
    projectTree(quotationQ012345, layoutCompleto);
    expect(quotationQ012345.blocks).toEqual(before);
  });
});
