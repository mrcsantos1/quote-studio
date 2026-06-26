import { useQuoteStore } from '@/store/quoteStore';
import { layoutCompleto } from '@/fixtures/layoutCompleto';
import { isDeletableNote } from '@/lib/notes';

const slotById = new Map(layoutCompleto.slots.map((s) => [s.id, s]));
// Slots de nota incluíveis (PER_SPLIT editáveis), p/ os botões "Incluir nota".
const noteSlots = layoutCompleto.slots.filter((s) => s.cardinality === 'PER_SPLIT' && s.editable);

export function Inspector() {
  const selectedId = useQuoteStore((s) => s.ui.selectedInstanceId);
  const instance = useQuoteStore((s) => s.doc.blocks.find((b) => b.instanceId === s.ui.selectedInstanceId));
  const lock = useQuoteStore((s) => s.lock);
  const startEditing = useQuoteStore((s) => s.startEditing);
  const stopEditing = useQuoteStore((s) => s.stopEditing);
  const reloadItem = useQuoteStore((s) => s.reloadItem);
  const reloadAll = useQuoteStore((s) => s.reloadAll);
  const deleteNote = useQuoteStore((s) => s.deleteNote);
  const includeNote = useQuoteStore((s) => s.includeNote);

  const slot = instance ? slotById.get(instance.slotId) : undefined;
  const isEditing = lock.mode === 'EDITING' && selectedId !== null && lock.instanceId === selectedId;
  const isNote = !!slot && isDeletableNote(slot);
  const splitId = instance?.splitId;

  // Recarregar/restaurar também trava: o editor Tiptap fixa o conteúdo na montagem,
  // então sair da edição faz a próxima montagem ler o texto já restaurado.
  const onReloadItem = (id: string) => { reloadItem(id); stopEditing(); };
  const onReloadAll = () => { reloadAll(); stopEditing(); };

  return (
    <aside className="qs-inspector" aria-label="Inspetor do bloco">
      <h2 className="qs-inspector__title">Inspetor</h2>

      {!instance || !slot ? (
        <p className="qs-inspector__empty">Selecione um bloco na árvore ou na página.</p>
      ) : (
        <>
          <dl className="qs-inspector__meta">
            <dt>Bloco</dt><dd>{slot.label}</dd>
            <dt>Tipo</dt><dd>{slot.type}</dd>
            <dt>Origem</dt><dd>{instance.origin}</dd>
            <dt>Estado</dt><dd>{instance.modified ? 'Modificado' : 'Default'}</dd>
            <dt>Edição</dt><dd>{slot.editable ? 'Permitida' : 'Somente leitura'}</dd>
          </dl>

          {slot.editable && (
            <div className="qs-inspector__actions">
              <button
                type="button"
                className="qs-inspector__action"
                onClick={() => (isEditing ? stopEditing() : startEditing(instance.instanceId))}
              >
                {isEditing ? 'Travar bloco' : 'Editar bloco'}
              </button>
              <button
                type="button"
                className="qs-inspector__action qs-inspector__action--ghost"
                disabled={!instance.modified}
                onClick={() => onReloadItem(instance.instanceId)}
                title="Restaurar este bloco ao texto default"
              >
                Recarregar item
              </button>
              {isNote && (
                <button
                  type="button"
                  className="qs-inspector__action qs-inspector__action--danger"
                  onClick={() => { deleteNote(instance.instanceId); stopEditing(); }}
                  title="Excluir esta nota"
                >
                  Excluir nota
                </button>
              )}
            </div>
          )}

          {splitId && (
            <div className="qs-inspector__include">
              <h3>Incluir nota neste split</h3>
              {noteSlots.map((ns) => (
                <button
                  key={ns.id}
                  type="button"
                  className="qs-inspector__action qs-inspector__action--ghost"
                  onClick={() => includeNote(splitId, ns.id)}
                >
                  + {ns.label}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <button
        type="button"
        className="qs-inspector__action qs-inspector__action--ghost qs-inspector__reloadall"
        onClick={onReloadAll}
        title="Restaurar todos os blocos ao texto default"
      >
        Recarregar todos
      </button>

      <div className="qs-legend" aria-label="Legenda de estados">
        <h3>Estados</h3>
        <ul>
          <li><span className="qs-legend__sw qs-legend__sw--selected" /> Selecionado</li>
          <li><span className="qs-legend__sw qs-legend__sw--editing" /> Em edição</li>
          <li><span className="qs-legend__sw qs-legend__sw--modified" /> Modificado</li>
          <li><span className="qs-legend__sw qs-legend__sw--locked" /> Bloqueado</li>
        </ul>
      </div>
    </aside>
  );
}
