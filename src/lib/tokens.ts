import type { TokenDef, TokenSource } from '@/types/contracts';

// Referência de token embutida no conteúdo: {{token:SOURCE:key}} (TOK-1).
const TOKEN_RE = /\{\{token:([A-Z0-9]+):([A-Za-z0-9_.-]+)\}\}/g;

export interface ParsedTokenRef {
  source: TokenSource;
  key: string;
}

/** Faz parse de uma referência isolada. Devolve null se não casar o formato. */
export function parseTokenRef(raw: string): ParsedTokenRef | null {
  const m = /^\{\{token:([A-Z0-9]+):([A-Za-z0-9_.-]+)\}\}$/.exec(raw.trim());
  return m ? { source: m[1] as TokenSource, key: m[2] } : null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Expansão provisória do M1 (TOK-4): troca cada {{token:…}} por um <span>
 * sanitizável (chip não-atômico). O M3 substitui isto por um node atômico Tiptap.
 * Tokens desconhecidos não quebram a renderização — viram chip marcado.
 * O texto-valor (sample) é escapado para que o catálogo não vire vetor de injeção.
 */
/**
 * Storage → editor: troca {{token:S:k}} por `<span data-token="S:k">` vazio,
 * que o node atômico `token` do Tiptap reconhece no parse (TOK-3).
 */
export function markersToSpans(html: string): string {
  return html.replace(TOKEN_RE, (_full, source: string, key: string) =>
    `<span data-token="${source}:${key}"></span>`);
}

/**
 * Editor → storage: troca cada `<span data-token="S:k">…</span>` de volta para
 * {{token:S:k}}, descartando o sample renderizado. Usa DOM para robustez.
 */
export function spansToMarkers(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('span[data-token]').forEach((el) => {
    el.replaceWith(`{{token:${el.getAttribute('data-token')}}}`);
  });
  return doc.body.innerHTML;
}

export function expandTokens(html: string, catalog: TokenDef[]): string {
  const byKey = new Map(catalog.map((t) => [`${t.source}:${t.key}`, t]));

  return html.replace(TOKEN_RE, (_full, source: string, key: string) => {
    const lookup = `${source}:${key}`;
    const def = byKey.get(lookup);
    const cls = def ? 'qs-token' : 'qs-token qs-token--unknown';
    const text = def ? def.sample : `⟨${key}⟩`;
    const title = def ? lookup : `Token não resolvido: ${lookup}`;
    return `<span class="${cls}" data-token="${escapeHtml(lookup)}" title="${escapeHtml(title)}">${escapeHtml(text)}</span>`;
  });
}
