import { useState } from 'react';
import { activeLayout, clearStoredLayout, saveLayout, validateLayout } from '@/lib/activeLayout';
import { DOC_STORAGE_KEY, UI_STORAGE_KEY } from '@/store/persist';

/**
 * Editor de schema/layout em runtime (SCHEMA). Edita as propriedades dos slots
 * existentes (removable/fullPage/editable/reorderable/label) em JSON. Aplicar
 * persiste o layout e **recarrega a tela apagando conteúdo/UI em memória** —
 * decisão aceita: trocar o schema invalida o estado de trabalho.
 */
export function LayoutEditor({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState(() => JSON.stringify(activeLayout, null, 2));
  const [error, setError] = useState<string | null>(null);

  const wipeAndReload = () => {
    localStorage.removeItem(DOC_STORAGE_KEY);
    localStorage.removeItem(UI_STORAGE_KEY);
    location.reload();
  };

  const apply = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      setError(`JSON inválido: ${String(e)}`);
      return;
    }
    const err = validateLayout(parsed);
    if (err) {
      setError(err);
      return;
    }
    saveLayout(parsed as never);
    wipeAndReload();
  };

  const restore = () => {
    clearStoredLayout();
    wipeAndReload();
  };

  return (
    <div className="qs-modal" role="dialog" aria-modal="true" aria-label="Editar layout">
      <div className="qs-modal__box">
        <div className="qs-modal__bar">
          <strong>Editar layout / schema</strong>
          <span className="qs-modal__spacer" />
          <button type="button" className="qs-modal__btn" onClick={onClose}>Fechar</button>
        </div>
        <p className="qs-modal__hint">
          Edite as propriedades dos slots (<code>removable</code>, <code>fullPage</code>,
          <code>editable</code>, <code>reorderable</code>, <code>label</code>…). Aplicar recarrega a
          tela e apaga o conteúdo/seleção em memória.
        </p>
        <textarea
          className="qs-modal__textarea"
          value={text}
          spellCheck={false}
          onChange={(e) => setText(e.target.value)}
          aria-label="JSON do layout"
        />
        {error && <div className="qs-modal__error">{error}</div>}
        <div className="qs-modal__actions">
          <button type="button" className="qs-modal__btn qs-modal__btn--primary" onClick={apply}>
            Aplicar e recarregar
          </button>
          <button type="button" className="qs-modal__btn" onClick={restore}>
            Restaurar layout padrão
          </button>
        </div>
      </div>
    </div>
  );
}
