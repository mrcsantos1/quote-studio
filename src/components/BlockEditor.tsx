import { useRef, type ChangeEvent } from 'react';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import { editorExtensions } from '@/editor/extensions';
import { markersToSpans, spansToMarkers } from '@/lib/tokens';
import { sanitizeHtml } from '@/lib/sanitize';
import { useQuoteStore } from '@/store/quoteStore';
import { TokenPicker } from './TokenPicker';
import type { BlockInstance, Lang } from '@/types/contracts';

// mousedown.preventDefault mantém a seleção/foco no editor ao clicar no botão.
function TBtn(p: { on?: boolean; disabled?: boolean; run: () => void; label: string; aria: string }) {
  return (
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
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      strike: e.isActive('strike'),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      quote: e.isActive('blockquote'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  // Upload local → base64 embutido (EDIT-6). Incha o localStorage (R2) — aceito no protótipo.
  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => editor.chain().focus().setImage({ src: String(reader.result) }).run();
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };
  const onImageUrl = () => {
    const url = window.prompt('URL da imagem (https://…):');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="qs-toolbar" role="toolbar" aria-label="Formatação">
      <TBtn on={state.bold} aria="Negrito" label="B" run={() => editor.chain().focus().toggleBold().run()} />
      <TBtn on={state.italic} aria="Itálico" label="I" run={() => editor.chain().focus().toggleItalic().run()} />
      <TBtn on={state.strike} aria="Tachado" label="S" run={() => editor.chain().focus().toggleStrike().run()} />
      <span className="qs-toolbar__sep" />
      <TBtn on={state.bullet} aria="Lista" label="• —" run={() => editor.chain().focus().toggleBulletList().run()} />
      <TBtn on={state.ordered} aria="Lista numerada" label="1." run={() => editor.chain().focus().toggleOrderedList().run()} />
      <TBtn on={state.quote} aria="Quadro" label="❝" run={() => editor.chain().focus().toggleBlockquote().run()} />
      <span className="qs-toolbar__sep" />
      <TBtn aria="Inserir imagem (upload)" label="🖼" run={() => fileRef.current?.click()} />
      <TBtn aria="Inserir imagem por URL" label="🔗" run={onImageUrl} />
      <TBtn aria="Inserir tabela" label="▦" run={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
      <span className="qs-toolbar__sep" />
      <TokenPicker editor={editor} />
      <span className="qs-toolbar__sep" />
      <TBtn disabled={!state.canUndo} aria="Desfazer" label="↶" run={() => editor.chain().focus().undo().run()} />
      <TBtn disabled={!state.canRedo} aria="Refazer" label="↷" run={() => editor.chain().focus().redo().run()} />
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickFile} />
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
