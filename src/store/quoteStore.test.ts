import { beforeEach, describe, expect, test } from 'vitest';
import type { StoreApi } from 'zustand/vanilla';
import { createQuoteStore, selectIsEditable, type QuoteState } from './quoteStore';
import { quotationQ012345 } from '@/fixtures/quotation';

let store: StoreApi<QuoteState>;
beforeEach(() => {
  store = createQuoteStore(structuredClone(quotationQ012345));
});

describe('máquina de bloqueio (LOCK / I1–I3)', () => {
  test('LOCK-1: estado inicial é IDLE, sem seleção', () => {
    const s = store.getState();
    expect(s.lock).toEqual({ mode: 'IDLE' });
    expect(s.ui.selectedInstanceId).toBeNull();
  });

  test('LOCK-3: startEditing entra em EDITING(x) e seleciona x', () => {
    store.getState().startEditing('intro');
    const s = store.getState();
    expect(s.lock).toEqual({ mode: 'EDITING', instanceId: 'intro' });
    expect(s.ui.selectedInstanceId).toBe('intro');
  });

  test('LOCK-2/I1: em EDITING(x), só x é editável', () => {
    store.getState().startEditing('intro');
    const s = store.getState();
    expect(selectIsEditable(s, 'intro')).toBe(true);
    expect(selectIsEditable(s, 'closing')).toBe(false);
  });

  test('LOCK-3: stopEditing volta a IDLE', () => {
    store.getState().startEditing('intro');
    store.getState().stopEditing();
    expect(store.getState().lock).toEqual({ mode: 'IDLE' });
  });

  test('LOCK-4/I2: selecionar outro nó trava x preservando seu conteúdo e flag', () => {
    store.getState().startEditing('intro');
    const introBefore = structuredClone(
      store.getState().doc.blocks.find((b) => b.instanceId === 'intro'),
    );

    store.getState().select('closing');

    const s = store.getState();
    expect(s.lock).toEqual({ mode: 'IDLE' }); // x travado
    expect(s.ui.selectedInstanceId).toBe('closing');
    const introAfter = s.doc.blocks.find((b) => b.instanceId === 'intro');
    expect(introAfter).toEqual(introBefore); // conteúdo + modified preservados
  });

  test('I3: startEditing(y) durante EDITING(x) deixa só y editável', () => {
    store.getState().startEditing('intro');
    store.getState().startEditing('closing');
    const s = store.getState();
    expect(s.lock).toEqual({ mode: 'EDITING', instanceId: 'closing' });
    expect(selectIsEditable(s, 'intro')).toBe(false);
    expect(selectIsEditable(s, 'closing')).toBe(true);
  });

  test('selecionar o próprio bloco em edição mantém a edição', () => {
    store.getState().startEditing('intro');
    store.getState().select('intro');
    expect(store.getState().lock).toEqual({ mode: 'EDITING', instanceId: 'intro' });
  });
});

describe('filtros de projeção (PROJ-1)', () => {
  test('setVisibleSplit muda a projeção sem tocar doc.blocks', () => {
    const before = structuredClone(store.getState().doc.blocks);
    store.getState().setVisibleSplit('split-w40');
    const s = store.getState();
    expect(s.doc.visibleSplit).toBe('split-w40');
    expect(s.doc.blocks).toEqual(before);
  });
});

describe('reordenação (DND-1/2)', () => {
  const orderOf = (id: string) =>
    store.getState().doc.blocks.find((b) => b.instanceId === id)!.order;

  test('reorder troca a ordem das notas reordenáveis do split', () => {
    const t0 = orderOf('technical--split-w22');
    const c0 = orderOf('commercial--split-w22');
    store.getState().reorder('technical--split-w22', 'commercial--split-w22');
    expect(orderOf('technical--split-w22')).toBe(c0);
    expect(orderOf('commercial--split-w22')).toBe(t0);
  });

  test('reorder de bloco read-only é no-op', () => {
    const before = structuredClone(store.getState().doc.blocks);
    store.getState().reorder('product--split-w22', 'technical--split-w22');
    expect(store.getState().doc.blocks).toEqual(before);
  });
});
