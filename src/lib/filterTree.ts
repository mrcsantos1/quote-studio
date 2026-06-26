import type { TreeGroup } from './projectTree';

/** Normaliza para busca: sem acento, minúsculo. */
function norm(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

/**
 * Filtra a árvore por label/tipo do nó (TREE-4). Projeção pura: devolve grupos
 * novos com apenas os nós correspondentes, descartando grupos vazios. Não muta
 * a entrada nem o documento. Query vazia devolve os grupos originais.
 */
export function filterTreeGroups(groups: TreeGroup[], query: string): TreeGroup[] {
  const q = norm(query.trim());
  if (!q) return groups;

  const result: TreeGroup[] = [];
  for (const g of groups) {
    const nodes = g.nodes.filter((n) => norm(n.label).includes(q) || norm(n.type).includes(q));
    if (nodes.length > 0) result.push({ ...g, nodes });
  }
  return result;
}
