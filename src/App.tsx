import { useCallback, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { BusRoute } from './components/BusRoute';
import { CommandPalette } from './components/CommandPalette';
import { PhysicsText } from './components/PhysicsText';
import { ProjectDialog } from './components/ProjectDialog';
import { jobs, links, profile, projects, skillGroups } from './data/cv';
import { useReducedMotion } from './hooks/useMediaQuery';
import type { Command } from './lib/palette';

type ViewTransitionDoc = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

const LINKEDIN = links[0].href;
/** The CV is a static file in /public, so the link has to respect the site's base path. */
const CV_URL = `${import.meta.env.BASE_URL}Veronika-Rosicova-CV.pdf`;
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? '⌘' : 'Ctrl';

export default function App() {
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const cardFor = (id: string) => document.querySelector<HTMLElement>(`[data-project-id="${id}"]`);

  /** Runs `update` inside a view transition when the browser has one, otherwise just runs it. */
  const transition = useCallback(
    (update: () => void, after?: () => void) => {
      const doc = document as ViewTransitionDoc;
      if (!doc.startViewTransition || reduced) {
        update();
        after?.();
        return;
      }
      doc.startViewTransition(update).finished.finally(() => after?.());
    },
    [reduced],
  );

  const openProject = useCallback(
    (id: string) => {
      const card = cardFor(id);
      if (card) card.style.viewTransitionName = 'case';
      transition(
        () => {
          if (card) card.style.viewTransitionName = '';
          flushSync(() => setSelected(id));
        },
        () => {
          if (card) card.style.viewTransitionName = '';
        },
      );
    },
    [transition],
  );

  const closeProject = useCallback(() => {
    const id = selected;
    if (!id) return;
    transition(
      () => {
        flushSync(() => setSelected(null));
        const card = cardFor(id);
        if (card) card.style.viewTransitionName = 'case';
        card?.focus();
      },
      () => {
        const card = cardFor(id);
        if (card) card.style.viewTransitionName = '';
      },
    );
  }, [selected, transition]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const goTo = useCallback(
    (id: string) => () => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      el?.focus({ preventScroll: true });
    },
    [reduced],
  );

  const commands = useMemo<Command[]>(
    () => [
      { id: 'top', label: 'Go to top', keywords: 'home hero intro', run: goTo('top') },
      {
        id: 'journey',
        label: 'Go to the career route',
        keywords: 'experience jobs bus timeline work',
        run: goTo('journey'),
      },
      { id: 'projects', label: 'Go to projects', keywords: 'demos work portfolio', run: goTo('projects') },
      { id: 'skills', label: 'Go to skills', keywords: 'stack tech', run: goTo('skills') },
      { id: 'contact', label: 'Go to contact', keywords: 'hire email message', run: goTo('contact') },
      ...projects.map<Command>((p) => ({
        id: `p-${p.id}`,
        label: `Open project: ${p.name}`,
        keywords: `${p.tagline} ${p.stack.join(' ')}`,
        run: () => openProject(p.id),
      })),
      ...links.map<Command>((l) => ({
        id: `l-${l.label}`,
        label: `Open ${l.label}`,
        hint: '↗',
        run: () => window.open(l.href, '_blank', 'noopener'),
      })),
      {
        id: 'cv',
        label: 'Download my CV (PDF)',
        keywords: 'pdf download resume cv',
        hint: '↓',
        run: () => window.open(CV_URL, '_blank', 'noopener'),
      },
    ],
    [goTo, openProject],
  );

  const project = projects.find((p) => p.id === selected);

  return (
    <>
      <a className="skip" href="#journey">
        Skip to the career route
      </a>

      <header className="bar">
        <a
          href="#top"
          className="bar__logo"
          aria-label="Veronika Rosicova, back to top"
          onClick={goTo('top')}
        >
          V<span aria-hidden="true">.</span>
        </a>
        <nav aria-label="Sections">
          <a href="#journey">Route</a>
          <a href="#projects">Projects</a>
          <a href="#skills">Skills</a>
          <a href="#contact">Contact</a>
        </nav>
        <button type="button" className="kbd-button" onClick={() => setPaletteOpen(true)}>
          Jump to <kbd>{MOD} K</kbd>
        </button>
      </header>

      <main>
        <section id="top" tabIndex={-1} className="hero">
          <div className="blob blob--a" aria-hidden="true" />
          <div className="blob blob--b" aria-hidden="true" />
          <div className="blob blob--c" aria-hidden="true" />
          <p className="hero__tag">{profile.role}</p>
          <h1 className="hero__name">
            <PhysicsText text="Veronika" />
            <br />
            <PhysicsText text="Rosicova" />
          </h1>
          <p className="hero__summary">{profile.summary}</p>
          <p className="status">
            <span className="dot" aria-hidden="true" /> {profile.availability} · {profile.location}
          </p>
          <p className="hero__cta">
            <a className="button" href="#journey" onClick={goTo('journey')}>
              Ride the route
            </a>
            <a className="button button--ghost" href={LINKEDIN} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a className="button button--ghost" href={CV_URL} download="Veronika-Rosicova-CV.pdf">
              Download CV
            </a>
          </p>
        </section>

        <section id="journey" tabIndex={-1} aria-labelledby="journey-title" className="section">
          <p className="eyebrow">Eight years, six stops</p>
          <h2 id="journey-title">My career, as a bus route</h2>
          <p className="section__lede">Scroll to drive. Each stop is a job; the last one is up to you.</p>
          <BusRoute jobs={jobs} contactHref="#contact" />
        </section>

        <section id="projects" tabIndex={-1} aria-labelledby="projects-title" className="section">
          <p className="eyebrow">Things you can click</p>
          <h2 id="projects-title">Live projects</h2>
          <p className="section__lede">
            Each one is deployed, tested and open source. Open a card for the case study.
          </p>
          <ul className="cards">
            {projects.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="card"
                  data-project-id={p.id}
                  style={{ ['--accent' as string]: p.color }}
                  onClick={() => openProject(p.id)}
                >
                  <span className="card__tag">{p.tagline}</span>
                  <span className="card__name">{p.name}</span>
                  <span className="card__desc">{p.description}</span>
                  <span className="chips" aria-hidden="true">
                    {p.stack.slice(0, 4).map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </span>
                  <span className="card__open">Open case study →</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section id="skills" tabIndex={-1} aria-labelledby="skills-title" className="section">
          <p className="eyebrow">What's in the toolbox</p>
          <h2 id="skills-title">Skills</h2>
          <div className="skills">
            {skillGroups.map((g) => (
              <div key={g.title}>
                <h3>{g.title}</h3>
                <ul className="chips chips--big">
                  {g.items.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" tabIndex={-1} aria-labelledby="contact-title" className="section contact">
          <p className="eyebrow">Next stop</p>
          <h2 id="contact-title">Let's talk</h2>
          <p className="section__lede">
            I'm available now, in Edinburgh or remote. The quickest way to reach me is a LinkedIn message.
          </p>
          <p className="hero__cta">
            <a className="button" href={LINKEDIN} target="_blank" rel="noreferrer">
              Message me on LinkedIn
            </a>
            {links.slice(1).map((l) => (
              <a
                key={l.label}
                className="button button--ghost"
                href={l.href}
                target="_blank"
                rel="noreferrer"
              >
                {l.label}
              </a>
            ))}
            <a className="button button--ghost" href={CV_URL} download="Veronika-Rosicova-CV.pdf">
              Download CV (PDF)
            </a>
          </p>
          <p className="fine">{profile.education}</p>
        </section>
      </main>

      <footer className="footer">
        <p>
          Built with React and TypeScript, no animation library.{' '}
          <a href="https://github.com/rveruna/rveruna.github.io">Source</a>
        </p>
      </footer>

      {project && <ProjectDialog project={project} onRequestClose={closeProject} />}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands} />
    </>
  );
}
