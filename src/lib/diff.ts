export type DiffSegType = 'equal' | 'add' | 'remove';
export interface DiffSeg {
  type: DiffSegType;
  value: string;
}

// Tokeniza em tags (<...>), palavras e espaços — diff em granularidade de palavra
// preservando a estrutura.
function tokenize(html: string): string[] {
  return html.match(/<[^>]+>|[^<>\s]+|\s+/g) ?? [];
}

/**
 * Diff por LCS de `oldHtml` (default) → `newHtml` (trabalho). Devolve segmentos
 * equal/remove/add (REV-2). `remove` = presente no default e ausente no trabalho;
 * `add` = presente no trabalho. Puro, sem dependências.
 */
export function diffHtml(oldHtml: string, newHtml: string): DiffSeg[] {
  const a = tokenize(oldHtml);
  const b = tokenize(newHtml);
  const n = a.length;
  const m = b.length;

  // dp[i][j] = LCS de a[i..] e b[j..]
  const dp = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const raw: DiffSeg[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) raw.push({ type: 'equal', value: a[i++] }), j++;
    else if (dp[i + 1][j] >= dp[i][j + 1]) raw.push({ type: 'remove', value: a[i++] });
    else raw.push({ type: 'add', value: b[j++] });
  }
  while (i < n) raw.push({ type: 'remove', value: a[i++] });
  while (j < m) raw.push({ type: 'add', value: b[j++] });

  // Funde segmentos consecutivos do mesmo tipo (saída mais legível).
  const merged: DiffSeg[] = [];
  for (const seg of raw) {
    const last = merged.at(-1);
    if (last && last.type === seg.type) last.value += seg.value;
    else merged.push({ ...seg });
  }
  return merged;
}
