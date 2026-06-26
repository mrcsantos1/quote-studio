import { describe, expect, test } from 'vitest';
import { filterTreeGroups } from './filterTree';
import { projectTree } from './projectTree';
import { layoutCompleto } from '@/fixtures/layoutCompleto';
import { quotationQ012345 } from '@/fixtures/quotation';

const groups = projectTree(quotationQ012345, layoutCompleto);
const labels = (gs: ReturnType<typeof projectTree>) => gs.flatMap((g) => g.nodes.map((n) => n.label));

describe('filterTreeGroups (TREE-4)', () => {
  test('query vazia devolve tudo', () => {
    expect(filterTreeGroups(groups, '')).toEqual(groups);
  });

  test('filtra por label, insensível a acento e caixa', () => {
    const out = filterTreeGroups(groups, 'TECNIC');
    expect(labels(out)).toEqual(['Notas técnicas', 'Notas técnicas']); // um por split
  });

  test('filtra por tipo do bloco', () => {
    const out = filterTreeGroups(groups, 'commercial');
    expect(labels(out).every((l) => l === 'Notas comerciais')).toBe(true);
    expect(labels(out).length).toBe(2);
  });

  test('descarta grupos sem nós correspondentes', () => {
    const out = filterTreeGroups(groups, 'capa');
    expect(out.every((g) => g.nodes.length > 0)).toBe(true);
    expect(labels(out)).toEqual(['Capa']);
  });

  test('não muta os grupos originais', () => {
    const before = structuredClone(groups);
    filterTreeGroups(groups, 'tecnic');
    expect(groups).toEqual(before);
  });
});
