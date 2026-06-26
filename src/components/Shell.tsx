import { Filters } from './Filters';
import { Tree } from './Tree';
import { A4Surface } from './A4Surface';
import { Inspector } from './Inspector';

// Shell de 3 zonas (D10/T1.5): árvore · página A4 · inspetor. Barra de filtros no topo.
export function Shell({ onPreview, onEditLayout }: { onPreview: () => void; onEditLayout: () => void }) {
  return (
    <div className="qs-shell">
      <header className="qs-topbar">
        <h1 className="qs-brand">QuoteStudio</h1>
        <Filters />
        <span className="qs-topbar__spacer" />
        <button type="button" className="qs-topbtn" onClick={onEditLayout}>
          Editar layout
        </button>
        <button type="button" className="qs-visualizar" onClick={onPreview}>
          Visualizar
        </button>
      </header>
      <div className="qs-zones">
        <Tree />
        <main className="qs-canvas" aria-label="Documento">
          <A4Surface />
        </main>
        <Inspector />
      </div>
    </div>
  );
}
