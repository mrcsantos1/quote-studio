import type {
  BlockContent, BlockInstance, BlockSlot, LayoutTemplate, Lang,
} from '@/types/contracts';

/** BLK: o bloco pode ser removido/re-adicionado. */
export function isRemovable(slot: BlockSlot): boolean {
  return slot.removable;
}

const emptyContent = (): Record<Lang, BlockContent> => ({
  PT: { format: 'html', html: '<p></p>' },
  EN: { format: 'html', html: '<p></p>' },
});

/**
 * Cria uma instância nova para um slot (re-adicionar bloco — BLK). Serve ONCE
 * (sem splitId) e PER_SPLIT (com splitId). Conteúdo inicial vazio: o engine de
 * textos default/opcionais por cotação+key é DP-4 (fora de escopo).
 */
export function makeBlockInstance(slot: BlockSlot, order: number, splitId?: string): BlockInstance {
  const suffix = crypto.randomUUID().slice(0, 8);
  const id = splitId ? `${slot.id}--${splitId}--${suffix}` : `${slot.id}--${suffix}`;
  return {
    instanceId: id,
    slotId: slot.id,
    ...(splitId ? { splitId } : {}),
    defaultContentByLang: emptyContent(),
    contentByLang: emptyContent(),
    modified: false,
    origin: 'OPTIONAL',
    order,
  };
}

/** Slots ONCE removíveis que não têm instância no documento → re-adicionáveis. */
export function absentOnceSlots(blocks: BlockInstance[], template: LayoutTemplate): BlockSlot[] {
  const present = new Set(blocks.map((b) => b.slotId));
  return template.slots.filter(
    (s) => s.cardinality === 'ONCE' && s.removable && !present.has(s.id),
  );
}

/** Slots PER_SPLIT removíveis (adicionáveis a um split). */
export function perSplitAddableSlots(template: LayoutTemplate): BlockSlot[] {
  return template.slots.filter((s) => s.cardinality === 'PER_SPLIT' && s.removable);
}
