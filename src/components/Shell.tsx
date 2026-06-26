import { Filters } from './Filters';
import { Tree } from './Tree';
import { A4Surface } from './A4Surface';
import { Inspector } from './Inspector';

// Shell de 3 zonas (D10/T1.5): árvore · página A4 · inspetor. Barra de filtros no topo.
export function Shell() {
  return (
    <div className="qs-shell">
      <header className="qs-topbar">
        <h1 className="qs-brand">QuoteStudio</h1>
        <Filters />
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
