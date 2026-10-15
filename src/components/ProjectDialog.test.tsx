import { render, screen } from '@testing-library/react';
import { ProjectDialog } from './ProjectDialog';
import type { Project } from '@/data/cv';

const base: Project = {
  id: 'example',
  name: 'Example',
  tagline: 'A tagline',
  description: 'What it does.',
  highlights: ['One thing'],
  stack: ['React'],
  repoUrl: 'https://github.com/rveruna/example',
  color: '#2bd3a0',
};

beforeAll(() => {
  // jsdom has no modal dialogs; opening one just needs to set `open`.
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
});

describe('ProjectDialog', () => {
  it('embeds the live demo with a title, and links to it and the source', () => {
    render(
      <ProjectDialog
        project={{ ...base, demoUrl: 'https://rveruna.github.io/example/' }}
        onRequestClose={() => {}}
      />,
    );

    expect(screen.getByTitle('Example live demo')).toHaveAttribute(
      'src',
      'https://rveruna.github.io/example/',
    );
    expect(screen.getByRole('link', { name: 'Open live demo' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Source on GitHub' })).toBeInTheDocument();
  });

  it('shows a project with no demo as text, with the source as its main link', () => {
    const { container } = render(<ProjectDialog project={base} onRequestClose={() => {}} />);

    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.getByRole('dialog')).toHaveClass('case--text-only');
    expect(screen.queryByRole('status')).toBeNull(); // no "Loading live demo…"
    expect(screen.queryByRole('link', { name: 'Open live demo' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Source on GitHub' })).toHaveClass('button');
  });

  it('is named by the project, for screen readers', () => {
    render(<ProjectDialog project={base} onRequestClose={() => {}} />);

    expect(screen.getByRole('dialog', { name: 'Example' })).toBeInTheDocument();
  });
});
