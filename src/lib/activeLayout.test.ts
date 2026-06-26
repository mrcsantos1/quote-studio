import { beforeEach, describe, expect, test, vi } from 'vitest';
import { LAYOUT_STORAGE_KEY, loadStoredLayout, validateLayout } from './activeLayout';
import { layoutCompleto } from '@/fixtures/layoutCompleto';

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

beforeEach(() => vi.stubGlobal('localStorage', memoryStorage()));

describe('loadStoredLayout (SCHEMA)', () => {
  test('ausente → null', () => {
    expect(loadStoredLayout()).toBeNull();
  });

  test('round-trip de um layout válido', () => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, layout: layoutCompleto }));
    expect(loadStoredLayout()?.id).toBe('completo');
  });

  test('schemaVersion incompatível → null', () => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({ schemaVersion: 99, layout: layoutCompleto }));
    expect(loadStoredLayout()).toBeNull();
  });

  test('JSON corrompido → null (sem throw)', () => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, '{nao json');
    expect(loadStoredLayout()).toBeNull();
  });
});

describe('validateLayout', () => {
  test('layout da fixture é válido', () => {
    expect(validateLayout(layoutCompleto)).toBeNull();
  });

  test('rejeita type inválido', () => {
    const bad = { ...layoutCompleto, slots: [{ ...layoutCompleto.slots[0], type: 'XPTO' }] };
    expect(validateLayout(bad)).toMatch(/type inválido/);
  });

  test('rejeita flag não-boolean', () => {
    const bad = { ...layoutCompleto, slots: [{ ...layoutCompleto.slots[0], removable: 'sim' }] };
    expect(validateLayout(bad)).toMatch(/removable/);
  });

  test('rejeita slots vazio', () => {
    expect(validateLayout({ ...layoutCompleto, slots: [] })).toMatch(/slots/);
  });
});
