import type { BlockContent, BlockInstance, Lang } from '@/types/contracts';

const LANGS: Lang[] = ['PT', 'EN'];

const cloneContent = (c: BlockContent): BlockContent => ({ ...c });

/** EDIT-2: a instância diverge do baseline em algum idioma? */
export function isModified(instance: BlockInstance): boolean {
  return LANGS.some(
    (lang) => instance.contentByLang[lang]?.html !== instance.defaultContentByLang[lang]?.html,
  );
}

/**
 * EDIT-2: devolve nova instância com o conteúdo do idioma atualizado e o flag
 * `modified` recomputado. Pura — não toca a entrada nem o baseline.
 */
export function withContent(instance: BlockInstance, lang: Lang, html: string): BlockInstance {
  const contentByLang = {
    ...instance.contentByLang,
    [lang]: { format: 'html' as const, html },
  };
  return { ...instance, contentByLang, modified: isModified({ ...instance, contentByLang }) };
}

/**
 * EDIT-3 (Recarregar item / Restaurar): cópia de trabalho ← baseline, `modified=false`.
 * O conteúdo restaurado é clonado para não compartilhar referência com o baseline
 * (editar depois não deve mutar o default).
 */
export function restored(instance: BlockInstance): BlockInstance {
  const contentByLang = {
    PT: cloneContent(instance.defaultContentByLang.PT),
    EN: cloneContent(instance.defaultContentByLang.EN),
  };
  return { ...instance, contentByLang, modified: false };
}
