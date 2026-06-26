import StarterKit from '@tiptap/starter-kit';
import { createTokenNode } from './tokenNode';
import { tokenCatalog } from '@/fixtures/tokenCatalog';

// Schema do editor = 2º piso de segurança (NFR-3): só os nodes definidos aqui
// podem existir. StarterKit traz parágrafo/heading/listas/marcas/histórico;
// o node atômico `token` cobre TOK-3.
export const editorExtensions = [
  StarterKit.configure({ codeBlock: false, horizontalRule: false }),
  createTokenNode(tokenCatalog),
];
