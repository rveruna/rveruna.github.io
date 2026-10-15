import { useEffect, useRef } from 'react';
import { isAtRest, stepSpring, type SpringState } from '@/lib/spring';
import { useFinePointer, useReducedMotion } from '@/hooks/useMediaQuery';

const SPRING = { stiffness: 140, damping: 11 };
const RADIUS = 130;
const PUSH = 9000;

/**
 * Text whose letters flee the cursor and spring back. The accessible name is the plain string,
 * the letters themselves are hidden from assistive tech, and touch or reduced-motion visitors get plain text.
 */
export function PhysicsText({ text }: { text: string }) {
  // Both hooks run every render. Writing `a() && !b()` would skip the second one and break hook order.
  const finePointer = useFinePointer();
  const reduced = useReducedMotion();
  const enabled = finePointer && !reduced;
  const letters = useRef<(HTMLSpanElement | null)[]>([]);
  const states = useRef<SpringState[]>([]);
  const homes = useRef<{ x: number; y: number }[]>([]);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const raf = useRef(0);
  const last = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    states.current = letters.current.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));

    const measure = () => {
      homes.current = letters.current.map((el, i) => {
        if (!el) return { x: 0, y: 0 };
        const r = el.getBoundingClientRect();
        const s = states.current[i];
        return { x: r.left + r.width / 2 - s.x, y: r.top + r.height / 2 - s.y };
      });
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last.current) / 1000, 1 / 30);
      last.current = now;
      let moving = false;
      states.current = states.current.map((s, i) => {
        let { vx, vy } = s;
        const p = pointer.current;
        const home = homes.current[i];
        if (p && home) {
          const dx = home.x + s.x - p.x;
          const dy = home.y + s.y - p.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < RADIUS) {
            const f = (1 - dist / RADIUS) * PUSH * dt;
            vx += (dx / dist) * f;
            vy += (dy / dist) * f;
          }
        }
        const next = stepSpring({ ...s, vx, vy }, SPRING, dt);
        if (!isAtRest(next) || p) moving = true;
        const el = letters.current[i];
        if (el) el.style.transform = `translate(${next.x}px, ${next.y}px) rotate(${next.x / 6}deg)`;
        return next;
      });
      raf.current = moving ? requestAnimationFrame(tick) : 0;
    };

    const start = () => {
      if (!raf.current) {
        last.current = performance.now();
        raf.current = requestAnimationFrame(tick);
      }
    };
    const move = (e: PointerEvent) => {
      if (!pointer.current) measure();
      pointer.current = { x: e.clientX, y: e.clientY };
      start();
    };
    const leave = () => {
      pointer.current = null;
      start();
    };

    window.addEventListener('pointermove', move);
    document.addEventListener('pointerleave', leave);
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      window.removeEventListener('resize', measure);
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [enabled]);

  if (!enabled) return <>{text}</>;

  return (
    <>
      <span className="sr-only">{text}</span>
      {[...text].map((ch, i) => (
        <span
          key={i}
          aria-hidden="true"
          ref={(el) => {
            letters.current[i] = el;
          }}
          className="letter"
        >
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </>
  );
}
