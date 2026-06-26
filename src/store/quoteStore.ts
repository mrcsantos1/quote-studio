import { createStore, type StoreApi } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type { EditLock, Lang, QuotationDocument, UiState } from '@/types/contracts';
import { quotationQ012345 } from '@/fixtures/quotation';

export interface QuoteState {
  doc: QuotationDocument;
  lock: EditLock;
  ui: UiState;

  // Navegação / bloqueio (LOCK-1..4)
  select(instanceId: string): void;
  startEditing(instanceId: string): void;
  stopEditing(): void;

  // Filtros de projeção (PROJ) e UI (PERS-1)
  setVisibleSplit(splitId: string | 'ALL'): void;
  setActiveLang(lang: Lang): void;
  setZoom(zoom: number): void;
  toggleSplitExpanded(splitId: string): void;
  setTreeQuery(query: string): void;
}

/** Seletor puro: I1/LOCK-2 — só o bloco em EDITING é editável. */
export const selectIsEditable = (s: QuoteState, instanceId: string): boolean =>
  s.lock.mode === 'EDITING' && s.lock.instanceId === instanceId;

function initialUi(doc: QuotationDocument): UiState {
  return {
    selectedInstanceId: null,
    expandedSplitIds: doc.splits.map((s) => s.id),
    zoom: 1,
    treeQuery: '',
  };
}

export function createQuoteStore(doc: QuotationDocument): StoreApi<QuoteState> {
  return createStore<QuoteState>((set) => ({
    doc,
    lock: { mode: 'IDLE' },
    ui: initialUi(doc),

    select: (instanceId) =>
      set((s) => ({
        // LOCK-4: ao selecionar outro nó durante EDITING(x), x é travado (→ IDLE).
        // Selecionar o próprio bloco em edição não interrompe a edição.
        lock:
          s.lock.mode === 'EDITING' && s.lock.instanceId !== instanceId
            ? { mode: 'IDLE' }
            : s.lock,
        ui: { ...s.ui, selectedInstanceId: instanceId },
      })),

    startEditing: (instanceId) =>
      set((s) => ({
        lock: { mode: 'EDITING', instanceId },
        ui: { ...s.ui, selectedInstanceId: instanceId },
      })),

    stopEditing: () => set({ lock: { mode: 'IDLE' } }),

    setVisibleSplit: (visibleSplit) => set((s) => ({ doc: { ...s.doc, visibleSplit } })),

    setActiveLang: (activeLang) => set((s) => ({ doc: { ...s.doc, activeLang } })),

    setZoom: (zoom) => set((s) => ({ ui: { ...s.ui, zoom } })),

    toggleSplitExpanded: (splitId) =>
      set((s) => {
        const has = s.ui.expandedSplitIds.includes(splitId);
        return {
          ui: {
            ...s.ui,
            expandedSplitIds: has
              ? s.ui.expandedSplitIds.filter((id) => id !== splitId)
              : [...s.ui.expandedSplitIds, splitId],
          },
        };
      }),

    setTreeQuery: (treeQuery) => set((s) => ({ ui: { ...s.ui, treeQuery } })),
  }));
}

/** Store padrão da aplicação (fixture Q-012345). */
export const quoteStore = createQuoteStore(quotationQ012345);

/** Hook React tipado sobre o store padrão. */
export function useQuoteStore<T>(selector: (s: QuoteState) => T): T {
  return useStore(quoteStore, selector);
}
