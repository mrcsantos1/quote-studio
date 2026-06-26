import { useState } from 'react';
import { useQuoteStore } from '@/store/quoteStore';
import { layoutCompleto } from '@/fixtures/layoutCompleto';
import { absentOnceSlots, isRemovable, perSplitAddableSlots } from '@/lib/blocks';
import { CompareView } from './CompareView';

const slotById = new Map(layoutCompleto.slots.map((s) => [s.id, s]));
const perSplitSlots = perSplitAddableSlots(layoutCompleto);

export function Inspector() {
  const selectedId = useQuoteStore((s) => s.ui.selectedInstanceId);
  const instance = useQuoteStore((s) => s.doc.blocks.find((b) => b.instanceId === s.ui.selectedInstanceId));
  const blocks = useQuoteStore((s) => s.doc.blocks);
  const lock = useQuoteStore((s) => s.lock);
  const startEditing = useQuoteStore((s) => s.startEditing);
  const stopEditing = useQuoteStore((s) => s.stopEditing);
  const reloadItem = useQuoteStore((s) => s.reloadItem);
  const reloadAll = useQuoteStore((s) => s.reloadAll);
  const removeBlock = useQuoteStore((s) => s.removeBlock);
  const addBlock = useQuoteStore((s) => s.addBlock);
  const takeSnapshot = useQuoteStore((s) => s.takeSnapshot);
  const revision = useQuoteStore((s) => s.doc.revision);
  const snapshotCount = useQuoteStore((s) => s.snapshots.length);
  const [comparing, setComparing] = useState(false);

  const slot = instance ? slotById.get(instance.slotId) : undefined;
  const isEditing = lock.mode === 'EDITING' && selectedId !== null && lock.instanceId === selectedId;
  const removable = !!slot && isRemovable(slot);
  const splitId = instance?.splitId;

  const absentOnce = absentOnceSlots(blocks, layoutCompleto);

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

          <div className="qs-inspector__actions">
            {slot.editable && (
              <>
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
                <button
                  type="button"
                  className="qs-inspector__action qs-inspector__action--ghost"
                  disabled={!instance.modified}
                  aria-pressed={comparing}
                  onClick={() => setComparing((v) => !v)}
                  title="Comparar o texto de trabalho com o default"
                >
                  {comparing ? 'Ocultar comparação' : 'Comparar'}
                </button>
              </>
            )}
            {removable && (
              <button
                type="button"
                className="qs-inspector__action qs-inspector__action--danger"
                onClick={() => { removeBlock(instance.instanceId); stopEditing(); }}
                title="Remover este bloco do documento (pode re-adicionar depois)"
              >
                Remover bloco
              </button>
            )}
          </div>

          {comparing && instance.modified && <CompareView instanceId={instance.instanceId} />}

          {splitId && (
            <div className="qs-inspector__include">
              <h3>Adicionar bloco a este split</h3>
              {perSplitSlots.map((ns) => (
                <button
                  key={ns.id}
                  type="button"
                  className="qs-inspector__action qs-inspector__action--ghost"
                  onClick={() => addBlock(ns.id, splitId)}
                >
                  + {ns.label}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {absentOnce.length > 0 && (
        <div className="qs-inspector__include">
          <h3>Adicionar bloco ao documento</h3>
          {absentOnce.map((s) => (
            <button
              key={s.id}
              type="button"
              className="qs-inspector__action qs-inspector__action--ghost"
              onClick={() => addBlock(s.id)}
            >
              + {s.label}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className="qs-inspector__action qs-inspector__action--ghost qs-inspector__reloadall"
        onClick={onReloadAll}
        title="Restaurar todos os blocos ao texto default"
      >
        Recarregar todos
      </button>

      <div className="qs-inspector__revision">
        <span>Revisão atual: <strong>{revision}</strong>{snapshotCount > 0 && ` · ${snapshotCount} snapshot(s)`}</span>
        <button
          type="button"
          className="qs-inspector__action qs-inspector__action--ghost"
          onClick={takeSnapshot}
          title="Clonar o documento e iniciar nova revisão"
        >
          Snapshot de revisão
        </button>
      </div>

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
