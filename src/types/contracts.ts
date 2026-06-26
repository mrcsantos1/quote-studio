// Contratos canônicos do QuoteStudio — fonte única de tipos (design.md §2).
// Qualquer módulo (store, projeção, fixtures, editor, preview) importa daqui.

export type BlockType =
  | 'COVER'
  | 'HEADER'
  | 'INTRO'
  | 'PRODUCT'
  | 'TECHNICAL_NOTES'
  | 'COMMERCIAL_NOTES'
  | 'CLOSING'
  | 'FOOTER';

export type Cardinality = 'ONCE' | 'PER_SPLIT';

export type Lang = 'PT' | 'EN';

export type TokenSource =
  | 'MAESTRO'
  | 'ORCHESTRA'
  | 'SAP'
  | 'Q4P'
  | 'ASSOM'
  | 'QUOTATION';

/**
 * Conteúdo de um bloco. No M1 é HTML cru (sanitizado na borda — NFR-3).
 * O M3 acrescenta a variante `{ format: 'tiptap'; doc: JSONContent }`.
 */
export type BlockContent = { format: 'html'; html: string };

export interface TokenDef {
  source: TokenSource;
  key: string;
  label: string;
  /** Valor de exemplo exibido no chip enquanto não há resolução real (TOK-2). */
  sample: string;
}

export interface BlockSlot {
  id: string;
  type: BlockType;
  label: string;
  cardinality: Cardinality;
  editable: boolean;
  reorderable: boolean;
  defaultSource: 'ENGINE' | 'OPTIONAL' | 'CUSTOM';
}

/** Geometria física da página — fonte única de medida (FID-1). */
export interface PageFormat {
  size: 'A4';
  marginsMm: { top: number; right: number; bottom: number; left: number };
  baseFontPt: number;
}

export interface LayoutTemplate {
  id: string;
  name: 'Completo' | 'Técnico' | 'Comercial';
  page: PageFormat;
  slots: BlockSlot[];
}

export interface Split {
  id: string;
  label: string;
}

export interface BlockInstance {
  instanceId: string;
  slotId: string;
  /** Presente apenas para slots PER_SPLIT. */
  splitId?: string;
  /** Baseline imutável (default carregado). Nunca mutar após criar. */
  defaultContentByLang: Record<Lang, BlockContent>;
  /** Cópia de trabalho (o que o usuário edita). */
  contentByLang: Record<Lang, BlockContent>;
  /** `true` quando contentByLang diverge de defaultContentByLang (EDIT-2). */
  modified: boolean;
  origin: 'DEFAULT' | 'CUSTOM' | 'OPTIONAL';
  order: number;
}

export interface QuotationDocument {
  quotationId: string;
  customer: string;
  status: 'DRAFT';
  templateId: string;
  revision: number;
  // Filtros de projeção (PROJ-1): mudam a visualização, nunca `blocks`.
  activeLang: Lang;
  activeLayout: string;
  visibleSplit: string | 'ALL';
  splits: Split[];
  blocks: BlockInstance[];
}

/** Estado único de edição (LOCK-1 / invariante I3). */
export type EditLock = { mode: 'IDLE' } | { mode: 'EDITING'; instanceId: string };

/** Snapshot de revisão (REV-1). */
export interface Snapshot {
  revision: number;
  takenAt: string;
  doc: QuotationDocument;
}

/** Estado de UI persistido (PERS-1). Projeção/escala/seleção — não é dado do documento. */
export interface UiState {
  selectedInstanceId: string | null;
  expandedSplitIds: string[];
  zoom: number;
  treeQuery: string;
}

/** Envelope de persistência em localStorage com versão de schema (PERS-2). */
export interface PersistEnvelope {
  schemaVersion: number;
  ui: UiState;
  doc?: QuotationDocument;
}
