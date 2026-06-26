import type { BlockInstance, Lang, TokenDef } from '@/types/contracts';
import { expandTokens } from './tokens';
import { sanitizeHtml } from './sanitize';

/**
 * Produz o HTML pronto para exibição de um bloco no idioma ativo:
 * expande os tokens em chips provisórios (TOK-4) e então sanitiza (NFR-3).
 * A ordem importa — sanitizar por último garante que nem o conteúdo do bloco
 * nem os chips gerados escapem da allowlist.
 */
export function renderBlockHtml(instance: BlockInstance, lang: Lang, catalog: TokenDef[]): string {
  const raw = instance.contentByLang[lang]?.html ?? '';
  return sanitizeHtml(expandTokens(raw, catalog));
}
