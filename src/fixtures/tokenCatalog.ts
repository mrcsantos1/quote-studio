import type { TokenDef } from '@/types/contracts';

// Catálogo estático nesta fase (TOK-5). Cobre as 6 fontes integradas.
// Chave de lookup = `${source}:${key}` (ver lib/tokens.ts).
export const tokenCatalog: TokenDef[] = [
  { source: 'QUOTATION', key: 'number', label: 'Número da cotação', sample: 'Q-012345' },
  { source: 'QUOTATION', key: 'revision', label: 'Revisão', sample: '00' },
  { source: 'MAESTRO', key: 'customerName', label: 'Cliente', sample: 'Indústria Metalúrgica Andrade Ltda.' },
  { source: 'MAESTRO', key: 'plant', label: 'Planta de origem', sample: 'Jaraguá do Sul' },
  { source: 'ORCHESTRA', key: 'salesEngineer', label: 'Engenheiro de vendas', sample: 'Eng. Marina Coelho' },
  { source: 'SAP', key: 'netPrice', label: 'Preço líquido', sample: 'R$ 482.350,00' },
  { source: 'SAP', key: 'currency', label: 'Moeda', sample: 'BRL' },
  { source: 'SAP', key: 'incoterm', label: 'Incoterm', sample: 'CIP (Incoterms 2020)' },
  { source: 'Q4P', key: 'deliveryWeeks', label: 'Prazo de entrega', sample: '16 semanas' },
  { source: 'ASSOM', key: 'efficiencyClass', label: 'Classe de rendimento', sample: 'IE4 Premium' },
];
