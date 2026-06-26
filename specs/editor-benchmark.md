# Benchmark de editores de texto rico — QuoteStudio

> **STATUS: CONCLUÍDO (D-BENCH).** Preenchido após a integração real do Tiptap no M3, com
> evidência prática. Contexto resumido em `design.md` → ADR-1.

## Objetivo

Justificar **explicitamente**, com critérios e comparação, por que o editor escolhido é a melhor
opção para o QuoteStudio — e não uma preferência arbitrária. A aplicação tem requisitos peculiares
que estreitam muito o campo:

- **"O editor é a visualização"**: a área editável **é** o bloco dentro da página A4 (mesmo DOM/CSS
  da impressão). Exige render headless com controle total do DOM (NodeView), não um editor "caixa".
- **Token como node atômico serializável** (TOK-3): chip indivisível que sobrevive a copy/paste e
  serialização, nunca texto solto/regex.
- **Round-trip de HTML**: o conteúdo é **armazenado como HTML** com marcadores `{{token:S:k}}`
  (fixtures, localStorage). O editor precisa importar/exportar HTML com fidelidade.
- **Snapshot e diff** (REV-1/2): precisa de um **modelo de documento estruturado**.
- **Segundo piso de segurança** (NFR-3): schema fechado do editor além do DOMPurify.
- **Dependências mínimas / sem UI framework pesado** (NFR-2): toolbar à mão.
- **Self-host, sem custo de licença** num protótipo corporativo.

## Critérios e pesos

| # | Critério | Peso | Requisito |
|---|----------|:----:|-----------|
| C1 | Headless + NodeView (editor = bloco A4) | 3 | EDIT-1, princípio central |
| C2 | Node atômico de token serializável | 3 | TOK-3 |
| C3 | Modelo de documento estruturado (snapshot/diff) | 3 | REV-1/2 |
| C4 | Licença/custo (MIT, self-host) | 3 | protótipo corporativo |
| C5 | Schema fechado (2º piso de segurança) | 2 | NFR-3 |
| C6 | Bundle/deps enxutos | 2 | NFR-2 |
| C7 | React 19 + manutenção/ecossistema | 2 | longevidade |
| C8 | Toolbar/UX manual viável | 1 | EDIT-4 (custo aceito) |
| **C9** | **Round-trip de HTML (import/export fiel)** | 3 | storage é HTML + tokens |

> C9 emergiu da implementação: como o storage é HTML e os tokens convertem via `parseHTML`/
> `renderHTML`, a fidelidade HTML↔modelo virou critério de primeira ordem (não aparecia no esqueleto).

## Scoring (0–3; 3 = melhor)

| Critério (peso) | Tiptap | Lexical | CKEditor 5 | Froala | Slate | Quill |
|-----------------|:------:|:-------:|:----------:|:------:|:-----:|:-----:|
| C1 Headless/NodeView (3) | 3 | 3 | 2 | 1 | 3 | 1 |
| C2 Token atômico (3)     | 3 | 3 | 3 | 2 | 2 | 1 |
| C3 Modelo estruturado (3)| 3 | 3 | 3 | 1 | 3 | 1 |
| C4 Licença/custo (3)     | 3 | 3 | 1 | 0 | 3 | 3 |
| C5 Schema fechado (2)    | 3 | 3 | 3 | 1 | 2 | 1 |
| C6 Bundle enxuto (2)     | 2 | 3 | 1 | 2 | 3 | 3 |
| C7 React19/manutenção (2)| 3 | 3 | 2 | 2 | 2 | 2 |
| C8 Toolbar manual (1)    | 1 | 1 | 3 | 3 | 1 | 3 |
| C9 Round-trip HTML (3)   | 3 | 2 | 3 | 3 | 2 | 2 |
| **Total ponderado /66**  | **62** | **61** | 46 | 33 | 53 | 39 |

Cálculo = Σ(score × peso). Máximo = 66.

## Veredito

**Tiptap (sobre ProseMirror) é a melhor opção para o QuoteStudio**, à frente de um Lexical
tecnicamente quase empatado, e bem à frente do resto.

1. **Tiptap × Lexical (62 × 61) — decidido no round-trip de HTML (C9).** Ambos são MIT, headless,
   com modelo estruturado e node atômico. Lexical até leva no bundle (C6). Mas o QuoteStudio
   **armazena HTML** e resolve tokens com `parseHTML`/`renderHTML` — exatamente o que implementamos
   no `editor/tokenNode.ts` (parse de `span[data-token]` → node atômico; render → chip), com a
   conversão `markersToSpans`/`spansToMarkers` **testada em round-trip**. Em Lexical, que é
   JSON-native, a serialização HTML é mais artesanal. Para *esta* app, a ergonomia HTML do
   ProseMirror foi o fator de desempate concreto, não teórico.

2. **CKEditor 5 (46) — cai em licença e "caixa".** Modelo próprio forte e widgets atômicos bons,
   mas licenciamento comercial para vários recursos (com prompt de chave) fere C4, e a arquitetura
   de UI própria afasta do princípio "a área editável É o bloco" (C1) e infla o bundle (C6).

3. **Froala (33) — descartado.** **Licença comercial obrigatória** (C4=0), editor centrado em HTML
   "caixa" (C1 baixo) e modelo que torna diff/atomicidade mais frágeis (C3 baixo). Tem a toolbar
   mais rica pronta (C8), mas isso não compensa os requisitos centrais. É o anti-fit do QuoteStudio.

4. **Slate (53) — viável, porém mais DIY.** Headless e MIT, mas exige construir mais (schema,
   void nodes) e teve histórico de instabilidade de API; risco maior num protótipo que quer avançar.

5. **Quill (39) — fora.** Bom custo/licença, mas centrado em HTML/Delta e pouco headless para o
   nosso "editor = página".

**Conclusão:** a escolha do Tiptap (ADR-1) confirma-se com evidência de implementação. O único
custo real assumido — montar a toolbar à mão (C8) — foi pago e é pequeno (`BlockEditor.tsx`).
A **Tiptap Platform** (colaboração/versionação gerenciada, paga) **não** é usada; ficamos só com
o core MIT self-hostado.

## Evidência prática (do código)

- `src/editor/tokenNode.ts` — node `token` com `atom:true`; `parseHTML`/`renderHTML` fazem o
  round-trip HTML↔node (C2/C9). Backspace remove o chip inteiro; copy/paste preserva (verificado).
- `src/lib/tokens.ts` — `markersToSpans`/`spansToMarkers` com teste de round-trip (C9).
- `src/components/BlockEditor.tsx` — toolbar manual (C8) e `onUpdate` sanitiza antes de persistir.
- `src/editor/extensions.ts` — StarterKit + token = schema fechado (C5 / NFR-3).
- Bundle: Tiptap+pm somou ~50 pacotes ProseMirror (C6=2); aceitável para o ganho.
