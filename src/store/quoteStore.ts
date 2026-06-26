import { createStore, type StoreApi } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type { EditLock, Lang, QuotationDocument, Snapshot, UiState } from '@/types/contracts';
import { quotationQ012345 } from '@/fixtures/quotation';
import { layoutCompleto } from '@/fixtures/layoutCompleto';
import { reorderBlocks } from '@/lib/reorder';
import { restored, withContent } from '@/lib/blockEdits';
import { canIncludeNote, isDeletableNote, makeNote } from '@/lib/notes';

export interface QuoteState {
  doc: QuotationDocument;
  lock: EditLock;
  ui: UiState;
  snapshots: Snapshot[];

  // Revisões (REV-1)
  takeSnapshot(): void;

  // Navegação / bloqueio (LOCK-1..4)
  select(instanceId: string): void;
  startEditing(instanceId: string): void;
  stopEditing(): void;

  // Edição de conteúdo (EDIT-2/3)
  updateContent(instanceId: string, lang: Lang, html: string): void;
  reloadItem(instanceId: string): void;
  reloadAll(): void;
  deleteNote(instanceId: string): void;
  includeNote(splitId: string, slotId: string): void;

  // Reordenação (DND-1/2)
  reorder(activeId: string, overId: string): void;

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
    snapshots: [],

    takeSnapshot: () =>
      set((s) => ({
        snapshots: [
          ...s.snapshots,
          { revision: s.doc.revision, takenAt: new Date().toISOString(), doc: structuredClone(s.doc) },
        ],
        doc: { ...s.doc, revision: s.doc.revision + 1 },
      })),

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

    updateContent: (instanceId, lang, html) =>
      set((s) => ({
        doc: {
          ...s.doc,
          blocks: s.doc.blocks.map((b) =>
            b.instanceId === instanceId ? withContent(b, lang, html) : b,
          ),
        },
      })),

    reloadItem: (instanceId) =>
      set((s) => ({
        doc: {
          ...s.doc,
          blocks: s.doc.blocks.map((b) => (b.instanceId === instanceId ? restored(b) : b)),
        },
      })),

    reloadAll: () =>
      set((s) => ({
        doc: { ...s.doc, blocks: s.doc.blocks.map((b) => restored(b)) },
      })),

    deleteNote: (instanceId) =>
      set((s) => {
        const b = s.doc.blocks.find((x) => x.instanceId === instanceId);
        const slot = b && layoutCompleto.slots.find((x) => x.id === b.slotId);
        if (!b || !slot || !isDeletableNote(slot)) return {};
        return { doc: { ...s.doc, blocks: s.doc.blocks.filter((x) => x.instanceId !== instanceId) } };
      }),

    includeNote: (splitId, slotId) =>
      set((s) => {
        const slot = layoutCompleto.slots.find((x) => x.id === slotId);
        if (!slot || !canIncludeNote(slot)) return {};
        const orders = s.doc.blocks.filter((b) => b.splitId === splitId).map((b) => b.order);
        const order = (orders.length ? Math.max(...orders) : -1) + 1;
        const note = makeNote(slot, splitId, order);
        return {
          doc: { ...s.doc, blocks: [...s.doc.blocks, note] },
          ui: { ...s.ui, selectedInstanceId: note.instanceId },
        };
      }),

    reorder: (activeId, overId) =>
      set((s) => {
        const blocks = reorderBlocks(s.doc.blocks, layoutCompleto, activeId, overId);
        return blocks === s.doc.blocks ? {} : { doc: { ...s.doc, blocks } };
      }),

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
