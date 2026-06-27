import { useEffect, useRef, useState } from 'react';
import { Previewer } from 'pagedjs';
import { useQuoteStore } from '@/store/quoteStore';
import { activeLayout } from '@/lib/activeLayout';
import { tokenCatalog } from '@/fixtures/tokenCatalog';
import { buildPreviewHtml } from '@/preview/buildPreviewHtml';
import { buildPagedStyles } from '@/preview/previewStyles';
import { downloadPdf } from '@/lib/pdf';

/** Blocos que aparecem em mais de uma página = divididos (FID-6). */
function detectSplitBlocks(container: HTMLElement): string[] {
  const pagesByLabel = new Map<string, Set<number>>();
  container.querySelectorAll('.pagedjs_page').forEach((page, i) => {
    page.querySelectorAll('[data-block-label]').forEach((el) => {
      const label = el.getAttribute('data-block-label');
      if (!label) return;
      if (!pagesByLabel.has(label)) pagesByLabel.set(label, new Set());
      pagesByLabel.get(label)!.add(i);
    });
  });
  return [...pagesByLabel].filter(([, pages]) => pages.size > 1).map(([label]) => label);
}

export function Preview({ onClose }: { onClose: () => void }) {
  const doc = useQuoteStore((s) => s.doc);
  const containerRef = useRef<HTMLDivElement>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [splitBlocks, setSplitBlocks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState<string | null>(null);

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;
    // Cada run pagina num mount próprio. O cleanup (StrictMode roda o effect 2×)
    // o remove — runs obsoletos escrevem num nó destacado, sem poluir o atual.
    const mount = document.createElement('div');
    host.appendChild(mount);
    let cancelled = false;
    setTotal(null);
    setError(null);

    const html = buildPreviewHtml(doc, activeLayout, tokenCatalog);
    const cssUrl = URL.createObjectURL(
      new Blob([buildPagedStyles(activeLayout.page)], { type: 'text/css' }),
    );

    new Previewer()
      .preview(html, [cssUrl], mount)
      .then((flow) => {
        if (cancelled) return;
        setTotal(flow.total);
        setSplitBlocks(detectSplitBlocks(mount));
      })
      .catch((e) => !cancelled && setError(String(e)))
      .finally(() => URL.revokeObjectURL(cssUrl));

    return () => {
      cancelled = true;
      mount.remove();
    };
  }, [doc]);

  const print = () => {
    document.body.classList.add('qs-printing');
    window.print();
    document.body.classList.remove('qs-printing');
  };

  // Baixar PDF via Gotenberg (PDF-1) — sem marca d'água (PDF-2), texto selecionável.
  const download = async () => {
    setDownloading(true);
    setDlError(null);
    try {
      await downloadPdf(doc, activeLayout, tokenCatalog);
    } catch (e) {
      setDlError(e instanceof Error ? e.message : String(e));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="qs-preview" role="dialog" aria-modal="true" aria-label="Prévia de impressão">
      <div className="qs-preview__bar">
        <strong>Prévia de impressão</strong>
        <span>{total != null ? `${total} página(s)` : 'paginando…'}</span>
        {splitBlocks.length > 0 && (
          <span className="qs-preview__warn">⚠ {splitBlocks.length} bloco(s) dividido(s)</span>
        )}
        <span className="qs-preview__spacer" />
        <button
          type="button"
          className="qs-preview__btn qs-preview__btn--primary"
          onClick={download}
          disabled={downloading}
          title="Gera o PDF final (sem marca d'água) via Gotenberg"
        >
          {downloading ? 'Gerando PDF…' : 'Baixar PDF'}
        </button>
        <button type="button" className="qs-preview__btn" onClick={print} disabled={total == null}>
          Imprimir
        </button>
        <button type="button" className="qs-preview__btn" onClick={onClose}>Fechar</button>
      </div>

      {dlError && (
        <div className="qs-preview__error">
          {dlError} — suba o Gotenberg com <code>docker compose up -d</code>.
        </div>
      )}

      {splitBlocks.length > 0 && (
        <div className="qs-preview__splitnote" role="status">
          Bloco(s) dividido(s) entre páginas: <strong>{splitBlocks.join(', ')}</strong>. A quebra
          exata é definida pela paginação — nunca em silêncio (FID-6).
        </div>
      )}
      {error && <div className="qs-preview__error">Falha ao paginar: {error}</div>}

      <div className="qs-preview__pages" ref={containerRef} />
    </div>
  );
}
