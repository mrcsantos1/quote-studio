import { useMemo, useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import {
  DndContext, PointerSensor, closestCenter, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { projectTree, type TreeNode } from '@/lib/projectTree';
import { filterTreeGroups } from '@/lib/filterTree';
import { useQuoteStore } from '@/store/quoteStore';
import { layoutCompleto } from '@/fixtures/layoutCompleto';

interface ItemFlags {
  selected: boolean;
  editing: boolean;
  locked: boolean;
  modified: boolean;
  tabIndex: number;
}

interface ItemHandlers {
  flags: (n: TreeNode) => ItemFlags;
  register: (id: string, el: HTMLDivElement | null) => void;
  onSelect: (id: string) => void;
  onKeyDown: (e: KeyboardEvent, id: string) => void;
}

function TreeItemView(props: {
  node: TreeNode;
  flags: ItemFlags;
  refCb: (el: HTMLDivElement | null) => void;
  style?: CSSProperties;
  grip?: ReactNode;
  onSelect: (id: string) => void;
  onKeyDown: (e: KeyboardEvent, id: string) => void;
}) {
  const { node, flags, refCb, style, grip, onSelect, onKeyDown } = props;
  return (
    <div
      ref={refCb}
      role="treeitem"
      aria-selected={flags.selected}
      tabIndex={flags.tabIndex}
      className="qs-treeitem"
      data-selected={flags.selected || undefined}
      data-editing={flags.editing || undefined}
      data-locked={flags.locked || undefined}
      data-modified={flags.modified || undefined}
      style={style}
      onClick={() => onSelect(node.instanceId)}
      onKeyDown={(e) => onKeyDown(e, node.instanceId)}
      title={node.label}
    >
      {grip ?? <span className="qs-grip qs-grip--disabled" aria-hidden />}
      <span className="qs-treeitem__label">{node.label}</span>
      {flags.modified && <span className="qs-dot" aria-label="modificado" title="Texto modificado" />}
      {flags.locked && <span className="qs-lock" aria-hidden>🔒</span>}
      {!node.editable && <span className="qs-ro" title="Somente leitura">RO</span>}
    </div>
  );
}

function SortableTreeItem({ node, h }: { node: TreeNode; h: ItemHandlers }) {
  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.instanceId,
  });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };
  return (
    <TreeItemView
      node={node}
      flags={h.flags(node)}
      refCb={(el) => { setNodeRef(el); h.register(node.instanceId, el); }}
      style={style}
      grip={
        <button
          type="button"
          className="qs-grip"
          aria-label={`Reordenar ${node.label}`}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          {...listeners}
        >
          ⠿
        </button>
      }
      onSelect={h.onSelect}
      onKeyDown={h.onKeyDown}
    />
  );
}

function PlainTreeItem({ node, h }: { node: TreeNode; h: ItemHandlers }) {
  return (
    <TreeItemView
      node={node}
      flags={h.flags(node)}
      refCb={(el) => h.register(node.instanceId, el)}
      onSelect={h.onSelect}
      onKeyDown={h.onKeyDown}
    />
  );
}

export function Tree() {
  const doc = useQuoteStore((s) => s.doc);
  const lock = useQuoteStore((s) => s.lock);
  const selectedId = useQuoteStore((s) => s.ui.selectedInstanceId);
  const treeQuery = useQuoteStore((s) => s.ui.treeQuery);
  const select = useQuoteStore((s) => s.select);
  const setTreeQuery = useQuoteStore((s) => s.setTreeQuery);
  const reorder = useQuoteStore((s) => s.reorder);

  const groups = useMemo(
    () => filterTreeGroups(projectTree(doc, layoutCompleto), treeQuery),
    [doc, treeQuery],
  );
  const modifiedById = useMemo(
    () => new Map(doc.blocks.map((b) => [b.instanceId, b.modified])),
    [doc.blocks],
  );
  const flatIds = useMemo(() => groups.flatMap((g) => g.nodes.map((n) => n.instanceId)), [groups]);

  const itemRefs = useRef(new Map<string, HTMLDivElement>());
  const focusId = (id: string | undefined) => id && itemRefs.current.get(id)?.focus();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) reorder(String(active.id), String(over.id));
  };

  const h: ItemHandlers = {
    register: (id, el) => { if (el) itemRefs.current.set(id, el); else itemRefs.current.delete(id); },
    onSelect: select,
    onKeyDown: (e, id) => {
      const i = flatIds.indexOf(id);
      if (e.key === 'ArrowDown') { e.preventDefault(); focusId(flatIds[Math.min(i + 1, flatIds.length - 1)]); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); focusId(flatIds[Math.max(i - 1, 0)]); }
      else if (e.key === 'Home') { e.preventDefault(); focusId(flatIds[0]); }
      else if (e.key === 'End') { e.preventDefault(); focusId(flatIds[flatIds.length - 1]); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(id); }
    },
    flags: (n) => ({
      selected: n.instanceId === selectedId,
      editing: lock.mode === 'EDITING' && lock.instanceId === n.instanceId,
      locked: lock.mode === 'EDITING' && lock.instanceId !== n.instanceId,
      modified: modifiedById.get(n.instanceId) ?? false,
      tabIndex:
        n.instanceId === selectedId || (selectedId === null && flatIds[0] === n.instanceId) ? 0 : -1,
    }),
  };

  const renderNode = (node: TreeNode) =>
    node.reorderable
      ? <SortableTreeItem key={node.instanceId} node={node} h={h} />
      : <PlainTreeItem key={node.instanceId} node={node} h={h} />;

  return (
    <nav className="qs-tree" aria-label="Estrutura do documento">
      <input
        type="search"
        className="qs-tree__search"
        placeholder="Buscar bloco…"
        aria-label="Buscar bloco"
        value={treeQuery}
        onChange={(e) => setTreeQuery(e.target.value)}
      />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <div role="tree" aria-label="Blocos da cotação">
          {groups.map((g) => {
            if (g.nodes.length === 0) return null;
            const sortableIds = g.nodes.filter((n) => n.reorderable).map((n) => n.instanceId);
            const isSplit = g.kind === 'SPLIT';
            return (
              <div
                key={isSplit ? g.splitId : g.kind}
                role="group"
                aria-label={g.label}
                className={`qs-treegroup${isSplit ? '' : ' qs-treegroup--once'}`}
              >
                {isSplit && <div className="qs-treegroup__header" aria-hidden>{g.label}</div>}
                <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                  {g.nodes.map(renderNode)}
                </SortableContext>
              </div>
            );
          })}
        </div>
      </DndContext>
    </nav>
  );
}
