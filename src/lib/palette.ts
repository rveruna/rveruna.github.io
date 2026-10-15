export interface Command {
  id: string;
  label: string;
  hint?: string;
  keywords?: string;
  run: () => void;
}

/** 0 means no match. Substring beats subsequence; an earlier match, and a word-start match, score higher. */
export function score(query: string, text: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  const t = text.toLowerCase();
  const at = t.indexOf(q);
  if (at >= 0) return 1000 - at + (at === 0 || t[at - 1] === ' ' ? 200 : 0);
  let ti = 0;
  for (const ch of q) {
    ti = t.indexOf(ch, ti);
    if (ti < 0) return 0;
    ti++;
  }
  return 100 - Math.min(ti, 99);
}

/**
 * Keywords may match as whole substrings, but fuzzy (skip-letter) matching only looks at the visible label,
 * otherwise "pdf" would match "projects demos portfolio" by hopping across hidden keywords.
 */
function commandScore(query: string, c: Command): number {
  const label = score(query, c.label);
  if (label > 0) return label;
  const q = query.trim().toLowerCase();
  return c.keywords?.toLowerCase().includes(q) ? 50 : 0;
}

export function filterCommands(query: string, commands: Command[]): Command[] {
  return commands
    .map((c) => ({ c, s: commandScore(query, c) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.c);
}
