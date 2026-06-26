# QuoteStudio

Reformulação do mecanismo de redação de textos da cotação (empresa de motores elétricos
engenheirados). Princípio: **"o editor é a visualização"** — o usuário edita o conteúdo dentro
do próprio layout A4, sem depender de baixar PDF para verificar o resultado.

Protótipo **somente front-end** (React + Vite + TypeScript), sem backend, dados via *fixtures* e
persistência em localStorage.

## Status

Especificação concluída. **M1 (Esqueleto)** e **M2 (Árvore viva)** implementados e verificados
(46 testes verdes). Próximo: **M3 — Editor por bloco**.

## Especificação

A spec spec-driven está em [`specs/`](./specs/):

- [`requirements.md`](./specs/requirements.md) — visão, escopo e requisitos em formato EARS por capacidade.
- [`design.md`](./specs/design.md) — arquitetura, contratos, máquina de estados do bloqueio, fidelidade/paginação, ADRs e riscos.
- [`tasks.md`](./specs/tasks.md) — plano incremental M1→M4, rastreável aos requisitos, com Definition of Done.

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

## Próximo passo

**M3 — Editor por bloco**: editor rico (Tiptap) na própria página, token como node atômico,
flag `modified`, ações de recarregar/restaurar e persistência de conteúdo.
