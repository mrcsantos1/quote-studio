import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import { editorExtensions } from '@/editor/extensions';
import { markersToSpans, spansToMarkers } from '@/lib/tokens';
import { sanitizeHtml } from '@/lib/sanitize';
import { useQuoteStore } from '@/store/quoteStore';
import type { BlockInstance, Lang } from '@/types/contracts';

function Toolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      strike: e.isActive('strike'),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  // mousedown.preventDefault mantém a seleção/foco no editor ao clicar no botão.
  const Btn = (p: { on?: boolean; disabled?: boolean; run: () => void; label: string; aria: string }) => (
    <button
      type="button"
      className="qs-tbtn"
      aria-label={p.aria}
      aria-pressed={p.on ?? undefined}
      data-on={p.on || undefined}
      disabled={p.disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={p.run}
    >
      {p.label}
    </button>
  );

  return (
    <div className="qs-toolbar" role="toolbar" aria-label="Formatação">
      <Btn on={state.bold} aria="Negrito" label="B" run={() => editor.chain().focus().toggleBold().run()} />
      <Btn on={state.italic} aria="Itálico" label="I" run={() => editor.chain().focus().toggleItalic().run()} />
      <Btn on={state.strike} aria="Tachado" label="S" run={() => editor.chain().focus().toggleStrike().run()} />
      <span className="qs-toolbar__sep" />
      <Btn on={state.bullet} aria="Lista" label="• —" run={() => editor.chain().focus().toggleBulletList().run()} />
      <Btn on={state.ordered} aria="Lista numerada" label="1." run={() => editor.chain().focus().toggleOrderedList().run()} />
      <span className="qs-toolbar__sep" />
      <Btn disabled={!state.canUndo} aria="Desfazer" label="↶" run={() => editor.chain().focus().undo().run()} />
      <Btn disabled={!state.canRedo} aria="Refazer" label="↷" run={() => editor.chain().focus().redo().run()} />
    </div>
  );
}

export function BlockEditor({ instance, lang }: { instance: BlockInstance; lang: Lang }) {
  const updateContent = useQuoteStore((s) => s.updateContent);

  const editor = useEditor(
    {
      extensions: editorExtensions,
      content: markersToSpans(instance.contentByLang[lang]?.html ?? ''),
      immediatelyRender: false,
      editorProps: { attributes: { class: 'qs-editor', 'aria-label': 'Editor do bloco' } },
      onUpdate: ({ editor: e }) => {
        // Editor → storage: tokens viram marcadores e o HTML é sanitizado (NFR-3).
        updateContent(instance.instanceId, lang, sanitizeHtml(spansToMarkers(e.getHTML())));
      },
    },
    // Recria o editor ao trocar de bloco/idioma (conteúdo inicial muda).
    [instance.instanceId, lang],
  );

  if (!editor) return null;
  return (
    <div className="qs-blockeditor" onClick={(e) => e.stopPropagation()}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
