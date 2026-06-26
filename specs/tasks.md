# QuoteStudio — Tarefas (M1→M4)

> Cada tarefa referencia os IDs de requisito que satisfaz. Tarefas pequenas e testáveis.
> Status: ✅ concluída · 🟡 em andamento · ⬜ pendente. Commits no rodapé ("Progresso").

## M1 — Esqueleto ✅ (commit `c82b5df`)
- ✅ **T1.1** Scaffold Vite+React+TS, pnpm. → NFR-1/2
- ✅ **T1.2** `types/contracts.ts` (contratos canônicos da seção 2 do design). → (base de tudo)
- ✅ **T1.3** Fixtures: `LayoutTemplate "Completo"`, `QuotationDocument Q-012345` (2 splits), `tokenCatalog`. → TREE-1, TOK-5
- ✅ **T1.4** `lib/projectTree.ts` puro + testes (ONCE/PER_SPLIT/filtros). → TREE-1/2, PROJ-1/3
- ✅ **T1.5** Shell de 3 zonas + árvore projetada com `role=tree` e teclado. → TREE-3/5, VIS-2
- ✅ **T1.6** Store Zustand: documento + `EditLock` + UI; máquina de bloqueio (invariantes I1–I3). → LOCK-1..4
- ✅ **T1.7** Estados visuais (selecionado/edição/modificado/bloqueado). → VIS-1
- ✅ **T1.8** Superfície A4 fiel: `lib/pageFormat.ts` → CSS custom properties; banda corrente; quebra soft. → FID-1..4
- ✅ **T1.9** Tokens resolvidos como `<span>` provisório + `lib/sanitize.ts` (DOMPurify). → TOK-1/2/4, NFR-3
- ✅ **T1.10** Persistência de UI no localStorage. → PERS-1

## M2 — Árvore viva ✅ (commit `ef997b0`)
- ✅ **T2.1** Busca na árvore (`filterTreeGroups`, filtro de projeção). → TREE-4
- ✅ **T2.2** Indicadores de estado completos na árvore (dot modificado, cadeado, RO). → VIS-1
- ✅ **T2.3** Reordenação dnd-kit → `reorderBlocks` atualiza `order`; respeita `reorderable` e fronteiras. → DND-1/2
  - *Nota:* gesto de arraste não dirigível no harness headless do Playwright (limitação dnd-kit↔Playwright);
    lógica coberta por testes unitários; verificar com mouse real.

## M3 — Editor por bloco
Executado em fatias granulares (decisão: começar pela camada de modelo testável, sem Tiptap):

**Deliverable:**
- ✅ **D-BENCH** Benchmark de editores (Froala × Tiptap × Lexical × CKEditor 5 × Slate × Quill) com
  scoring ponderado C1–C9 concluindo por **Tiptap** (decidido no round-trip de HTML). →
  [`editor-benchmark.md`](./editor-benchmark.md) · contexto em design.md ADR-1.

**Fatia B — modelo (TDD, sem Tiptap):** ✅ (commit a seguir)
- ✅ **T3.3** Flag `modified` (trabalho≠default) calculada no modelo. → EDIT-2, VIS-1
- ✅ **T3.4a** `lib/blockEdits.ts`: `withContent` / `restored` / `isModified` (puros, 7 testes). → EDIT-2/3
- ✅ **T3.4b** Store: `updateContent` / `reloadItem` / `reloadAll` (4 testes). → EDIT-3
  - *UI desses controles entra na fatia editor (modified só muda via edição real).*

**Fatia editor (Tiptap):** ✅ (commit a seguir)
- ✅ **T3.1** Node atômico `token` (catálogo injetado, `atom:true`) + conversão storage↔editor
  (`markersToSpans`/`spansToMarkers`); editor Tiptap por bloco em edição. → EDIT-1, TOK-3
- ✅ **T3.2** Toolbar manual (B/I/S/listas/undo-redo via `useEditorState`); só o bloco em
  EDITING monta editor (= `setEditable` por instância). → EDIT-4, LOCK-2
- ✅ **T3.4-ui** Inspector: Recarregar item / Recarregar todos (travam p/ re-montar restaurado). → EDIT-3
- ✅ **T3.4c** `lib/notes.ts` + store `deleteNote`/`includeNote`; UI no Inspector. → EDIT-3

