# QuoteStudio — Design

## 1. Arquitetura (módulos e fronteiras)
```
src/
  types/contracts.ts        # contratos canônicos (abaixo) — fonte única de tipos
  fixtures/                  # LayoutTemplate "Completo", QuotationDocument Q-012345 (2 splits), tokenCatalog
  store/                     # Zustand: estado do documento + EditLock + UI; seletores de projeção
  lib/
    projectTree.ts           # projeção QuotationDocument+LayoutTemplate → árvore (puro, testável)
    pageFormat.ts            # PageFormat → CSS custom properties (fonte única de geometria)
    sanitize.ts              # wrapper DOMPurify (allowlist)
    tokens.ts                # resolução {{token:SOURCE:key}} → TokenDef.sample
    diff.ts                  # diff trabalho×default (M3)
  editor/                    # schema Tiptap: node `block` + node atômico `token` + NodeViews + toolbar (M3)
  preview/                   # Paged.js: paginação, margin boxes, marca d'água, print (M4)
  components/                # Shell 3 zonas, Tree, A4Surface, BlockView, Toolbar, Filters
  styles/                    # folha compartilhada editor↔Paged.js (mesmas custom properties)
```
**Fronteiras:** `lib/projectTree.ts` é **puro** (sem React/store) → testável isolado. `store`
é a única fonte de verdade mutável. `editor` e `preview` consomem o **mesmo** CSS de geometria.

## 2. Modelo de dados (contratos refinados — canônicos)
```ts
export type BlockType = 'COVER' | 'HEADER' | 'INTRO' | 'PRODUCT'
  | 'TECHNICAL_NOTES' | 'COMMERCIAL_NOTES' | 'CLOSING' | 'FOOTER';
export type Cardinality = 'ONCE' | 'PER_SPLIT';
export type Lang = 'PT' | 'EN';
export type TokenSource = 'MAESTRO' | 'ORCHESTRA' | 'SAP' | 'Q4P' | 'ASSOM' | 'QUOTATION';

// M1 = HTML; M3 adiciona { format:'tiptap'; doc: JSONContent }
export type BlockContent = { format: 'html'; html: string };

export interface TokenDef { source: TokenSource; key: string; label: string; sample: string; }

export interface BlockSlot {
  id: string; type: BlockType; label: string;
  cardinality: Cardinality; editable: boolean; reorderable: boolean;
  defaultSource: 'ENGINE' | 'OPTIONAL' | 'CUSTOM';
}
export interface PageFormat {
  size: 'A4';
  marginsMm: { top: number; right: number; bottom: number; left: number };
  baseFontPt: number;
}
export interface LayoutTemplate {
  id: string; name: 'Completo' | 'Técnico' | 'Comercial';
  page: PageFormat; slots: BlockSlot[];
}
export interface Split { id: string; label: string; }
export interface BlockInstance {
  instanceId: string; slotId: string; splitId?: string;
  defaultContentByLang: Record<Lang, BlockContent>; // baseline imutável
  contentByLang: Record<Lang, BlockContent>;         // cópia de trabalho
  modified: boolean; origin: 'DEFAULT' | 'CUSTOM' | 'OPTIONAL'; order: number;
}
export interface QuotationDocument {
  quotationId: string; customer: string; status: 'DRAFT';
  templateId: string; revision: number;
  activeLang: Lang; activeLayout: string; visibleSplit: string | 'ALL';
  splits: Split[]; blocks: BlockInstance[];
}
export type EditLock = { mode: 'IDLE' } | { mode: 'EDITING'; instanceId: string };

// Refinos desta fase:
export interface Snapshot { revision: number; takenAt: string; doc: QuotationDocument; } // REV-1
export interface PersistEnvelope { schemaVersion: number; ui: UiState; doc?: QuotationDocument; } // PERS
```

## 3. Máquina de estados do bloqueio (D4)
```
        ┌────────────── "Travar" / clicar fora p/ IDLE ──────────────┐
        ▼                                                            │
   ┌─────────┐   "Editar bloco"(x)        ┌──────────────────┐       │
   │  IDLE   │ ─────────────────────────▶ │  EDITING(x)      │ ──────┘
   └─────────┘                            └──────────────────┘
        ▲                                    │      │
        │  (sem edição ativa)                │      │ seleciona nó y (y≠x)
        │                                    │      ▼
        │                              trava x (preserva estado+modified),
        └──────────────────────────────  entra em EDITING(y)
```
**Invariantes:**
- I1: em `EDITING(x)`, ∀ bloco b≠x ⇒ `setEditable(false)` (LOCK-2).
- I2: transição EDITING(x)→EDITING(y) preserva `contentByLang` e `modified` de x (LOCK-4).
- I3: só existe **um** `instanceId` editável por vez (estado único, LOCK-1).

## 4. Fluxo de projeção documento→árvore
`projectTree(doc, template, {visibleSplit, activeLang, activeLayout})` → ordena ONCE iniciais,
agrupa PER_SPLIT por split, ONCE finais; aplica filtros (projeção, nunca mutação — PROJ-1).
Função pura → testável com fixtures. A página A4 consome a mesma projeção ordenada.

## 5. Fidelidade/paginação (D3) — com o limite honesto
- **Fonte única de geometria:** `PageFormat` → CSS custom properties (`--page-w`, `--page-h`,
  `--margin-*`, `--base-font`) numa folha compartilhada por editor **e** Paged.js → divergência
  impossível por construção (FID-1).
