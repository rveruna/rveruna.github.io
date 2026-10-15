import { useLayoutEffect, useRef, useState } from 'react';
import type { Project } from '@/data/cv';

interface Props {
  project: Project;
  onRequestClose: () => void;
}

/**
 * A modal case study, with the live demo embedded when the project has one. The native <dialog> traps focus and
 * handles Escape.
 */
export function ProjectDialog({ project, onRequestClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [loaded, setLoaded] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  return (
    // Backdrop click is a mouse convenience only. Keyboard users have Escape and the Close button.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      className={project.demoUrl ? 'case' : 'case case--text-only'}
      aria-labelledby="case-title"
      style={{ ['--accent' as string]: project.color }}
      // Escape and the backdrop ask the parent to close, so the parent can animate the dialog away
      // before removing it. A native close() would hide it first and leave nothing to animate.
      onCancel={(e) => {
        e.preventDefault();
        onRequestClose();
      }}
      // Backdrop click is a mouse convenience only. Keyboard users have Escape and the Close button.
      onClick={(e) => {
        if (e.target === ref.current) onRequestClose();
      }}
    >
      <div className="case__panel" data-vt="panel">
        {/* A div, not a <header>: inside a dialog a <header> is read as a second page banner next to the site header */}
        <div className="case__head">
          <div>
            <p className="eyebrow">{project.tagline}</p>
            <h2 id="case-title">{project.name}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onRequestClose}>
            Close
          </button>
        </div>
        <div className="case__body">
          <div className="case__text">
            <p>{project.description}</p>
            <ul>
              {project.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <ul className="chips" aria-label="Tech used">
              {project.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="case__links">
              {project.demoUrl ? (
                <>
                  <a className="button" href={project.demoUrl} target="_blank" rel="noreferrer">
                    Open live demo
                  </a>
                  <a href={project.repoUrl} target="_blank" rel="noreferrer">
                    Source on GitHub
                  </a>
                </>
              ) : (
                <a className="button" href={project.repoUrl} target="_blank" rel="noreferrer">
                  Source on GitHub
                </a>
              )}
            </p>
          </div>
          {project.demoUrl && (
            <div className="case__frame">
              {!loaded && (
                <p className="case__loading" role="status">
                  Loading live demo…
                </p>
              )}
              <iframe
                className="case__demo"
                title={`${project.name} live demo`}
                src={project.demoUrl}
                sandbox="allow-scripts allow-same-origin allow-popups"
                onLoad={() => setLoaded(true)}
                style={{ visibility: loaded ? 'visible' : 'hidden' }}
              />
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