**Fatia persistência/comparar:** ✅ (commit a seguir)
- ✅ **T3.5** Persistência de conteúdo (`qs:doc` + `schemaVersion`, hidrata no boot). → PERS-2/3, EDIT-5
- ✅ **T3.6** `lib/diff.ts` (LCS por palavra) "Comparar" trabalho×default + `takeSnapshot` (REV-1).
  → REV-1/2 · *Nota:* snapshots não são persistidos (clones inteiros → risco de quota R2); a
  revisão incrementada sobrevive ao reload pela persistência do doc. Comparar entre revisões = DP-1 (fora).

## M4 — Prévia/impressão ✅ (commit a seguir)
- ✅ **T4.1** Paged.js: `buildPreviewHtml` (doc completo, ALL splits) + `buildPagedStyles`
  (@page A4, header/footer correntes, "Página X de Y" via counter). → FID-5
- ✅ **T4.2** Marca d'água "RASCUNHO" + `window.print()` (print CSS esconde o shell). → FID-7
- ✅ **T4.3** `detectSplitBlocks`: blocos em >1 página → banner de aviso. → FID-6
  - *Fixture cabe em 1 página; multi-página/divisão funciona por construção (counter(pages) +
    detecção), demonstrável com conteúdo maior.*

---

## Definition of Done por milestone
- **M1:** shell 3 zonas renderiza; árvore projetada correta p/ Q-012345; bloqueio respeita I1–I3;
  4 estados visuais distinguíveis; A4 com banda corrente + quebra soft; tokens `<span>` sanitizados;
  UI persiste; `projectTree` com testes verdes; zero rede (NFR-1).
- **M2:** busca filtra sem mutar; indicadores completos; drag-and-drop atualiza `order` e persiste.
- **M3:** ≥2 tipos de bloco editáveis WYSIWYG na página; token atômico indivisível; `modified` correto;
  5 ações funcionam; conteúdo persiste com `schemaVersion`; Comparar (trabalho×default) e snapshot ok.
- **M4:** Paged.js gera paginação exata + marca d'água + print; bloco transbordante é sinalizado.

## Decisões pendentes (não resolvidas)
- **DP-1:** Comparar **entre revisões** (Q3) — fora desta entrega; reavaliar quando snapshots forem usados.
- **DP-2:** Conteúdo **EN real** (Q4) — placeholder agora; definir fixtures EN na fase de i18n.
- **DP-3:** Regras de rascunho (mudança de planta/tipo/split → ignorar textos modificados) — backend, fora.
- **DP-4:** Engine de carregamento de textos default/opcionais por cotação+key — fora desta entrega.

---

## Verificação
1. **Rastreabilidade:** toda tarefa cita ≥1 ID de requisito; todo requisito "dentro de escopo" é
   coberto por ≥1 tarefa (matriz requisito↔tarefa fechada).
2. **Implementação (sessões M1→M4):** cada milestone validado contra sua DoD; `projectTree` e `diff`
   cobertos por testes unitários; checagem manual no browser (zero rede, persistência, print).
3. **Status:** M1–M4 + D-BENCH concluídos. Escopo D10 entregue. Pendências = decisões fora de
   escopo (DP-1..DP-4) e limites honestos documentados (FID-6 multi-página, R1–R4).

---

## Progresso
- **2026-06-26** — M1 (`c82b5df`) e M2 (`ef997b0`) concluídos e pushed; 46 testes verdes,
  typecheck/build limpos. Repo: github.com/mrcsantos1/quote-studio.
  Benchmark de editores (D-BENCH) registrado como deliverable a preencher no fim do M3.
- **2026-06-26** — M3 fatia B (modelo) concluída: `lib/blockEdits.ts` + actions de store
  (`updateContent`/`reloadItem`/`reloadAll`); 11 testes novos, 57 verdes.
- **2026-06-26** — M3 COMPLETO: editor Tiptap por bloco + token atômico (`b7f63ce`); notas
  excluir/incluir + persistência de conteúdo (`bace7fe`); Comparar (diff) + snapshot (`f31a841`).
  74 testes verdes.
- **2026-06-26** — M4 COMPLETO: Paged.js (paginação, header/footer correntes, "Página X de Y",
  marca d'água, print, sinalização de divisão). 81 testes verdes; verificado no browser.
  Toolchain: pnpm 11 exigiu `pnpm-workspace.yaml` (allowBuilds) p/ os scripts do pagedjs.
  **Restam só o D-BENCH e o fechamento.**
