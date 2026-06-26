import type { BlockContent, BlockInstance, Lang, QuotationDocument } from '@/types/contracts';

// Conteúdo EN é placeholder nesta fase (Q4): modelado, não redigido.
const EN_PLACEHOLDER: BlockContent = { format: 'html', html: '<p><em>[EN — conteúdo pendente]</em></p>' };

/** Monta os dois idiomas a partir do HTML PT; EN cai no placeholder (Q4). */
function content(pt: string): Record<Lang, BlockContent> {
  return { PT: { format: 'html', html: pt }, EN: EN_PLACEHOLDER };
}

/**
 * Cria uma instância DEFAULT. A cópia de trabalho (contentByLang) nasce idêntica
 * ao baseline (defaultContentByLang) — daí `modified=false`. Os objetos são
 * distintos para que editar a cópia não mute o baseline.
 */
function instance(
  instanceId: string,
  slotId: string,
  order: number,
  pt: string,
  splitId?: string,
): BlockInstance {
  return {
    instanceId,
    slotId,
    ...(splitId ? { splitId } : {}),
    defaultContentByLang: content(pt),
    contentByLang: content(pt),
    modified: false,
    origin: 'DEFAULT',
    order,
  };
}

const splits = [
  { id: 'split-w22', label: 'Motor W22 IR3 — 75 kW (Linha A)' },
  { id: 'split-w40', label: 'Motor W40 — 250 kW (Linha B)' },
];

// --- Blocos ONCE iniciais ---
const onceTop: BlockInstance[] = [
  instance(
    'cover',
    'cover',
    0,
    `<h1>Proposta Técnico-Comercial</h1>
<p class="subtitle">{{token:MAESTRO:customerName}}</p>
<p class="ref">Cotação {{token:QUOTATION:number}} — Rev. {{token:QUOTATION:revision}}</p>`,
  ),
  instance(
    'header',
    'header',
    1,
    `<span>WEG Equipamentos Elétricos · {{token:MAESTRO:plant}}</span>
<span>{{token:QUOTATION:number}}</span>`,
  ),
  instance(
    'intro',
    'intro',
    2,
    `<p>Prezados,</p>
<p>Em atenção à sua solicitação, a {{token:ORCHESTRA:salesEngineer}} apresenta a proposta
para os acionamentos abaixo, em conformidade com as normas aplicáveis.</p>`,
  ),
];

// --- Blocos PER_SPLIT (um conjunto por split) ---
const perSplit: BlockInstance[] = splits.flatMap((s) => [
  instance(
    `product--${s.id}`,
    'product',
    0,
    `<table class="product">
<tr><th>Item</th><td>${s.label}</td></tr>
<tr><th>Rendimento</th><td>{{token:ASSOM:efficiencyClass}}</td></tr>
<tr><th>Origem</th><td>{{token:MAESTRO:plant}}</td></tr>
</table>`,
    s.id,
  ),
  instance(
    `technical--${s.id}`,
    'technical',
    1,
    `<p>Grau de proteção IP55, isolação classe F com elevação classe B.
Tensão conforme folha de dados. Ensaios de rotina inclusos.</p>`,
    s.id,
  ),
  instance(
    `commercial--${s.id}`,
    'commercial',
    2,
    `<p>Preço líquido: {{token:SAP:netPrice}} ({{token:SAP:currency}}),
{{token:SAP:incoterm}}. Prazo de entrega: {{token:Q4P:deliveryWeeks}} após
aprovação técnica e comercial.</p>`,
    s.id,
  ),
]);

// --- Blocos ONCE finais ---
const onceBottom: BlockInstance[] = [
  instance(
    'closing',
    'closing',
    0,
    `<p>Permanecemos à disposição para esclarecimentos.</p>
<p>Atenciosamente,<br />{{token:ORCHESTRA:salesEngineer}}</p>`,
  ),
  instance(
    'footer',
    'footer',
    1,
    `<span>{{token:QUOTATION:number}}</span>
<span>Documento gerado pelo QuoteStudio</span>`,
  ),
];

export const quotationQ012345: QuotationDocument = {
  quotationId: 'Q-012345',
  customer: 'Indústria Metalúrgica Andrade Ltda.',
  status: 'DRAFT',
  templateId: 'completo',
  revision: 0,
  activeLang: 'PT',
  activeLayout: 'completo',
  visibleSplit: 'ALL',
  splits,
  blocks: [...onceTop, ...perSplit, ...onceBottom],
};
