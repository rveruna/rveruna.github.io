import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Job } from '@/data/cv';
import { layoutRoute, lengthAtY, nearestStop, type RouteLayout } from '@/lib/route';
import { useNarrow, useReducedMotion } from '@/hooks/useMediaQuery';

interface Props {
  jobs: Job[];
  contactHref: string;
}

/** The career as a bus route. The bus is placed along an SVG path from the scroll position. */
export function BusRoute({ jobs, contactHref }: Props) {
  const narrow = useNarrow();
  const reduced = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const road = useRef<SVGPathElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const bus = useRef<SVGGElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(0);
  const [measured, setMeasured] = useState<number[] | null>(null);
  const stopEls = useRef<(HTMLElement | null)[]>([]);

  const count = jobs.length + 1; // the last stop is "your team"
  const rowHeight = narrow ? 380 : 340;
  // On narrow screens cards flow one under another at their natural height, and the road is drawn
  // through their measured centres. Fixed spacing would let tall cards overlap.
  const layout: RouteLayout | null =
    width > 0
      ? layoutRoute(count, width, {
          narrow,
          rowHeight,
          top: 80,
          bottom: 160,
          stopYs: narrow ? (measured ?? undefined) : undefined,
        })
      : null;

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => {
      setWidth(el.clientWidth);
      if (narrow) {
        const ys = stopEls.current.slice(0, count).map((c) => (c ? c.offsetTop + c.offsetHeight / 2 : 0));
        setMeasured((prev) =>
          prev && prev.length === ys.length && prev.every((y, i) => y === ys[i]) ? prev : ys,
        );
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    stopEls.current.forEach((c) => c && ro.observe(c));
    return () => ro.disconnect();
  }, [narrow, count]);

  useEffect(() => {
    if (!layout) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const el = wrap.current;
      const roadEl = road.current;
      if (!el || !roadEl) return;
      const rect = el.getBoundingClientRect();
      const y = Math.min(Math.max(window.innerHeight * 0.5 - rect.top, 0), layout.height);
      const idx = nearestStop(layout.points, y);
      setActive(idx);

      // Reduced motion: no continuous travel, the bus just sits at the active stop.
      const targetY = reduced ? layout.points[idx + 1].y : y;
      const len = lengthAtY(roadEl, targetY);
      const here = roadEl.getPointAtLength(len);
      const ahead = roadEl.getPointAtLength(Math.min(len + 2, roadEl.getTotalLength()));
      const angle = (Math.atan2(ahead.y - here.y, ahead.x - here.x) * 180) / Math.PI - 90;
      bus.current?.setAttribute('transform', `translate(${here.x} ${here.y}) rotate(${angle})`);
      if (trail.current) {
        const total = roadEl.getTotalLength();
        trail.current.style.strokeDasharray = `${total}`;
        trail.current.style.strokeDashoffset = `${total - len}`;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, [layout, reduced]);

  return (
    <div
      ref={wrap}
      className="route"
      style={narrow ? undefined : { height: layout?.height ?? rowHeight * count }}
      data-narrow={narrow || undefined}
    >
      {layout && (
        <svg className="route__svg" width={width} height={layout.height} aria-hidden="true">
          <path ref={road} d={layout.d} className="route__road" />
          <path ref={trail} d={layout.d} className="route__trail" />
          <g ref={bus} className="bus">
            <rect x="-13" y="-24" width="26" height="48" rx="7" className="bus__body" />
            <rect x="-9" y="8" width="18" height="9" rx="3" className="bus__glass" />
            <rect x="-9" y="-16" width="18" height="6" rx="2" className="bus__glass" />
            <rect x="-9" y="-6" width="18" height="10" rx="2" className="bus__roof" />
            <circle cx="-13" cy="-12" r="3" className="bus__wheel" />
            <circle cx="13" cy="-12" r="3" className="bus__wheel" />
            <circle cx="-13" cy="12" r="3" className="bus__wheel" />
            <circle cx="13" cy="12" r="3" className="bus__wheel" />
          </g>
          {layout.points.slice(1, -1).map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={i === active ? 13 : 9}
              className="route__stop"
              style={{ fill: i < jobs.length ? jobs[i].color : '#ff5a4e' }}
            />
          ))}
        </svg>
      )}

      {width > 0 &&
        layout &&
        jobs.map((job, i) => {
          const p = layout.points[i + 1];
          // The road swings left of centre on even stops and right on odd ones. Put each card on the side the road
          // swings away from, otherwise neighbouring cards overlap by the width of the swing.
          const side = narrow ? 'right' : i % 2 === 0 ? 'left' : 'right';
          return (
            <article
              key={job.id}
              ref={(el) => {
                stopEls.current[i] = el;
              }}
              className={`stop stop--${side}${i === active ? ' stop--active' : ''}`}
              style={{ top: p.y, ['--x' as string]: `${p.x}px`, ['--accent' as string]: job.color }}
              aria-labelledby={`stop-${job.id}`}
            >
              <p className="stop__dates">
                {job.from} – {job.to} · {job.place}
              </p>
              <h3 id={`stop-${job.id}`}>
                {job.role} <span>at {job.company}</span>
              </h3>
              <p className="stop__blurb">{job.blurb}</p>
              <ul>
                {job.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <ul className="chips" aria-label="Tech used">
                {job.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </article>
          );
        })}

      {layout && (
        <article
          ref={(el) => {
            stopEls.current[jobs.length] = el;
          }}
          className={`stop stop--final stop--${narrow ? 'right' : jobs.length % 2 === 0 ? 'left' : 'right'}${
            active === jobs.length ? ' stop--active' : ''
          }`}
          style={{
            top: layout.points[jobs.length + 1].y,
            ['--x' as string]: `${layout.points[jobs.length + 1].x}px`,
            ['--accent' as string]: '#ff5a4e',
          }}
          aria-labelledby="stop-next"
        >
          <p className="stop__dates">Next stop</p>
          <h3 id="stop-next">Your team</h3>
          <p className="stop__blurb">Running 0 minutes late. Available now.</p>
          <a className="button" href={contactHref}>
            Get in touch
          </a>
        </article>
      )}
    </div>
  );
}
