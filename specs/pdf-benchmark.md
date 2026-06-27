# Benchmark de geração de PDF — QuoteStudio

> **STATUS: CONCLUÍDO.** Justifica a escolha do **Gotenberg** para a geração de PDF de produção,
> com evidência da integração real. Estrutura espelha o `editor-benchmark.md`. Decisão registrada
> em `design.md` → ADR-8.

## Objetivo

O QuoteStudio é "o editor é a visualização": o que o usuário edita (HTML/CSS no browser) **é** o
documento. Logo o PDF de produção precisa **bater pixel a pixel** com a prévia. A pergunta real não
é "qual lib de PDF", e sim **"um motor de layout ou dois?"** — qualquer solução não-Chromium
introduz um segundo motor e o preview e o PDF podem divergir, quebrando a premissa do produto.

Requisitos peculiares:
- **Fidelidade**: mesmo motor do preview (Chromium) renderizando o mesmo HTML/CSS.
- **Texto vetorial selecionável/pesquisável** (não rasterizado).
- **Paged media**: cabeçalho/rodapé correntes, "Página X de Y", margens, capa em página própria.
- **Self-host, OSS, sem custo de licença** (protótipo/empresa).
- **Operação real**: isolar/escalar o Chrome, concorrência, sandbox — sem virar um problema de ops.

## Critérios e pesos

| # | Critério | Peso |
|---|----------|:----:|
| C1 | Fidelidade — mesmo motor do preview (Chromium) | 3 |
| C2 | Texto vetorial selecionável / PDF pesquisável | 3 |
| C3 | Paged media (header/rodapé correntes, "Página X de Y", margens) | 2 |
| C4 | Self-host + custo/licença (OSS) | 3 |
| C5 | Operação/escala (serviço stateless, isola/escala Chrome) | 2 |
| C6 | Suporte CSS amplo (flex/grid/web fonts/SVG) | 2 |
| C7 | Esforço de integração | 1 |
| C8 | Segurança/isolamento (sandbox) | 2 |

## Scoring (0–3; 3 = melhor)

| Critério (peso) | Gotenberg | Puppeteer/Playwright (self) | jsReport | WeasyPrint | Prince/DocRaptor | pdfmake/react-pdf |
|-----------------|:---------:|:---------------------------:|:--------:|:----------:|:----------------:|:-----------------:|
| C1 Fidelidade/Chromium (3) | 3 | 3 | 3 | 1 | 1 | 0 |
| C2 Texto selecionável (3)  | 3 | 3 | 3 | 3 | 3 | 3 |
| C3 Paged media (2)         | 2 | 2 | 3 | 3 | 3 | 1 |
| C4 Self-host/OSS (3)       | 3 | 3 | 2 | 3 | 0 | 3 |
| C5 Operação/escala (2)     | 3 | 1 | 2 | 2 | 3 | 3 |
| C6 Suporte CSS (2)         | 3 | 3 | 3 | 2 | 2 | 0 |
| C7 Integração (1)          | 3 | 2 | 2 | 2 | 2 | 1 |
| C8 Segurança/sandbox (2)   | 3 | 2 | 2 | 2 | 3 | 3 |
| **Total ponderado /54**    | **52** | 45 | 46 | 41 | 36 | 33 |

## Veredito

**Gotenberg** vence com folga. É **Chromium empacotado como microsserviço stateless** (Apache-2): o
mesmo motor do preview (C1), texto vetorial selecionável (C2), suporte CSS pleno do Chrome (C6),
API HTTP simples e operação pronta (C5/C7) — isola e escala o Chrome por você.

1. **Gotenberg × Puppeteer/Playwright (52 × 45).** Mesma fidelidade e mesmo motor — Gotenberg
   **é** Puppeteer productizado. A diferença é **operação (C5)**: com Puppeteer cru você gerencia o
   ciclo do Chrome, concorrência, memória, sandbox e timeouts — exatamente o que mais dói em produção.
   Gotenberg entrega isso pronto atrás de um POST.
2. **Gotenberg × jsReport (52 × 46).** jsReport também é Chromium e tem ótimo paged media (C3), mas é
   uma **plataforma de relatórios** (templating handlebars/jsrender + agendamento + studio). Como o
   QuoteStudio **já é dono do HTML/CSS**, a camada de template é redundante; e o core OSS tem recursos
   enterprise pagos (C4) e é mais pesado de operar (C5). Sobra função.
3. **WeasyPrint (41) e Prince/DocRaptor (36) — perdem em C1.** Renderizam HTML/CSS com **motor
   próprio (não-Chromium)** → divergem do preview do QuoteStudio. Têm paged media excelente (C3) e
   Prince é o topo em tipografia/PDF-A, mas isso não compensa quebrar o "editar = imprimir". Prince
   ainda é **comercial caro** (C4=0).
4. **pdfmake / react-pdf (33) — fora.** Não renderizam HTML/CSS: **re-desenham o layout** num motor
   próprio (C1=0, C6=0). Seriam um segundo documento a manter em paralelo ao editor.

**Conclusão:** trocar o plano original (jsReport) por **Gotenberg**. Mesma fidelidade do editor, PDF
com texto selecionável, OSS self-host, sem a plataforma de relatório sobrando. Em produção, um BFF
encapsula o Gotenberg (auth/rate-limit) no lugar do proxy de dev.

## Evidência prática (da integração)

- `src/preview/buildPdfDocument.ts` — monta o HTML standalone reusando `buildPreviewHtml` +
  `buildPagedStyles({ watermark:false })`: **o PDF é a prévia, sem a marca d'água**.
- **Paged.js dentro do Gotenberg** — o polyfill vai como arquivo irmão no multipart e roda no
  Chromium do Gotenberg; `waitForExpression: window.QS_PAGED_DONE === true` espera a paginação →
  PDF idêntico à prévia (header/rodapé correntes, "Página X de Y", divisão de bloco).
- `src/lib/pdf.ts` — `POST /forms/chromium/convert/html` (multipart) com `preferCssPageSize`.
  Verificado: retorna `application/pdf` (~40 KB, magic `%PDF-`). Sem `transform` no conteúdo
  (watermark off) → **texto selecionável** (resolve a rasterização do `window.print()`).
- Marca d'água **só na prévia/visualização** (PDF-2): `buildPagedStyles` default `watermark:true`;
  o download passa `false`.
