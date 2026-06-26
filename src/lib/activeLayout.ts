import type { BlockType, Cardinality, LayoutTemplate } from '@/types/contracts';
import { layoutCompleto } from '@/fixtures/layoutCompleto';

export const LAYOUT_STORAGE_KEY = 'qs:layout';
const LAYOUT_SCHEMA_VERSION = 1;

const BLOCK_TYPES: BlockType[] = [
  'COVER', 'HEADER', 'INTRO', 'PRODUCT', 'TECHNICAL_NOTES', 'COMMERCIAL_NOTES', 'CLOSING', 'FOOTER',
];
const CARDINALITIES: Cardinality[] = ['ONCE', 'PER_SPLIT'];

interface LayoutEnvelope {
  schemaVersion: number;
  layout: LayoutTemplate;
}

/** Carrega o layout salvo (qs:layout); null se ausente, corrompido ou de schema antigo. */
export function loadStoredLayout(): LayoutTemplate | null {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LayoutEnvelope>;
    if (parsed.schemaVersion !== LAYOUT_SCHEMA_VERSION || !parsed.layout) return null;
    return parsed.layout;
  } catch {
    return null;
  }
}

export function saveLayout(layout: LayoutTemplate): void {
  localStorage.setItem(
    LAYOUT_STORAGE_KEY,
    JSON.stringify({ schemaVersion: LAYOUT_SCHEMA_VERSION, layout }),
  );
}

export function clearStoredLayout(): void {
  localStorage.removeItem(LAYOUT_STORAGE_KEY);
}

/** Validação básica de um layout editado à mão. Devolve a mensagem de erro ou null. */
export function validateLayout(obj: unknown): string | null {
  if (typeof obj !== 'object' || obj === null) return 'Layout deve ser um objeto.';
  const l = obj as Partial<LayoutTemplate>;
  if (typeof l.id !== 'string' || !l.id) return 'Campo "id" obrigatório.';
  if (!l.page || typeof l.page !== 'object') return 'Campo "page" obrigatório.';
  if (!Array.isArray(l.slots) || l.slots.length === 0) return 'Campo "slots" deve ser uma lista não vazia.';
  for (const s of l.slots) {
    if (!s || typeof s.id !== 'string') return 'Cada slot precisa de "id".';
    if (!BLOCK_TYPES.includes(s.type)) return `Slot "${s.id}": type inválido (${String(s.type)}).`;
    if (!CARDINALITIES.includes(s.cardinality)) return `Slot "${s.id}": cardinality inválida.`;
    for (const f of ['editable', 'reorderable', 'removable'] as const) {
      if (typeof s[f] !== 'boolean') return `Slot "${s.id}": "${f}" deve ser boolean.`;
    }
  }
  return null;
}

// Resolvido 1× no import: editar o layout exige recarregar a tela (decisão do usuário).
export const activeLayout: LayoutTemplate = loadStoredLayout() ?? layoutCompleto;
