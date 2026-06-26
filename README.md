# QuoteStudio

Reformulação do mecanismo de redação de textos da cotação (empresa de motores elétricos
engenheirados). Princípio: **"o editor é a visualização"** — o usuário edita o conteúdo dentro
do próprio layout A4, sem depender de baixar PDF para verificar o resultado.

Protótipo **somente front-end** (React + Vite + TypeScript), sem backend, dados via *fixtures* e
persistência em localStorage.

## Status

Protótipo **funcional ponta a ponta**: M1 (Esqueleto) · M2 (Árvore viva) · M3 (Editor por bloco)
· M4 (Prévia/impressão) concluídos e verificados (81 testes verdes; typecheck/build limpos).
O benchmark de editores está em [`specs/editor-benchmark.md`](./specs/editor-benchmark.md).

## Especificação

A spec spec-driven está em [`specs/`](./specs/):

- [`requirements.md`](./specs/requirements.md) — visão, escopo e requisitos em formato EARS por capacidade.
- [`design.md`](./specs/design.md) — arquitetura, contratos, máquina de estados do bloqueio, fidelidade/paginação, ADRs e riscos.
- [`tasks.md`](./specs/tasks.md) — plano incremental M1→M4, rastreável aos requisitos, com Definition of Done.
- [`editor-benchmark.md`](./specs/editor-benchmark.md) — comparação Froala × Tiptap × Lexical × CKEditor 5 × Slate × Quill.

## Stack (decidida — ver `design.md`)

Vite + React + TypeScript · Zustand · dnd-kit · Tiptap/ProseMirror · DOMPurify · Paged.js.
Dependências mínimas, sem framework de UI pesado.

## Desenvolvimento

```bash
pnpm install
pnpm dev        # servidor de desenvolvimento
pnpm test       # suíte Vitest
pnpm typecheck  # checagem de tipos
pnpm build      # build de produção
```

## Funcionalidades

- Árvore de estrutura projetada (ONCE/split), busca, reordenação por arrastar, navegação por teclado.
- Edição WYSIWYG na própria página A4 (Tiptap): texto rico, **imagens** (upload/URL), **tabelas**,
  **quadros**; tokens como chips atômicos inseridos por um **picker**; bloqueio por bloco.
- **Blocos customizáveis pelo schema**: remover/re-adicionar qualquer bloco (`removable`) e capa em
  **página inteira** (`fullPage`); editor de **layout/schema em runtime**.
- Recarregar/restaurar, incluir/excluir nota, flag de modificado, comparar trabalho × default, snapshot.
- Prévia fiel com paginação real (Paged.js), "Página X de Y", marca d'água e impressão.
- Tudo front-end: fixtures + localStorage, zero chamadas de rede.
