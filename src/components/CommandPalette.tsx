import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { filterCommands, type Command } from '@/lib/palette';

interface Props {
  open: boolean;
  onClose: () => void;
  commands: Command[];
}

/** ⌘K / Ctrl+K. A combobox: the input keeps focus and arrow keys move aria-activedescendant. */
export function CommandPalette({ open, onClose, commands }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const listId = useId();

  const results = useMemo(() => filterCommands(query, commands), [query, commands]);

  useLayoutEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) {
      setQuery('');
      setCursor(0);
      el.showModal();
      input.current?.focus();
    }
    if (!open && el.open) el.close();
  }, [open]);

  const run = (c: Command | undefined) => {
    if (!c) return;
    onClose();
    c.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => (c + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => (c - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(results[cursor]);
    }
  };

  return (
    // Backdrop click is a mouse convenience only. Keyboard users have Escape.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialog}
      className="palette"
      aria-label="Command palette"
      onClose={onClose}
      // Backdrop click is a mouse convenience only. Keyboard users have Escape.
      onClick={(e) => {
        if (e.target === dialog.current) onClose();
      }}
    >
      <input
        ref={input}
        className="palette__input"
        role="combobox"
        aria-expanded="true"
        aria-controls={listId}
        aria-activedescendant={results[cursor] ? `${listId}-${results[cursor].id}` : undefined}
        aria-label="Type a command"
        placeholder="Jump to… (try “projects”, “pdf”, “github”)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setCursor(0);
        }}
        onKeyDown={onKeyDown}
      />
      <ul id={listId} role="listbox" className="palette__list">
        {results.length === 0 && <li className="palette__empty">No match. Try a shorter word.</li>}
        {results.map((c, i) => (
          // Keyboard use is handled on the combobox input (arrows + Enter), as the ARIA combobox pattern
          // intends, so the options themselves are not focusable.
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          <li
            key={c.id}
            id={`${listId}-${c.id}`}
            role="option"
            aria-selected={i === cursor}
            className={i === cursor ? 'is-active' : undefined}
            onMouseMove={() => setCursor(i)}
            onClick={() => run(c)}
          >
            <span>{c.label}</span>
            {c.hint && <kbd>{c.hint}</kbd>}
          </li>
        ))}
      </ul>
    </dialog>
  );
}
