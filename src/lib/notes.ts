import type { BlockContent, BlockInstance, BlockSlot, Lang } from '@/types/contracts';

// Notas opcionais = slots PER_SPLIT editáveis (TECHNICAL_NOTES / COMMERCIAL_NOTES).
// Excluir/Incluir (EDIT-3) só se aplica a elas; PRODUCT (read-only) e ONCE ficam fora.
export function isDeletableNote(slot: BlockSlot): boolean {
  return slot.cardinality === 'PER_SPLIT' && slot.editable;
}

export const canIncludeNote = isDeletableNote;

const emptyContent = (): Record<Lang, BlockContent> => ({
  PT: { format: 'html', html: '<p></p>' },
  EN: { format: 'html', html: '<p></p>' },
});

/**
 * Cria uma nota nova para um split (EDIT-3 "Incluir nota"). Conteúdo inicial
 * vazio: o engine de textos default/opcionais por cotação+key é DP-4 (fora de escopo).
 */
export function makeNote(slot: BlockSlot, splitId: string, order: number): BlockInstance {
  const id = `${slot.id}--${splitId}--${crypto.randomUUID().slice(0, 8)}`;
  const content = emptyContent();
  return {
    instanceId: id,
    slotId: slot.id,
    splitId,
    defaultContentByLang: content,
    contentByLang: emptyContent(),
    modified: false,
    origin: 'OPTIONAL',
    order,
  };
}
