# QuoteStudio

Reformulação do mecanismo de redação de textos da cotação (empresa de motores elétricos
engenheirados). Princípio: **"o editor é a visualização"** — o usuário edita o conteúdo dentro
do próprio layout A4, sem depender de baixar PDF para verificar o resultado.

Protótipo **somente front-end** (React + Vite + TypeScript), sem backend, dados via *fixtures* e
persistência em localStorage.

## Status

Fase de **especificação concluída**. Implementação ainda não iniciada (greenfield).

## Especificação

A spec spec-driven está em [`specs/`](./specs/):

- [`requirements.md`](./specs/requirements.md) — visão, escopo e requisitos em formato EARS por capacidade.
- [`design.md`](./specs/design.md) — arquitetura, contratos, máquina de estados do bloqueio, fidelidade/paginação, ADRs e riscos.
- [`tasks.md`](./specs/tasks.md) — plano incremental M1→M4, rastreável aos requisitos, com Definition of Done.

## Stack (decidida — ver `design.md`)

Vite + React + TypeScript · Zustand · dnd-kit · Tiptap/ProseMirror · DOMPurify · Paged.js.
Dependências mínimas, sem framework de UI pesado.

## Próximo passo

Executar **M1 — Esqueleto** (scaffold Vite + esqueleto), reconciliando com a spec.
