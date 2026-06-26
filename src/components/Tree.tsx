import { useMemo, useRef, type KeyboardEvent } from 'react';
import { projectTree, type TreeNode } from '@/lib/projectTree';
import { useQuoteStore } from '@/store/quoteStore';
import { layoutCompleto } from '@/fixtures/layoutCompleto';

export function Tree() {
  const doc = useQuoteStore((s) => s.doc);
  const lock = useQuoteStore((s) => s.lock);
  const selectedId = useQuoteStore((s) => s.ui.selectedInstanceId);
  const select = useQuoteStore((s) => s.select);

  const groups = useMemo(() => projectTree(doc, layoutCompleto), [doc]);
  const modifiedById = useMemo(
    () => new Map(doc.blocks.map((b) => [b.instanceId, b.modified])),
    [doc.blocks],
  );

  // Lista plana na ordem visível — base da navegação por setas.
  const flatIds = useMemo(() => groups.flatMap((g) => g.nodes.map((n) => n.instanceId)), [groups]);
  const itemRefs = useRef(new Map<string, HTMLDivElement>());

  const focusId = (id: string) => itemRefs.current.get(id)?.focus();

  const onKeyDown = (e: KeyboardEvent, id: string) => {
    const i = flatIds.indexOf(id);
    if (e.key === 'ArrowDown') { e.preventDefault(); focusId(flatIds[Math.min(i + 1, flatIds.length - 1)]); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusId(flatIds[Math.max(i - 1, 0)]); }
    else if (e.key === 'Home') { e.preventDefault(); focusId(flatIds[0]); }
    else if (e.key === 'End') { e.preventDefault(); focusId(flatIds[flatIds.length - 1]); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(id); }
  };

  const renderItem = (node: TreeNode) => {
    const isSelected = node.instanceId === selectedId;
    const isEditing = lock.mode === 'EDITING' && lock.instanceId === node.instanceId;
    const isLocked = lock.mode === 'EDITING' && lock.instanceId !== node.instanceId;
    const isModified = modifiedById.get(node.instanceId) ?? false;

    return (
      <div
        key={node.instanceId}
        ref={(el) => { if (el) itemRefs.current.set(node.instanceId, el); else itemRefs.current.delete(node.instanceId); }}
        role="treeitem"
        aria-selected={isSelected}
        tabIndex={isSelected || (selectedId === null && flatIds[0] === node.instanceId) ? 0 : -1}
        className="qs-treeitem"
        data-selected={isSelected || undefined}
        data-editing={isEditing || undefined}
        data-locked={isLocked || undefined}
        data-modified={isModified || undefined}
        onClick={() => select(node.instanceId)}
        onKeyDown={(e) => onKeyDown(e, node.instanceId)}
        title={node.label}
      >
        <span className="qs-treeitem__label">{node.label}</span>
        {isModified && <span className="qs-dot" aria-label="modificado" title="Texto modificado" />}
        {isLocked && <span className="qs-lock" aria-hidden>🔒</span>}
        {!node.editable && <span className="qs-ro" title="Somente leitura">RO</span>}
      </div>
    );
  };

  return (
    <nav className="qs-tree" aria-label="Estrutura do documento">
      <div role="tree" aria-label="Blocos da cotação">
        {groups.map((g) => {
          if (g.nodes.length === 0) return null;
          if (g.kind === 'SPLIT') {
            return (
              <div key={g.splitId} role="group" aria-label={g.label} className="qs-treegroup">
                <div className="qs-treegroup__header" aria-hidden>{g.label}</div>
                {g.nodes.map(renderItem)}
              </div>
            );
          }
          return (
            <div key={g.kind} role="group" aria-label={g.label} className="qs-treegroup qs-treegroup--once">
              {g.nodes.map(renderItem)}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
