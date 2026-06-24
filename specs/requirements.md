# QuoteStudio — Requisitos

## Visão
QuoteStudio é a superfície única de redação da cotação onde **editar é visualizar**. Protótipo
somente front-end (React + Vite + TypeScript), dados via fixtures, persistência em localStorage.

## Escopo
**Dentro (D10):** shell de 3 zonas; árvore projetada + bloqueio por bloco; edição WYSIWYG na
página de ≥2 tipos de bloco; tokens como chips atômicos; recarregar item / recarregar todos;
alerta "texto modificado" + restaurar; excluir/incluir nota; superfície A4 fiel + quebra soft;
"Visualizar" com Paged.js + marca d'água + print; filtros Idioma/Layout/Split; reordenação
drag-and-drop; "Comparar" (diff de JSON, trabalho×default) e snapshot de revisão.

**Fora (documentar p/ sequência):** edição do contrato de layout (consumimos `LayoutTemplate`
fixo); engine de carregamento de textos default/opcionais por cotação+key; multi-idioma com
fallback do Commerce; importação de RFQ; integração Q4P em seção própria; download de doc técnica
+ ZIP; assinaturas do Commerce; regras de rascunho (mudança de planta/tipo/split → ignorar textos
modificados, pertence à orquestração de backend); geração via jsReport em produção; comparar
**entre revisões** (Q3).

## Questões em aberto — resolvidas
- **Q1 (HEADER/FOOTER banda corrente):** confirmado (D8 como está).
- **Q2 (PRODUCT read-only estruturado):** confirmado (D8 como está).
- **Q3 (escopo "Comparar"):** **somente trabalho × default** nesta entrega. Comparar entre
  revisões fica fora (snapshot por revisão será guardado, mas o diff inter-revisão é fase futura).
- **Q4 (idioma EN):** **placeholder/fallback** — `contentByLang` modelado, EN só placeholder
  pendente; sem conteúdo EN real editável nas fixtures.

## Convenção EARS
Formato: **"QUANDO `<condição>` O SISTEMA DEVE `<comportamento>`"** (ou ubíquo "O SISTEMA DEVE …").
Cada requisito tem ID e critérios de aceite verificáveis. Milestone-alvo entre colchetes.

### Capacidade: Árvore (TREE) — [M1/M2]
- **TREE-1** O SISTEMA DEVE renderizar a árvore como **projeção** de `QuotationDocument` +
  `LayoutTemplate`: blocos ONCE iniciais no topo, um grupo por split com os blocos PER_SPLIT,
  ONCE finais no fim. *Aceite:* com a fixture Q-012345 (2 splits) a ordem renderizada é
  COVER/HEADER/INTRO → [split A: PRODUCT/TECHNICAL/COMMERCIAL] → [split B: …] → CLOSING/FOOTER.
- **TREE-2** QUANDO `visibleSplit ≠ 'ALL'` O SISTEMA DEVE exibir apenas o grupo do split ativo
  (mais os ONCE). *Aceite:* alternar split esconde/mostra os grupos corretos sem alterar `blocks`.
- **TREE-3** QUANDO o usuário clica num nó O SISTEMA DEVE selecioná-lo e refletir a seleção no
  bloco correspondente da página (scroll/destaque). *Aceite:* clique na árvore ↔ destaque no A4.
- **TREE-4** [M2] QUANDO o usuário digita na busca O SISTEMA DEVE filtrar nós por label/tipo sem
  alterar o documento. *Aceite:* busca "técnic" mantém só nós cujo label casa; limpar restaura.
- **TREE-5** O SISTEMA DEVE expor a árvore com semântica acessível (`role=tree`/`treeitem`,
  `aria-selected`, navegação por setas, foco visível). *Aceite:* navegação 100% por teclado.

### Capacidade: Bloqueio (LOCK) — [M1]
- **LOCK-1** O SISTEMA DEVE manter `EditLock = {mode:'IDLE'} | {mode:'EDITING',instanceId}` como
  estado único de edição.
- **LOCK-2** QUANDO `mode='EDITING'(x)` O SISTEMA DEVE garantir a invariante: **todo bloco ≠ x
  está read-only** (`setEditable(false)`). *Aceite:* em edição, tentar digitar noutro bloco é no-op.
