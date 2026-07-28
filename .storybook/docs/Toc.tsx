import { useEffect, useState } from 'react';
import './docs.scss';

export type TocEntry = { id: string; label: string };

/**
 * Sticky "On this page" rail.
 *
 * The entry list is passed in by `DocsPage` — it already knows which sections
 * it decided to render, so there's nothing to scrape from the DOM. The only
 * runtime work is highlighting whichever section is currently on screen.
 */
export function Toc({ entries }: { entries: TocEntry[] }) {
  const [active, setActive] = useState<string | null>(
    entries[0]?.id ?? null,
  );

  useEffect(() => {
    if (entries.length === 0) return;

    // Deliberately not an IntersectionObserver. Sections here are tall and
    // adjacent, so several are "intersecting" at once and picking one of them
    // is guesswork — an observer biased to a top band highlighted whichever
    // section was *leaving* it, always one behind the heading on screen.
    // "The last section whose top has crossed the marker" is unambiguous.
    const MARKER = 96; // px below the viewport top

    let frame = 0;
    const measure = () => {
      frame = 0;

      // A short final section can't be scrolled up to the marker — the document
      // bottoms out first — so it would never highlight. At the bottom, the
      // last entry is unambiguously what the reader is looking at.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setActive(entries[entries.length - 1].id);
        return;
      }

      let current = entries[0].id;
      for (const entry of entries) {
        const node = document.getElementById(entry.id);
        if (!node) continue;
        if (node.getBoundingClientRect().top <= MARKER) current = entry.id;
        else break;
      }
      setActive(current);
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <nav className="ui-docs-toc" aria-label="On this page">
      <p className="ui-docs-toc__title">On this page</p>
      <ul className="ui-docs-toc__list">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={`ui-docs-toc__link${
                active === entry.id ? ' ui-docs-toc__link--active' : ''
              }`}
              aria-current={active === entry.id ? 'true' : undefined}
            >
              {entry.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
