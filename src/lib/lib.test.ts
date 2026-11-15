import { describe, expect, it, vi } from 'vitest';
import { contrast, grade, hexToRgb, hslToRgb, oklchToLinearSrgb, inSrgbGamut, ramp, rgbToHex, srgbToOklch, toSrgb } from './oklch';
import { nearest, project, rubberband, simulate, velocity } from './spring';
import { formatINR, settle, splitAndSettle, splitEqual, toPaise } from './settle';
import { bannerSvg, byteSize, escapeXml } from './banner';
import { formatUtcOffset, relativeToViewer, zoneOffsetMinutes } from './time';
import { fetchStars, getStars, starLabel } from './github';

describe('oklch', () => {
  it('maps white and black to the ends of lightness', () => {
    expect(srgbToOklch([1, 1, 1]).l).toBeCloseTo(1, 3);
    expect(srgbToOklch([1, 1, 1]).c).toBeLessThan(1e-3);
    expect(srgbToOklch([0, 0, 0]).l).toBeCloseTo(0, 3);
  });

  it('round-trips the brand cobalt through OKLCH', () => {
    const cobalt = hexToRgb('#2747d9');
    const back = toSrgb(srgbToOklch(cobalt));
    expect(back.clipped).toBe(false);
    expect(rgbToHex(back.rgb)).toBe('#2747d9');
  });

  it('pulls out-of-gamut colours into sRGB by lowering chroma only', () => {
    const wild = { l: 0.7, c: 0.4, h: 150 };
    expect(inSrgbGamut(oklchToLinearSrgb(wild))).toBe(false);
    const mapped = toSrgb(wild);
    expect(mapped.clipped).toBe(true);
    expect(mapped.c).toBeLessThan(0.4);
    expect(srgbToOklch(mapped.rgb).l).toBeCloseTo(0.7, 2);
  });

  it('computes WCAG contrast and grades', () => {
    expect(contrast([0, 0, 0], [1, 1, 1])).toBeCloseTo(21, 5);
    expect(contrast(hexToRgb('#6e6a62'), hexToRgb('#f3f0e8'))).toBeGreaterThan(4.5);
    expect(grade(7.1)).toBe('AAA');
    expect(grade(4.6)).toBe('AA');
    expect(grade(3.2)).toBe('AA large');
    expect(grade(2)).toBe('fail');
  });

  it('builds a 10-step ramp that gets darker every step and always picks readable text', () => {
    for (const hue of [0, 90, 210, 300]) {
      const r = ramp(hue);
      expect(r).toHaveLength(10);
      for (let i = 1; i < r.length; i++) expect(r[i]!.oklch.l).toBeLessThan(r[i - 1]!.oklch.l);
      for (const s of r) expect(s.ratio).toBeGreaterThanOrEqual(3);
      expect(r[0]!.text).toBe('ink');
      expect(r[9]!.text).toBe('white');
    }
  });

  it('converts HSL', () => {
    expect(rgbToHex(hslToRgb(0, 1, 0.5))).toBe('#ff0000');
    expect(rgbToHex(hslToRgb(240, 1, 0.5))).toBe('#0000ff');
  });
});

describe('spring', () => {
  it('measures velocity over the last 100 ms only', () => {
    const samples = [
      { t: 0, y: 0 },
      { t: 50, y: 0 },
      { t: 200, y: 100 },
      { t: 250, y: 150 },
      { t: 300, y: 200 },
    ];
    expect(velocity(samples)).toBeCloseTo(1, 5);
    expect(velocity([{ t: 0, y: 0 }])).toBe(0);
  });

  it('projects a flick forward and snaps to the nearest detent of the projection', () => {
    expect(project(100, 0)).toBe(100);
    expect(project(100, 1)).toBeCloseTo(599, 0);
    expect(nearest([0, 200, 400], project(150, 0.2))).toBe(200);
    expect(nearest([0, 200, 400], project(150, -0.4))).toBe(0);
  });

  it('rubber-bands with diminishing returns and keeps the sign', () => {
    const a = rubberband(50, 300);
    const b = rubberband(500, 300);
    expect(a).toBeGreaterThan(0);
    expect(a).toBeLessThan(50);
    expect(b).toBeLessThan(300);
    expect(rubberband(-50, 300)).toBeCloseTo(-a, 6);
  });

  it('settles on the target without running away', () => {
    const frames = simulate({ x: 0, v: 0 }, 300);
    const last = frames[frames.length - 1]!;
    expect(last.x).toBeCloseTo(300, 0);
    expect(frames.length).toBeLessThan(360);
    const overshoot = Math.max(...frames.map((f) => f.x));
    expect(overshoot).toBeLessThan(330);
  });
});