- **LOCK-3** QUANDO o usuário aciona "Editar bloco" num bloco O SISTEMA DEVE transicionar para
  `EDITING(esse)`; QUANDO aciona "Travar" O SISTEMA DEVE voltar a `IDLE`. *Aceite:* botão alterna rótulo.
- **LOCK-4** QUANDO o usuário seleciona outro nó estando em `EDITING(x)` O SISTEMA DEVE **encerrar
  a edição de x (travando-o)** e selecionar o novo, **preservando estado e flag `modified` de x**.
  *Aceite:* edição não perde conteúdo nem flag ao trocar de bloco.

### Capacidade: Editor (EDIT) — [M3]
- **EDIT-1** O SISTEMA DEVE oferecer edição rica WYSIWYG **na própria página A4** em ≥2 tipos de
  bloco (ex.: TECHNICAL_NOTES, COMMERCIAL_NOTES), via NodeView Tiptap (mesmo DOM/CSS da impressão).
- **EDIT-2** QUANDO o conteúdo de trabalho diverge do default O SISTEMA DEVE marcar `modified=true`;
  QUANDO volta a igualar O SISTEMA DEVE marcar `modified=false`. *Aceite:* digitar→modified; restaurar→limpo.
- **EDIT-3** O SISTEMA DEVE prover ações **Recarregar item** (este bloco ← default), **Recarregar
  todos** (todos ← default), **Restaurar** (= recarregar item), **Excluir nota** e **Incluir nota**
  para os tipos PER_SPLIT de notas. *Aceite:* cada ação tem efeito determinístico e reversível por undo de store.
- **EDIT-4** O SISTEMA DEVE construir a toolbar manualmente (negrito/itálico/lista/etc.), sem UI
  framework pesado. *Aceite:* toolbar opera só sobre o bloco em `EDITING`.
- **EDIT-5** O SISTEMA DEVE persistir o conteúdo do editor (ver PERS-2) com `schemaVersion`.

### Capacidade: Tokens (TOK) — [M1 provisório → M3 atômico]
- **TOK-1** O SISTEMA DEVE reconhecer referências `{{token:SOURCE:key}}` com
  `SOURCE ∈ {MAESTRO,ORCHESTRA,SAP,Q4P,ASSOM,QUOTATION}`.
- **TOK-2** O SISTEMA DEVE exibir o **valor resolvido** do token por padrão e a **chave** no
  hover/foco/clique. *Aceite:* chip mostra `sample`; tooltip mostra `SOURCE:key`.
- **TOK-3** [M3] O SISTEMA DEVE tratar o token como **node atômico não-editável** (chip indivisível,
  serializável), nunca texto solto. *Aceite:* backspace remove o chip inteiro; copiar/colar preserva o node.
- **TOK-4** [M1] Enquanto o editor não entra, O SISTEMA DEVE renderizar tokens como `<span>`
  provisório sanitizado (DOMPurify). *Aceite:* markup do token sobrevive ao sanitizador (allowlist).
- **TOK-5** O catálogo de tokens é **estático** nesta fase (`TokenDef[]` com `sample`).

### Capacidade: Fidelidade/Paginação (FID) — [M1 superfície / M4 Paged.js]
- **FID-1** O SISTEMA DEVE derivar a geometria da página de uma **fonte única** (`PageFormat`:
  A4 210×297 mm, margens, fonte base pt) exposta via CSS custom properties a **editor e Paged.js**.
  *Aceite:* mudar uma margem no `PageFormat` reflete simultaneamente na edição e na prévia.
- **FID-2** O SISTEMA DEVE renderizar a coluna editável em **medida física A4**; `zoom` afeta só a
  escala de tela, não o dado. *Aceite:* zoom 150% não muda quebras.
- **FID-3** O SISTEMA DEVE manter **cabeçalho/rodapé como banda corrente** sempre visível ao redor
  da área editável. *Aceite:* HEADER/FOOTER aparecem fixos, não no fluxo do corpo.
- **FID-4** O SISTEMA DEVE exibir **marcador de quebra "soft"** inline (altura acumulada vs. útil),
  atualizado ao editar/rolar. *Aceite:* o marcador indica onde começa a próxima página entre blocos.
- **FID-5** [M4] QUANDO o usuário aciona "Visualizar" O SISTEMA DEVE gerar paginação exata com
  Paged.js ("Página X de Y"), marca d'água e `window.print()` — sobre o **mesmo HTML/CSS** da edição.
