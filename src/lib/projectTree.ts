import type {
  BlockInstance,
  BlockSlot,
  BlockType,
  LayoutTemplate,
  QuotationDocument,
} from '@/types/contracts';

export type TreeGroupKind = 'ONCE_TOP' | 'SPLIT' | 'ONCE_BOTTOM';

export interface TreeNode {
  instanceId: string;
  slotId: string;
  type: BlockType;
  label: string;
  splitId?: string;
  editable: boolean;
  reorderable: boolean;
}

export interface TreeGroup {
  kind: TreeGroupKind;
  /** Presente apenas em grupos SPLIT. */
  splitId?: string;
  label: string;
  nodes: TreeNode[];
}

function toNode(instance: BlockInstance, slot: BlockSlot): TreeNode {
  return {
    instanceId: instance.instanceId,
    slotId: instance.slotId,
    type: slot.type,
    label: slot.label,
    ...(instance.splitId ? { splitId: instance.splitId } : {}),
    editable: slot.editable,
    reorderable: slot.reorderable,
  };
}

const byOrder = (a: BlockInstance, b: BlockInstance): number => a.order - b.order;

/**
 * Projeta `QuotationDocument` + `LayoutTemplate` na árvore de grupos (TREE-1/2).
 * Pura: não muta `doc` nem `template` (PROJ-1). Os filtros de projeção
 * (visibleSplit) vivem no próprio doc e nunca alteram `doc.blocks`.
 */
export function projectTree(doc: QuotationDocument, template: LayoutTemplate): TreeGroup[] {
  const slotById = new Map(template.slots.map((s) => [s.id, s]));
  const slotIndex = new Map(template.slots.map((s, i) => [s.id, i]));

  const perSplitIndexes = template.slots
    .map((s, i) => (s.cardinality === 'PER_SPLIT' ? i : -1))
    .filter((i) => i >= 0);
  // Sem PER_SPLIT → firstPerSplit = Infinity → todo ONCE cai no topo.
  const firstPerSplit = perSplitIndexes.length ? Math.min(...perSplitIndexes) : Infinity;

  const onceTop: BlockInstance[] = [];
  const onceBottom: BlockInstance[] = [];
  const perSplit: BlockInstance[] = [];

  for (const instance of doc.blocks) {
    const slot = slotById.get(instance.slotId);
    if (!slot) continue; // instância órfã (slot removido do layout) — ignorada na projeção
    if (slot.cardinality === 'PER_SPLIT') {
      perSplit.push(instance);
      continue;
    }
    const idx = slotIndex.get(instance.slotId) ?? 0;
    (idx < firstPerSplit ? onceTop : onceBottom).push(instance);
  }

  const groups: TreeGroup[] = [];

  groups.push({
    kind: 'ONCE_TOP',
    label: 'Abertura',
    nodes: onceTop.sort(byOrder).map((i) => toNode(i, slotById.get(i.slotId)!)),
  });

  for (const split of doc.splits) {
    if (doc.visibleSplit !== 'ALL' && doc.visibleSplit !== split.id) continue;
    const nodes = perSplit
      .filter((i) => i.splitId === split.id)
      .sort(byOrder)
      .map((i) => toNode(i, slotById.get(i.slotId)!));
    groups.push({ kind: 'SPLIT', splitId: split.id, label: split.label, nodes });
  }

  groups.push({
    kind: 'ONCE_BOTTOM',
    label: 'Fechamento',
    nodes: onceBottom.sort(byOrder).map((i) => toNode(i, slotById.get(i.slotId)!)),
  });

  return groups;
}
