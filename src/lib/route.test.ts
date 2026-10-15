import { layoutRoute, lengthAtY, nearestStop } from './route';

const opts = { narrow: false, rowHeight: 300, top: 100, bottom: 200 };

describe('layoutRoute', () => {
  it('returns a start, one point per stop and an end', () => {
    expect(layoutRoute(6, 1200, opts).points).toHaveLength(8);
  });

  it('only ever heads downward, which lengthAtY relies on', () => {
    const { points } = layoutRoute(6, 1200, opts);
    for (let i = 1; i < points.length; i++) expect(points[i].y).toBeGreaterThan(points[i - 1].y);
  });

  it('weaves either side of the centre on wide screens', () => {
    const { points } = layoutRoute(4, 1200, opts);
    expect(points[1].x).toBeLessThan(600);
    expect(points[2].x).toBeGreaterThan(600);
  });

  it('is a straight rail on narrow screens', () => {
    const { points } = layoutRoute(4, 390, { ...opts, narrow: true });
    expect(new Set(points.map((p) => p.x))).toEqual(new Set([28]));
  });

  it('is tall enough for every stop plus the margins', () => {
    expect(layoutRoute(6, 1200, opts).height).toBe(100 + 5 * 300 + 150 + 200);
  });

  it('uses measured stop positions when given, so tall cards cannot overlap', () => {
    const { points, height } = layoutRoute(3, 390, { ...opts, narrow: true, stopYs: [200, 900, 1300] });
    expect(points.slice(1, -1).map((p) => p.y)).toEqual([200, 900, 1300]);
    expect(height).toBe(1300 + 200);
  });

  it('ignores measurements of the wrong length', () => {
    const { points } = layoutRoute(3, 390, { ...opts, narrow: true, stopYs: [200] });
    expect(points[1].y).toBe(100 + 150);
  });

  it('starts the path at the first point', () => {
    const { d, points } = layoutRoute(3, 1200, opts);
    expect(d.startsWith(`M ${points[0].x} ${points[0].y}`)).toBe(true);
  });
});

describe('nearestStop', () => {
  const { points } = layoutRoute(3, 1200, opts);
  it('picks the closest stop to a y position', () => {
    expect(nearestStop(points, 0)).toBe(0);
    expect(nearestStop(points, points[2].y + 10)).toBe(1);
    expect(nearestStop(points, 99999)).toBe(2);
  });
});

describe('lengthAtY', () => {
  // A straight vertical line of length 1000: length equals y.
  const line = {
    getTotalLength: () => 1000,
    getPointAtLength: (l: number) => ({ x: 0, y: l }) as DOMPoint,
  };
  it('finds the length at which the path reaches a height', () => {
    expect(lengthAtY(line, 250)).toBeCloseTo(250, 1);
    expect(lengthAtY(line, 0)).toBeCloseTo(0, 1);
    expect(lengthAtY(line, 1000)).toBeCloseTo(1000, 1);
  });
});
