import type { BlockInstance, LayoutTemplate } from '@/types/contracts';
import { instanceGroupKey } from './projectTree';

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const copy = arr.slice();
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

/**
 * Reordena `active` para a posição de `over` dentro do mesmo grupo (DND-1).
 * Regras (no-op se violadas, devolvendo `blocks` inalterado):
 *  - ambos reorderable=true (DND-2);
 *  - ambos no mesmo grupo (fronteira ONCE/split — DND-1).
 * Apenas os blocos reorderáveis do grupo trocam de `order`; os fixos
 * (ex.: PRODUCT) mantêm suas posições. Função pura — não muta a entrada.
 */
export function reorderBlocks(
  blocks: BlockInstance[],
  template: LayoutTemplate,
  activeId: string,
  overId: string,
): BlockInstance[] {
  if (activeId === overId) return blocks;

  const slotById = new Map(template.slots.map((s) => [s.id, s]));
  const active = blocks.find((b) => b.instanceId === activeId);
  const over = blocks.find((b) => b.instanceId === overId);
  if (!active || !over) return blocks;

  const activeSlot = slotById.get(active.slotId);
  const overSlot = slotById.get(over.slotId);
  if (!activeSlot?.reorderable || !overSlot?.reorderable) return blocks;

  const key = instanceGroupKey(active, template);
  if (key !== instanceGroupKey(over, template)) return blocks;

  // Subconjunto reorderável do grupo, na ordem atual.
  const group = blocks
    .filter((b) => slotById.get(b.slotId)?.reorderable && instanceGroupKey(b, template) === key)
    .sort((a, b) => a.order - b.order);

  const positions = group.map((b) => b.order); // slots de `order` que esse subconjunto ocupa
  const ids = group.map((b) => b.instanceId);
  const from = ids.indexOf(activeId);
  const to = ids.indexOf(overId);
  const reordered = arrayMove(ids, from, to);

  const newOrderById = new Map(reordered.map((id, i) => [id, positions[i]]));
  return blocks.map((b) =>
    newOrderById.has(b.instanceId) ? { ...b, order: newOrderById.get(b.instanceId)! } : b,
  );
}
