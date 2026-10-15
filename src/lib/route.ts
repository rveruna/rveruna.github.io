export interface Pt {
  x: number;
  y: number;
}

export interface RouteLayout {
  /** [start, ...stops, end]. Stops are points[1] to points[count]. */
  points: Pt[];
  /** SVG path through all points. Always heads downward, so y only ever increases. */
  d: string;
  height: number;
}

export interface RouteOptions {
  narrow: boolean;
  rowHeight: number;
  top: number;
  bottom: number;
  /** Measured vertical centre of each stop. When given, replaces the fixed `rowHeight` spacing. */
  stopYs?: number[];
}

/**
 * Lays out a winding route for `count` stops. On wide screens the line weaves gently either side of the
 * centre so cards can sit left and right; on narrow screens it is a straight rail down the left edge.
 */
export function layoutRoute(count: number, width: number, opts: RouteOptions): RouteLayout {
  const { narrow, rowHeight, top, bottom, stopYs } = opts;
  const ys =
    stopYs && stopYs.length === count
      ? stopYs
      : Array.from({ length: count }, (_, i) => top + rowHeight * i + rowHeight / 2);
  const height = ys[count - 1] + bottom;
  const xFor = (i: number) => (narrow ? 28 : width / 2 + (i % 2 === 0 ? -1 : 1) * Math.min(width * 0.05, 48));

  const points: Pt[] = [{ x: xFor(0), y: 0 }];
  for (let i = 0; i < count; i++) points.push({ x: xFor(i), y: ys[i] });
  points.push({ x: xFor(count - 1), y: height });

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const mid = (a.y + b.y) / 2;
    d += ` C ${a.x} ${mid} ${b.x} ${mid} ${b.x} ${b.y}`;
  }
  return { points, d, height };
}

/** Index (0-based, among stops only) of the stop nearest to `y`. */
export function nearestStop(points: Pt[], y: number): number {
  const stops = points.slice(1, -1);
  let best = 0;
  let bestDist = Infinity;
  stops.forEach((p, i) => {
    const dist = Math.abs(p.y - y);
    if (dist < bestDist) {
      best = i;
      bestDist = dist;
    }
  });
  return best;
}

/**
 * Length along an SVG path at which it reaches height `y`. Works because the route never turns back
 * upward, so y rises with length and a binary search converges.
 */
export function lengthAtY(
  path: Pick<SVGPathElement, 'getTotalLength' | 'getPointAtLength'>,
  y: number,
): number {
  const total = path.getTotalLength();
  let lo = 0;
  let hi = total;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (path.getPointAtLength(mid).y < y) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
