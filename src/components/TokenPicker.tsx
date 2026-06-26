import { useMemo, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { tokenCatalog } from '@/fixtures/tokenCatalog';
import type { TokenDef, TokenSource } from '@/types/contracts';

/**
 * Picker de tags (TOK-6): insere o node atômico `token` no cursor. O usuário não
 * digita `{{token:...}}` à mão — escolhe do catálogo agrupado por fonte.
 */
export function TokenPicker({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);

  const groups = useMemo(() => {
    const map = new Map<TokenSource, TokenDef[]>();
    for (const t of tokenCatalog) {
      if (!map.has(t.source)) map.set(t.source, []);
      map.get(t.source)!.push(t);
    }
    return [...map];
  }, []);

  const insert = (source: string, key: string) => {
    editor.chain().focus().insertContent({ type: 'token', attrs: { token: `${source}:${key}` } }).run();
    setOpen(false);
  };

  return (
    <div className="qs-tokpick">
      <button
        type="button"
        className="qs-tbtn qs-tokpick__btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
      >
        Inserir tag ▾
      </button>
      {open && (
        <div className="qs-tokpick__menu" role="menu">
          {groups.map(([source, defs]) => (
            <div key={source} className="qs-tokpick__group">
              <div className="qs-tokpick__source">{source}</div>
              {defs.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  role="menuitem"
                  className="qs-tokpick__item"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insert(source, d.key)}
                  title={`${source}:${d.key}`}
                >
                  <span className="qs-tokpick__label">{d.label}</span>
                  <span className="qs-tokpick__sample">{d.sample}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
