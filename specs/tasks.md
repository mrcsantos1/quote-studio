# QuoteStudio — Tarefas (M1→M4)

> Greenfield: **nada implementado** ainda. Toda tarefa parte do zero. Cada tarefa referencia os
> IDs de requisito que satisfaz. Tarefas pequenas e testáveis.

## M1 — Esqueleto
- **T1.1** Scaffold Vite+React+TS (espelhar convenções de `configuration-lite-ui`), pnpm. → NFR-1/2
- **T1.2** `types/contracts.ts` (contratos canônicos da seção 2 do design). → (base de tudo)
- **T1.3** Fixtures: `LayoutTemplate "Completo"`, `QuotationDocument Q-012345` (2 splits), `tokenCatalog`. → TREE-1, TOK-5
- **T1.4** `lib/projectTree.ts` puro + testes (ONCE/PER_SPLIT/filtros). → TREE-1/2, PROJ-1/3
- **T1.5** Shell de 3 zonas + árvore projetada com `role=tree` e teclado. → TREE-3/5, VIS-2
- **T1.6** Store Zustand: documento + `EditLock` + UI; máquina de bloqueio (invariantes I1–I3). → LOCK-1..4
- **T1.7** Estados visuais (selecionado/edição/modificado/bloqueado). → VIS-1
- **T1.8** Superfície A4 fiel: `lib/pageFormat.ts` → CSS custom properties; banda corrente; quebra soft. → FID-1..4
- **T1.9** Tokens resolvidos como `<span>` provisório + `lib/sanitize.ts` (DOMPurify). → TOK-1/2/4, NFR-3
- **T1.10** Persistência de UI no localStorage. → PERS-1

## M2 — Árvore viva
- **T2.1** Busca na árvore (filtro de projeção). → TREE-4
- **T2.2** Indicadores de estado completos na árvore (dot modificado, cadeado). → VIS-1
- **T2.3** Reordenação dnd-kit → atualiza `order`; respeita `reorderable` e fronteiras de grupo. → DND-1/2

## M3 — Editor por bloco
- **T3.1** Schema Tiptap: node `block` + node atômico `token` + NodeViews. → EDIT-1, TOK-3
- **T3.2** Toolbar manual; `setEditable` por instância. → EDIT-4, LOCK-2
- **T3.3** Flag `modified` (trabalho≠default) + estados na árvore/bloco. → EDIT-2, VIS-1
- **T3.4** Ações: Recarregar item / Recarregar todos / Restaurar / Excluir nota / Incluir nota. → EDIT-3
- **T3.5** Persistência de conteúdo + `schemaVersion` (invalida fixture velha). → PERS-2/3, EDIT-5
- **T3.6** `lib/diff.ts` "Comparar" trabalho×default + snapshot de revisão. → REV-1/2

## M4 — Prévia/impressão
- **T4.1** Integração Paged.js: paginação real, "Página X de Y", margin boxes, contador. → FID-5
- **T4.2** Marca d'água de preview + `window.print()`. → FID-7
- **T4.3** Sinalização de bloco dividido entre páginas N/N+1. → FID-6

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
3. **Próximo passo:** executar **M1** (scaffold + esqueleto), reconciliando com esta spec.
