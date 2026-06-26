import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useQuoteStore } from '@/store/quoteStore';
import { projectTree } from '@/lib/projectTree';
import { pageFormatToCssVars, type PageCssVars } from '@/lib/pageFormat';
import { renderBlockHtml } from '@/lib/renderBlock';
import { activeLayout } from '@/lib/activeLayout';
import { tokenCatalog } from '@/fixtures/tokenCatalog';
import { BlockView } from './BlockView';

const MM_TO_PX = 96 / 25.4; // 96 CSS dpi
const BAND_SLOTS = new Set(['header', 'footer']);

function mmVarToPx(vars: PageCssVars, key: string): number {
  return Number(String(vars[key] ?? '0').replace('mm', '')) * MM_TO_PX;
}

export function A4Surface() {
  const doc = useQuoteStore((s) => s.doc);
  const zoom = useQuoteStore((s) => s.ui.zoom);

  const groups = useMemo(() => projectTree(doc, activeLayout), [doc]);
  const pageVars = useMemo(() => pageFormatToCssVars(activeLayout.page), []);

  const header = doc.blocks.find((b) => b.slotId === 'header');
  const footer = doc.blocks.find((b) => b.slotId === 'footer');
  const headerHtml = header ? renderBlockHtml(header, doc.activeLang, tokenCatalog) : '';
  const footerHtml = footer ? renderBlockHtml(footer, doc.activeLang, tokenCatalog) : '';

  // Marcadores de quebra "soft" (FID-4): linhas onde o conteúdo cruza o limite útil
  // de página. Aproximação honesta entre blocos; o corte exato fica no Paged.js (M4).
  const bodyRef = useRef<HTMLDivElement>(null);
  const [breaks, setBreaks] = useState<number[]>([]);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    const recompute = () => {
      const pageHeightPx = mmVarToPx(pageVars, '--qs-content-h');
      if (pageHeightPx <= 0) return;
      const ys: number[] = [];
      for (let y = pageHeightPx; y < body.scrollHeight; y += pageHeightPx) ys.push(y);
      setBreaks(ys);
    };

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(body);
    return () => ro.disconnect();
  }, [pageVars, doc]);

  return (
    <div className="qs-stage">
      <div className="qs-page" style={{ ...pageVars, transform: `scale(${zoom})` } as CSSProperties}>
        <div className="qs-band qs-band--top" dangerouslySetInnerHTML={{ __html: headerHtml }} />

        <div className="qs-page__body" ref={bodyRef}>
          {groups.map((g) => {
            const nodes = g.nodes.filter((n) => !BAND_SLOTS.has(n.slotId));
            if (nodes.length === 0) return null;
            return (
              <div key={g.kind + (g.splitId ?? '')} className="qs-bodygroup">
                {g.kind === 'SPLIT' && <div className="qs-splitmark">{g.label}</div>}
                {nodes.map((n) => (
                  <BlockView key={n.instanceId} instanceId={n.instanceId} />
                ))}
              </div>
            );
          })}

          {breaks.map((y, i) => (
            <div key={y} className="qs-pagebreak" style={{ top: y }} aria-hidden>
              <span>Página {i + 1} | {i + 2}</span>
            </div>
          ))}
        </div>

        <div className="qs-band qs-band--bottom" dangerouslySetInnerHTML={{ __html: footerHtml }} />
      </div>
    </div>
  );
}