- Coluna editável em medida física; `zoom` só de tela (FID-2). Header/Footer = banda corrente (FID-3).
- **Marcador soft** = altura acumulada vs. útil, recalculado ao editar/rolar (FID-4).
- **"Visualizar" = confirmação/impressão**, não revelação: Paged.js gera "Página X de Y", margin
  boxes, marca d'água, `window.print()`; mesmo HTML/CSS porta p/ jsReport (Chromium) em produção (FID-5/7).
- **Limite honesto:** soft acerta quebras **entre** blocos (~95%); fragmentar **um** bloco que
  transborda com precisão de pixel é o *layout pass* do Paged.js → tratamento: **sinalizar**
  "bloco dividido entre páginas N e N+1", nunca divergir em silêncio (FID-6).

## 6. Tokens (D6) — node atômico + serialização
- Referência no conteúdo: `{{token:SOURCE:key}}`. M1: render `<span data-token>` provisório
  sanitizado. M3: **node atômico** Tiptap (`token`, `atom:true`, não-editável) com NodeView que
  mostra `sample` e revela `SOURCE:key` no hover/foco. Serialização ida-e-volta sem regex de remontagem.
- Catálogo estático `TokenDef[]` (TOK-5).

## 7. Segurança de HTML (NFR-3) — dois pisos
1. **DOMPurify** (allowlist de tags/atributos) em toda colagem/importação. A allowlist inclui
   `img/figure/table/…` para EDIT-6, com `src` em `https:`/`data:image` (DOMPurify bloqueia
   `javascript:`) e **sem** `style` inline (tabelas sem resize).
2. **Schema do editor** (Tiptap/ProseMirror): só admite nodes definidos → markup perigoso não
   tem onde ser armazenado (segundo piso estrutural).

## 8. Mini-ADRs (decisões com alternativas)
- **ADR-1 Editor: Tiptap** (vs Froala/CKEditor5/Lexical). Headless/NodeView → a área editável **é**
  o bloco A4; token como node atômico serializável; modelo JSON ProseMirror habilita snapshot/diff
  sem recurso pago; licença MIT self-hostable. Custo: toolbar manual. **Plano B: Lexical** (MIT, headless).
  Versionação gerenciada da Tiptap Platform **não** usada.
  → Benchmark completo (Froala × Tiptap × Lexical × CKEditor 5 × Slate) a preencher ao final do M3
  em [`editor-benchmark.md`](./editor-benchmark.md) (deliverable D-BENCH).
- **ADR-2 Estado: Zustand** — store leve + máquina de bloqueio; sem boilerplate de Redux.
- **ADR-3 Reordenação: dnd-kit** (react-beautiful-dnd descontinuado).
- **ADR-4 Paginação: Paged.js** só na prévia/impressão; mesmo Chromium do jsReport futuro.
- **ADR-5 Persistência: localStorage** + `schemaVersion` (D7); simplicidade sobre robustez nesta fase.
- **ADR-6 Imagens como base64** (EDIT-6): upload embute a imagem no HTML do bloco (sem backend/CDN —
  NFR-1). Custo: incha o localStorage (R2). Alternativa futura: upload p/ storage externo + URL.
- **ADR-7 Layout ativo via localStorage + reset por reload** (SCHEMA): `lib/activeLayout.ts` resolve
  o layout do `qs:layout` (ou fixture) **1× no import**; editar exige `location.reload()` apagando
  `qs:doc`/`qs:ui`. Evita tornar o layout reativo no store (8 imports trocados de fixture→activeLayout)
  e mantém os slotIds estáveis. Limite: editar só propriedades de slots existentes; slots novos via
  "Adicionar bloco" (BLK), geração de conteúdo default é DP-4.
- **ADR-8 PDF: Gotenberg (Chromium-as-a-service)** (PDF-1, substitui o jsReport do plano original).
  **Mesmo motor do preview** → fidelidade pixel a pixel; **Paged.js roda dentro do Gotenberg** (mesma
  paginação da prévia). Texto vetorial selecionável; OSS Apache-2 self-host. `lib/pdf.ts` faz POST
  multipart (`/forms/chromium/convert/html`, `index.html` + `paged.polyfill.js`, `preferCssPageSize`,
  `waitForExpression`). Justificativa completa em [`pdf-benchmark.md`](./pdf-benchmark.md). **Desvio
  escopado de NFR-1:** só o "Baixar PDF" chama rede (dev: proxy `/gotenberg` + docker-compose; prod:
  BFF). Marca d'água só na prévia (FID-7 atualizado): `buildPagedStyles({watermark})`.

## 9. Riscos/Observações
- **R1:** fragmentação intra-bloco com precisão de pixel é inerentemente do Paged.js; mitigação =
  sinalização honesta (FID-6), não tentar replicar o layout pass no editor.
- **R2:** localStorage tem limite de tamanho; documentos grandes podem estourar — monitorar; `schemaVersion`
  evita carregar fixture velha mas não resolve quota.
- **R3:** EN placeholder (Q4) — garantir que o ponto de extensão de fallback (NFR-5) exista para não
  exigir refactor quando o conteúdo EN real entrar.
- **R4 (ressalva técnica, decisão mantida):** bloqueio por bloco (D4) é mais grosso que "um por vez";
  registrado, mas mantido conforme decisão fechada.