- **FID-6** QUANDO um bloco transborda a página O SISTEMA DEVE **sinalizar** ("este bloco será
  dividido entre as páginas N e N+1"), **nunca divergir em silêncio**. *Aceite:* aviso visível;
  limite honesto declarado (soft acerta quebras entre blocos ~95%).
- **FID-7** O SISTEMA DEVE exibir **marca d'água** na prévia. *Aceite:* preview e print mostram a marca.

### Capacidade: Projeção/Filtros (PROJ) — [M1]
- **PROJ-1** O SISTEMA DEVE tratar Idioma/Layout/Split como **filtros de projeção** que nunca
  mutam `QuotationDocument.blocks`. *Aceite:* trocar qualquer filtro não altera o dado persistido.
- **PROJ-2** QUANDO `activeLang` muda O SISTEMA DEVE projetar `contentByLang[lang]`
  (com fallback placeholder p/ EN — Q4). *Aceite:* PT mostra conteúdo; EN mostra placeholder.
- **PROJ-3** QUANDO `activeLayout` muda O SISTEMA DEVE projetar os `slots` do `LayoutTemplate` ativo.

### Capacidade: Reordenação (DND) — [M2]
- **DND-1** QUANDO o usuário arrasta um nó reordenável (dnd-kit) O SISTEMA DEVE atualizar `order`
  da instância e reprojetar a árvore e a página. *Aceite:* nova ordem persiste (PERS-1) e respeita
  fronteiras de grupo (ONCE não migra para dentro de split).
- **DND-2** O SISTEMA DEVE bloquear reordenação de blocos `reorderable=false`. *Aceite:* COVER/HEADER/FOOTER não arrastam.

### Capacidade: Revisões/Comparar (REV) — [M3]
- **REV-1** O SISTEMA DEVE permitir **snapshot de revisão** (clonar o JSON do documento, incrementar `revision`).
- **REV-2** QUANDO o usuário aciona "Comparar" O SISTEMA DEVE exibir **diff trabalho × default**
  (Q3) do conteúdo do bloco. *Aceite:* adições/remoções destacadas; comparar entre revisões fora de escopo.

### Capacidade: Persistência (PERS) — [M1 UI / M3 conteúdo]
- **PERS-1** [M1] O SISTEMA DEVE persistir **estado de UI** (seleção, filtros, zoom, expand) em localStorage.
- **PERS-2** [M3] O SISTEMA DEVE persistir **conteúdo** em localStorage com `schemaVersion`;
  QUANDO `schemaVersion` não casa O SISTEMA DEVE ignorar o estado salvo e recarregar fixture.
  *Aceite:* bump de versão invalida estado velho sem crash.
- **PERS-3** QUANDO a página recarrega O SISTEMA DEVE carregar o **último estado salvo** (sem
  reversão automática ao original; "Restaurar" continua explícito — D7). *Aceite:* reload mantém edições.

### Capacidade: Estados visuais (VIS) — [M1/M2]
- **VIS-1** O SISTEMA DEVE distinguir visualmente: **selecionado** (azul), **em edição** (contorno
  + borda esquerda azul), **modificado** (dot laranja na árvore + borda âmbar + rótulo no bloco),
  **bloqueado** (esmaecido + cadeado). *Aceite:* os 4 estados são distinguíveis e mutuamente coerentes.
- **VIS-2** O SISTEMA DEVE garantir foco de teclado visível e respeitar `prefers-reduced-motion`.

### Não-funcionais (NFR)
- **NFR-1** Somente front-end; **zero** chamadas de rede (tudo fixtures/localStorage). *Aceite:* aba Network vazia em uso normal.
- **NFR-2** Dependências mínimas; sem biblioteca de componentes pesada.
- **NFR-3** Segurança de HTML em **dois pisos**: (1) DOMPurify (allowlist) na colagem/importação;
  (2) schema do editor (só nodes definidos). *Aceite:* `<script>`/`onerror` colado é removido e não persiste.
- **NFR-4** Performance: projeção da árvore e re-render do A4 **não degradam ao digitar**;
  paginação real só sob demanda (não a cada tecla). *Aceite:* digitar não dispara Paged.js.
- **NFR-5** i18n estrutural: `contentByLang` já modelado; ponto de extensão p/ fallback do Commerce existe.
- **NFR-6** Acessibilidade: teclado, foco visível, `aria` na árvore/controles, responsivo até telas estreitas.
