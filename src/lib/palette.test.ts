import { filterCommands, score, type Command } from './palette';

const cmd = (label: string, keywords?: string): Command => ({ id: label, label, keywords, run: () => {} });
const all = [
  cmd('Go to projects'),
  cmd('Open LinkedIn'),
  cmd('Print CV', 'pdf download save'),
  cmd('Open GitHub'),
];

describe('score', () => {
  it('matches everything on an empty query', () => {
    expect(score('', 'anything')).toBeGreaterThan(0);
  });
  it('ranks a word-start substring above a mid-word one', () => {
    expect(score('link', 'Open LinkedIn')).toBeGreaterThan(score('ked', 'Open LinkedIn'));
  });
  it('falls back to subsequence matching', () => {
    expect(score('gtp', 'Go to projects')).toBeGreaterThan(0);
  });
  it('returns 0 for no match', () => {
    expect(score('zzz', 'Open GitHub')).toBe(0);
  });
});

describe('filterCommands', () => {
  it('finds a command by its keywords, not just its label', () => {
    expect(filterCommands('pdf', all).map((c) => c.label)).toEqual(['Print CV']);
  });
  it('does not fuzzy-match across hidden keywords', () => {
    const cmds = [cmd('Go to projects', 'demos work portfolio'), cmd('Print CV', 'pdf')];
    expect(filterCommands('pdf', cmds).map((c) => c.label)).toEqual(['Print CV']);
  });
  it('puts the best match first', () => {
    expect(filterCommands('open', all)[0].label.startsWith('Open')).toBe(true);
  });
  it('returns all commands for an empty query', () => {
    expect(filterCommands('', all)).toHaveLength(4);
  });
});
