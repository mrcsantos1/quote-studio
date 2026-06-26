import type { StoreApi } from 'zustand/vanilla';
import type { QuotationDocument, UiState } from '@/types/contracts';
import type { QuoteState } from './quoteStore';

export const UI_STORAGE_KEY = 'qs:ui';
export const DOC_STORAGE_KEY = 'qs:doc';
// Versão do schema persistido (PERS-2): bump invalida estado salvo antigo.
const UI_SCHEMA_VERSION = 1;
const DOC_SCHEMA_VERSION = 1;

interface UiEnvelope {
  schemaVersion: number;
  ui: UiState;
}

export function saveUi(ui: UiState): void {
  try {
    const envelope: UiEnvelope = { schemaVersion: UI_SCHEMA_VERSION, ui };
    localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // localStorage indisponível ou quota estourada — persistência é best-effort.
  }
}

/** Carrega a UI salva; devolve null se ausente, corrompida ou de schema antigo. */
export function loadUi(): UiState | null {
  try {
    const raw = localStorage.getItem(UI_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UiEnvelope>;
    if (parsed.schemaVersion !== UI_SCHEMA_VERSION || !parsed.ui) return null;
    return parsed.ui;
  } catch {
    return null;
  }
}

/**
 * Hidrata a UI do store a partir do localStorage e passa a persistir cada
 * mudança de `ui`. Side-effect deliberado: chamado só para o store da app,
 * nunca nos testes do reducer (que usam createQuoteStore puro). Devolve o
 * detach para limpeza.
 */
export function attachUiPersistence(store: StoreApi<QuoteState>): () => void {
  const saved = loadUi();
  if (saved) {
    store.setState((s) => ({ ui: { ...s.ui, ...saved } }));
  }

  let prevUi = store.getState().ui;
  return store.subscribe((state) => {
    if (state.ui !== prevUi) {
      prevUi = state.ui;
      saveUi(state.ui);
    }
  });
}

// ----- Conteúdo do documento (PERS-2/3) -----

interface DocEnvelope {
  schemaVersion: number;
  doc: QuotationDocument;
}

export function saveDoc(doc: QuotationDocument): void {
  try {
    const envelope: DocEnvelope = { schemaVersion: DOC_SCHEMA_VERSION, doc };
    localStorage.setItem(DOC_STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // best-effort (quota/indisponível)
  }
}

/** Carrega o doc salvo; null se ausente, corrompido ou de schema antigo (PERS-2). */
export function loadDoc(): QuotationDocument | null {
  try {
    const raw = localStorage.getItem(DOC_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DocEnvelope>;
    if (parsed.schemaVersion !== DOC_SCHEMA_VERSION || !parsed.doc) return null;
    return parsed.doc;
  } catch {
    return null;
  }
}

/**
 * Hidrata o documento do localStorage (PERS-3: reload mantém edições) e passa a
 * persistir cada mudança de `doc`. Side-effect só para o store da app.
 */
export function attachDocPersistence(store: StoreApi<QuoteState>): () => void {
  const saved = loadDoc();
  if (saved) store.setState({ doc: saved });

  let prevDoc = store.getState().doc;
  return store.subscribe((state) => {
    if (state.doc !== prevDoc) {
      prevDoc = state.doc;
      saveDoc(state.doc);
    }
  });
}