describe('settle', () => {
  it('splits paise so the parts differ by at most one and sum back', () => {
    const parts = splitEqual(1000, 3);
    expect(parts).toEqual([334, 333, 333]);
    expect(parts.reduce((a, b) => a + b)).toBe(1000);
    expect(splitEqual(10, 0)).toEqual([]);
  });

  it('settles three people with at most two transfers that zero every balance', () => {
    const paid = [300000, 45000, 0];
    const { balances, transfers, total } = splitAndSettle(paid);
    expect(total).toBe(345000);
    expect(balances.reduce((a, b) => a + b, 0)).toBe(0);
    expect(transfers.length).toBeLessThanOrEqual(2);
    const after = [...balances];
    for (const t of transfers) {
      after[t.from]! += t.amount;
      after[t.to]! -= t.amount;
    }
    expect(after).toEqual([0, 0, 0]);
  });

  it('returns no transfers when everyone paid the same', () => {
    expect(splitAndSettle([5000, 5000, 5000]).transfers).toEqual([]);
    expect(settle([0, 0])).toEqual([]);
  });

  it('parses and formats rupees', () => {
    expect(toPaise('1,200.5')).toBe(120050);
    expect(toPaise('abc')).toBe(0);
    expect(toPaise('-5')).toBe(0);
    expect(formatINR(345000)).toBe('₹3,450');
    expect(formatINR(150)).toBe('₹1.50');
    expect(formatINR(12345600)).toBe('₹1,23,456');
  });
});

describe('banner', () => {
  it('escapes text and never emits script or external references', () => {
    const svg = bannerSvg({ title: '<script>&"x"', subtitle: "it's" });
    expect(svg).not.toContain('<script');
    expect(svg).toContain('&lt;script&gt;&amp;&quot;x&quot;');
    expect(svg).toContain('it&#39;s');
    expect(svg).not.toMatch(/href=|url\(|@import/);
    expect(escapeXml('a<b')).toBe('a&lt;b');
  });

  it('respects reduced motion and sizes the viewBox', () => {
    const svg = bannerSvg({ title: 'Masthead', width: 840, height: 220 });
    expect(svg).toContain('viewBox="0 0 840 220"');
    expect(svg).toContain('prefers-reduced-motion');
    expect(svg).toContain('steps(1)');
    expect(byteSize(svg)).toBeLessThan(50_000);
  });

  it('renders a static frame with no keyframes', () => {
    const svg = bannerSvg({ title: 'Masthead', animate: false, progress: 0.5 });
    expect(svg).not.toContain('@keyframes');
    expect(bannerSvg({ title: 'x', animate: false, progress: 1 })).toBe(bannerSvg({ title: 'x', animate: false, progress: 1 }));
  });

  it('uses no outline on the dark mark', () => {
    expect(bannerSvg({ title: 'a', theme: 'dark' })).not.toContain('stroke="none"');
    expect(bannerSvg({ title: 'a', theme: 'light' })).toContain('stroke="#16150F"');
  });
});

describe('time', () => {
  it('knows IST is UTC+05:30', () => {
    expect(zoneOffsetMinutes('Asia/Kolkata', new Date('2026-01-15T12:00:00Z'))).toBe(330);
    expect(formatUtcOffset(330)).toBe('UTC+05:30');
    expect(formatUtcOffset(-240)).toBe('UTC-04:00');
  });

  it('describes the gap to the viewer', () => {
    expect(relativeToViewer(330, 0)).toBe('5h 30m ahead of you');
    expect(relativeToViewer(330, 330)).toBe('same time as you');
    expect(relativeToViewer(330, 540)).toBe('3h 30m behind you');
    expect(relativeToViewer(330, 300)).toBe('30m ahead of you');
  });
});

describe('github stars', () => {
  const ok = (body: unknown, status = 200) =>
    vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

  it('reads stargazers_count', async () => {
    expect(await fetchStars('a', 'b', { fetchImpl: ok({ stargazers_count: 42 }) })).toBe(42);
  });

  it('falls back to null on 404, bad JSON shape and network errors', async () => {
    expect(await fetchStars('a', 'b', { fetchImpl: ok({ message: 'Not Found' }, 404) })).toBeNull();
    expect(await fetchStars('a', 'b', { fetchImpl: ok({}) })).toBeNull();
    const offline = vi.fn(async () => {
      throw new TypeError('fetch failed');
    }) as unknown as typeof fetch;
    expect(await fetchStars('a', 'b', { fetchImpl: offline })).toBeNull();
  });

  it('caches per repo and can be switched off', async () => {
    const f = ok({ stargazers_count: 7 });
    await getStars('x', 'cached', { fetchImpl: f });
    await getStars('x', 'cached', { fetchImpl: f });
    expect(f).toHaveBeenCalledTimes(1);
    expect(await getStars('x', 'off', { enabled: false })).toBeNull();
  });

  it('labels counts', () => {
    expect(starLabel(null)).toBe('new');
    expect(starLabel(1)).toBe('1 star');
    expect(starLabel(1234)).toBe('1,234 stars');
  });
});

describe('figures', async () => {
  const { tonalHues, sheetProjection, tabSettle, FIGURES } = await import('./figures');

  it('shows HSL contrast spreading far wider than OKLCH at equal L', () => {
    const [hsl, ok] = tonalHues('light').stats;
    expect(hsl!.max - hsl!.min).toBeGreaterThan(5);
    expect(ok!.max - ok!.min).toBeLessThan(1);
  });

  it('lands the sample flick on 60% although the release is nearer 25%', () => {
    const f = sheetProjection('light').facts;
    expect(Math.round(f.landsPct)).toBe(60);
    expect(f.projectedPct).toBeGreaterThan(60);
  });

  it('settles the five-person sample in at most four payments and renders every figure', () => {
    expect(tabSettle('dark').transfers).toBeLessThanOrEqual(4);
    for (const draw of Object.values(FIGURES)) {
      const svg = draw('dark');
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).not.toContain('<script');
    }
  });
});
