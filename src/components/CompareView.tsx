import { useMemo } from 'react';
import { diffHtml } from '@/lib/diff';
import { expandTokens } from '@/lib/tokens';
import { tokenCatalog } from '@/fixtures/tokenCatalog';
import { useQuoteStore } from '@/store/quoteStore';

// Texto legível p/ o diff: resolve tokens no sample e remove tags.
function plainText(html: string): string {
  return expandTokens(html, tokenCatalog)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function CompareView({ instanceId }: { instanceId: string }) {
  const instance = useQuoteStore((s) => s.doc.blocks.find((b) => b.instanceId === instanceId));
  const lang = useQuoteStore((s) => s.doc.activeLang);

  const segs = useMemo(() => {
    if (!instance) return [];
    return diffHtml(plainText(instance.defaultContentByLang[lang].html), plainText(instance.contentByLang[lang].html));
  }, [instance, lang]);

  if (!instance) return null;

  return (
    <div className="qs-compare" aria-label="Comparação trabalho × default">
      <p className="qs-compare__hint">Trabalho × default</p>
      <p className="qs-compare__body">
        {segs.map((s, i) =>
          s.type === 'equal' ? (
            <span key={i}>{s.value}</span>
          ) : s.type === 'add' ? (
            <ins key={i} className="qs-compare__add">{s.value}</ins>
          ) : (
            <del key={i} className="qs-compare__del">{s.value}</del>
          ),
        )}
      </p>
    </div>
  );
}
