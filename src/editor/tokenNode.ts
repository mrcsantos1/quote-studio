import { Node, mergeAttributes } from '@tiptap/core';
import type { TokenDef } from '@/types/contracts';

/**
 * Node atômico `token` (TOK-3): chip indivisível e serializável. `atom:true`
 * garante que backspace remove o chip inteiro e que copy/paste preserva o node.
 * Parse de `span[data-token]`; render mostra o `sample` do catálogo e revela
 * `SOURCE:key` no title (TOK-2). O catálogo é injetado na criação.
 */
export function createTokenNode(catalog: TokenDef[]) {
  const byKey = new Map(catalog.map((t) => [`${t.source}:${t.key}`, t]));

  return Node.create({
    name: 'token',
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,

    addAttributes() {
      return {
        token: {
          default: null,
          parseHTML: (el) => el.getAttribute('data-token'),
          renderHTML: (attrs) => (attrs.token ? { 'data-token': attrs.token } : {}),
        },
      };
    },

    parseHTML() {
      return [{ tag: 'span[data-token]' }];
    },

    renderHTML({ node, HTMLAttributes }) {
      const lookup = node.attrs.token as string | null;
      const def = lookup ? byKey.get(lookup) : undefined;
      const cls = def ? 'qs-token' : 'qs-token qs-token--unknown';
      const text = def ? def.sample : `⟨${lookup ?? '?'}⟩`;
      return ['span', mergeAttributes(HTMLAttributes, { class: cls, title: lookup ?? '' }), text];
    },
  });
}
