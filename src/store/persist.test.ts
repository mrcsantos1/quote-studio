import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  attachDocPersistence, attachUiPersistence, DOC_STORAGE_KEY,
  loadDoc, loadUi, saveDoc, saveUi, UI_STORAGE_KEY,
} from './persist';
import { createQuoteStore } from './quoteStore';
import { quotationQ012345 } from '@/fixtures/quotation';
import type { UiState } from '@/types/contracts';

// localStorage em memória — fiel à API, sem depender do ambiente (jsdom/Node).
function memoryStorage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() { return m.size; },
    clear: () => m.clear(),
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => void m.set(k, String(v)),
    removeItem: (k: string) => void m.delete(k),
    key: (i: number) => [...m.keys()][i] ?? null,
  } as Storage;
}

const sampleUi: UiState = {
  selectedInstanceId: 'intro',
  expandedSplitIds: ['split-w22'],
  zoom: 1.25,
  treeQuery: 'técnic',
};

beforeEach(() => vi.stubGlobal('localStorage', memoryStorage()));

describe('persistência de UI (PERS-1)', () => {
  test('round-trip: salva e recarrega o mesmo estado', () => {
    saveUi(sampleUi);
    expect(loadUi()).toEqual(sampleUi);
  });

  test('PERS-2: schemaVersion incompatível invalida o estado salvo', () => {
    localStorage.setItem(UI_STORAGE_KEY, JSON.stringify({ schemaVersion: 999, ui: sampleUi }));
    expect(loadUi()).toBeNull();
  });

  test('JSON corrompido não quebra — devolve null', () => {
    localStorage.setItem(UI_STORAGE_KEY, '{nao é json');
    expect(loadUi()).toBeNull();
  });

  test('attachUiPersistence hidrata e depois persiste mudanças', () => {
    saveUi({ ...sampleUi, zoom: 1.5 });
    const store = createQuoteStore(structuredClone(quotationQ012345));
    const detach = attachUiPersistence(store);

    expect(store.getState().ui.zoom).toBe(1.5); // hidratou

    store.getState().setZoom(2);
    expect(loadUi()?.zoom).toBe(2); // persistiu mudança

    detach();
  });
});

describe('persistência de conteúdo (PERS-2/3)', () => {
  test('round-trip do documento', () => {
    saveDoc(quotationQ012345);
    expect(loadDoc()?.quotationId).toBe('Q-012345');
  });

  test('schemaVersion incompatível invalida o doc salvo (PERS-2)', () => {
    localStorage.setItem(DOC_STORAGE_KEY, JSON.stringify({ schemaVersion: 999, doc: quotationQ012345 }));
    expect(loadDoc()).toBeNull();
  });

  test('attachDocPersistence hidrata e persiste edições (PERS-3)', () => {
    const seeded = structuredClone(quotationQ012345);
    seeded.customer = 'Cliente Persistido';
    saveDoc(seeded);

    const store = createQuoteStore(structuredClone(quotationQ012345));
    const detach = attachDocPersistence(store);
    expect(store.getState().doc.customer).toBe('Cliente Persistido'); // hidratou

    store.getState().updateContent('intro', 'PT', '<p>editado</p>');
    expect(loadDoc()?.blocks.find((b) => b.instanceId === 'intro')?.modified).toBe(true);

    detach();
  });
});
