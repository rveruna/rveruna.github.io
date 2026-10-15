import { projects } from './cv';

describe('projects', () => {
  it('has a unique id for each project, since cards and the command palette are found by it', () => {
    const ids = projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('links every project to its repository on my GitHub', () => {
    for (const p of projects) {
      expect(p.repoUrl).toBe(`https://github.com/rveruna/${p.id}`);
    }
  });

  it('serves every live demo from GitHub Pages over https', () => {
    for (const p of projects.filter((p) => p.demoUrl)) {
      expect(p.demoUrl).toBe(`https://rveruna.github.io/${p.id}/`);
    }
  });

  it('gives each card a different colour from the one before it', () => {
    projects.slice(1).forEach((p, i) => expect(p.color).not.toBe(projects[i].color));
  });
});
