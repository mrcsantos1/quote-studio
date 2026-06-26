import type { Lang } from '@/types/contracts';
import { useQuoteStore } from '@/store/quoteStore';
import { activeLayout } from '@/lib/activeLayout';

// Filtros de projeção (PROJ-1/2/3) + escala de tela (FID-2). Nenhum muta blocks.
export function Filters() {
  const activeLang = useQuoteStore((s) => s.doc.activeLang);
  const visibleSplit = useQuoteStore((s) => s.doc.visibleSplit);
  const splits = useQuoteStore((s) => s.doc.splits);
  const zoom = useQuoteStore((s) => s.ui.zoom);
  const setActiveLang = useQuoteStore((s) => s.setActiveLang);
  const setVisibleSplit = useQuoteStore((s) => s.setVisibleSplit);
  const setZoom = useQuoteStore((s) => s.setZoom);

  return (
    <div className="qs-filters" role="toolbar" aria-label="Filtros de projeção">
      <label className="qs-field">
        <span>Idioma</span>
        <select value={activeLang} onChange={(e) => setActiveLang(e.target.value as Lang)}>
          <option value="PT">Português</option>
          <option value="EN">English (placeholder)</option>
        </select>
      </label>

      <label className="qs-field">
        <span>Layout</span>
        <select value={activeLayout.id} disabled>
          <option value={activeLayout.id}>{activeLayout.name}</option>
        </select>
      </label>

      <label className="qs-field">
        <span>Split</span>
        <select value={visibleSplit} onChange={(e) => setVisibleSplit(e.target.value)}>
          <option value="ALL">Todos</option>
          {splits.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </label>

      <label className="qs-field qs-field--zoom">
        <span>Zoom {Math.round(zoom * 100)}%</span>
        <input
          type="range"
          min={0.5}
          max={1.6}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
        />
      </label>
    </div>
  );
}
