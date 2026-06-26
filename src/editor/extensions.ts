import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { createTokenNode } from './tokenNode';
import { tokenCatalog } from '@/fixtures/tokenCatalog';

// Schema do editor = 2º piso de segurança (NFR-3): só os nodes definidos aqui
// podem existir. StarterKit traz parágrafo/heading/listas/marcas/histórico/blockquote
// (o "quadro" é blockquote estilizado); `token` cobre TOK-3; Image/Table cobrem EDIT-6.
// Table sem `resizable` p/ não gerar `style` inline (mantém a allowlist do sanitize enxuta).
export const editorExtensions = [
  StarterKit.configure({ codeBlock: false, horizontalRule: false }),
  Image.configure({ allowBase64: true, inline: false }),
  Table.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,
  createTokenNode(tokenCatalog),
];
