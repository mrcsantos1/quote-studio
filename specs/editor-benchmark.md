# Benchmark de editores de texto rico — QuoteStudio

> **STATUS: PENDENTE (D-BENCH).** Preencher ao final do M3, após a integração real do Tiptap dar
> evidência prática. Este arquivo já fixa o framework, os candidatos e as dimensões; falta o
> scoring hands-on e o veredito final. Contexto resumido em `design.md` → ADR-1.

## Objetivo

Justificar **explicitamente**, com critérios e comparação, por que o editor escolhido é a melhor
opção para o QuoteStudio — e não uma preferência arbitrária. A aplicação tem requisitos peculiares
que estreitam muito o campo:

- **"O editor é a visualização"**: a área editável **é** o bloco dentro da página A4 (mesmo DOM/CSS
  da impressão). Exige render headless com controle total do DOM (NodeView), não um editor "caixa".
- **Token como node atômico serializável** (TOK-3): chip indivisível que sobrevive a copy/paste e
  serialização, nunca texto solto/regex.
- **Snapshot e diff** (REV-1/2): precisa de um **modelo de documento estruturado** (não HTML cru)
  para comparar trabalho×default de forma confiável.
- **Segundo piso de segurança** (NFR-3): schema fechado do editor como barreira estrutural além do
  DOMPurify.
- **Dependências mínimas / sem UI framework pesado** (NFR-2): toolbar construída à mão.
- **Self-host, sem custo de licença** num protótipo corporativo.

## Critérios (peso por relevância para esta app)

| # | Critério | Peso | Por quê (requisito) |
|---|----------|------|---------------------|
| C1 | Headless + NodeView (editor = bloco A4) | ★★★ | EDIT-1, princípio central |
| C2 | Node atômico de token serializável | ★★★ | TOK-3 |
| C3 | Modelo de documento estruturado (habilita snapshot/diff) | ★★★ | REV-1/2 |
| C4 | Licença/custo (MIT, self-host) | ★★★ | protótipo corporativo |
| C5 | Schema fechado (2º piso de segurança) | ★★ | NFR-3 |
| C6 | Bundle/deps enxutos | ★★ | NFR-2 |
| C7 | React 19 + manutenção/ecossistema | ★★ | longevidade |
| C8 | Esforço de toolbar/UX manual | ★ | EDIT-4 (custo aceito) |

## Candidatos a avaliar

- **Tiptap** (sobre ProseMirror) — *escolha provisória (ADR-1)*.
- **Lexical** (Meta) — *plano B (ADR-1)*.
- **CKEditor 5** — modelo próprio, licença comercial p/ alguns recursos.
- **Froala** — comercial/licenciado (citado explicitamente pelo usuário).
- **Slate** — React-first, modelo JSON, porém mais "faça você mesmo".
- **Quill / TinyMCE** — referência de mercado "caixa", menos headless.

## A preencher (hands-on, fim do M3)

1. Tabela de scoring C1–C8 por candidato (0–3) com nota ponderada.
2. Evidência prática do Tiptap no QuoteStudio: NodeView do bloco, node atômico `token`,
   serialização ida-e-volta, tamanho real adicionado ao bundle.
3. Destaque do contraste com **Froala** (licença/custo, modelo HTML vs estruturado, headless).
4. **Veredito**: por que Tiptap vence para *esta* aplicação (ou, se a evidência contrariar,
   registrar honestamente e revisar ADR-1).

## Notas iniciais (pré-scoring, sujeitas a revisão)

- **Tiptap/ProseMirror**: headless real (NodeView casa com "editor=bloco"); node atômico nativo
  (`atom: true`); documento como árvore ProseMirror (JSON) → snapshot/diff sem recurso pago; schema
  fechado = 2º piso; MIT self-hostável. Custo: toolbar manual (aceito em EDIT-4). A **Tiptap Platform**
  (versionação gerenciada/colaboração paga) **não** é usada.
- **Froala**: editor "caixa" com toolbar pronta, mas **licença comercial**, modelo centrado em HTML
  (diff/atomicidade mais frágeis) e menos aderente ao "editor = visualização". Tende a perder em
  C1/C2/C3/C4.
