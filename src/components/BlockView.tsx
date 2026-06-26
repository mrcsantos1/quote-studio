import { useMemo } from 'react';
import { useQuoteStore } from '@/store/quoteStore';
import { renderBlockHtml } from '@/lib/renderBlock';
import { tokenCatalog } from '@/fixtures/tokenCatalog';
import { layoutCompleto } from '@/fixtures/layoutCompleto';

const slotById = new Map(layoutCompleto.slots.map((s) => [s.id, s]));

export function BlockView({ instanceId }: { instanceId: string }) {
  const instance = useQuoteStore((s) => s.doc.blocks.find((b) => b.instanceId === instanceId));
  const activeLang = useQuoteStore((s) => s.doc.activeLang);
  const lock = useQuoteStore((s) => s.lock);
  const selectedId = useQuoteStore((s) => s.ui.selectedInstanceId);
  const select = useQuoteStore((s) => s.select);
  const startEditing = useQuoteStore((s) => s.startEditing);
  const stopEditing = useQuoteStore((s) => s.stopEditing);

  const html = useMemo(
    () => (instance ? renderBlockHtml(instance, activeLang, tokenCatalog) : ''),
    [instance, activeLang],
  );

  if (!instance) return null;
  const slot = slotById.get(instance.slotId);
  const editable = slot?.editable ?? false;

  const isSelected = instanceId === selectedId;
  const isEditing = lock.mode === 'EDITING' && lock.instanceId === instanceId;
  const isLocked = lock.mode === 'EDITING' && lock.instanceId !== instanceId;

  return (
    <section
      className={`qs-block qs-block--${slot?.type.toLowerCase() ?? 'generic'}`}
      data-selected={isSelected || undefined}
      data-editing={isEditing || undefined}
      data-locked={isLocked || undefined}
      data-modified={instance.modified || undefined}
      onClick={() => select(instanceId)}
    >
      <header className="qs-block__bar">
        <span className="qs-block__title">{slot?.label}</span>
        {instance.modified && <span className="qs-block__flag">modificado</span>}
        {editable && (
          <button
            type="button"
            className="qs-block__action"
            onClick={(e) => { e.stopPropagation(); isEditing ? stopEditing() : startEditing(instanceId); }}
          >
            {isEditing ? 'Travar' : 'Editar bloco'}
          </button>
        )}
        {!editable && <span className="qs-block__ro">somente leitura</span>}
      </header>
      {/* Conteúdo já sanitizado (NFR-3) + tokens expandidos (TOK-4). Editor real entra no M3. */}
      <div className="qs-block__body" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}
