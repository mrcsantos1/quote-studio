import DOMPurify from 'dompurify';

// Piso 1 de segurança de HTML (NFR-3): allowlist fechada de tags e atributos.
// Tudo fora da lista é removido (falha fechada). O piso 2 (schema do editor
// Tiptap) entra no M3. `data-token` preserva o chip provisório (TOK-4).
const ALLOWED_TAGS = [
  'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's',
  'ul', 'ol', 'li', 'blockquote',
  'h1', 'h2', 'h3', 'h4',
  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'colgroup', 'col',
  'img', 'figure', 'figcaption',
  'span', 'a',
];

// `src` cobre imagens (https/data:image — DOMPurify bloqueia javascript:); sem `style`
// inline (tabelas configuradas sem resize) para manter a allowlist fechada (NFR-3).
const ALLOWED_ATTR = [
  'class', 'title', 'href', 'target', 'rel', 'data-token',
  'src', 'alt', 'width', 'height', 'colspan', 'rowspan',
];

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}
