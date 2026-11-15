/**
 * Case-study figures, drawn at build time from the same code as the demos.
 * Served as static SVG files from src/pages/media/[file].ts, one light and one dark version each.
 */
import { contrast, hslToRgb, rgbToHex, toSrgb, WHITE } from './oklch';
import { project, simulate, nearest } from './spring';
import { formatINR, splitAndSettle } from './settle';
import { bannerSvg, escapeXml } from './banner';

export type Theme = 'light' | 'dark';

const PALETTE = {
  light: { fg: '#16150F', muted: '#615D55', rule: '#CFC9BB', accent: '#2747D9', mark: '#F6D21F', edge: '#16150F', soft: 'rgba(39,71,217,0.08)', line: 'rgba(39,71,217,0.35)' },
  dark: { fg: '#ECE9E1', muted: '#A19C92', rule: '#3A3934', accent: '#7B93FF', mark: '#F6D21F', edge: 'none', soft: 'rgba(123,147,255,0.08)', line: 'rgba(123,147,255,0.38)' },
} as const;

const W = 1200;
const H = 460;
const MONO = "ui-monospace,'Cascadia Mono',Menlo,Consolas,monospace";
const SANS = "system-ui,-apple-system,'Segoe UI',sans-serif";

const wrap = (body: string, label: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escapeXml(label)}">${body}</svg>`;

const text = (x: number, y: number, s: string, fill: string, size = 13, anchor: 'start' | 'middle' | 'end' = 'start', font = MONO, weight = 400) =>
  `<text x="${x}" y="${y}" fill="${fill}" font-family="${font}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${escapeXml(s)}</text>`;

const markRect = (x: number, y: number, s: number, t: Theme) =>
  `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${PALETTE[t].mark}"${PALETTE[t].edge === 'none' ? '' : ` stroke="${PALETTE[t].edge}" stroke-width="1"`}/>`;

/** HSL at one lightness vs OKLCH at one L, across 12 hues, with contrast against white. */
export function tonalHues(t: Theme) {
  const p = PALETTE[t];
  const hues = Array.from({ length: 12 }, (_, i) => i * 30);
  const left = 200;
  const cell = (W - left - 40) / 12;
  const rows = [
    { label: 'HSL', sub: 'S 90% · L 50%', colors: hues.map((h) => hslToRgb(h, 0.9, 0.5)) },
    { label: 'OKLCH', sub: 'L 62% · C 0.15', colors: hues.map((h) => toSrgb({ l: 0.62, c: 0.15, h }).rgb) },
  ];
  let body = '';
  hues.forEach((h, i) => (body += text(left + i * cell + cell / 2, 48, `${h}°`, p.muted, 12, 'middle')));
  const stats: { min: number; max: number }[] = [];
  rows.forEach((r, ri) => {
    const y0 = 72 + ri * 190;
    body += text(40, y0 + 52, r.label, p.fg, 22, 'start', SANS, 700);
    body += text(40, y0 + 78, r.sub, p.muted, 12);
    const ratios = r.colors.map((c) => contrast(c, WHITE));
    stats.push({ min: Math.min(...ratios), max: Math.max(...ratios) });
    r.colors.forEach((c, i) => {
      const x = left + i * cell;
      body += `<rect x="${x.toFixed(1)}" y="${y0}" width="${(cell + 0.5).toFixed(1)}" height="112" fill="${rgbToHex(c)}"/>`;
      body += text(x + cell / 2, y0 + 140, ratios[i]!.toFixed(1), p.fg, 14, 'middle');
    });
    body += `<line x1="${left}" y1="${y0 + 160}" x2="${W - 40}" y2="${y0 + 160}" stroke="${p.rule}"/>`;
  });
  return { svg: wrap(body, 'HSL versus OKLCH at equal lightness'), stats };
}

/** A flick on the sheet: release, projection, chosen snap point and the spring that gets there. */
export function sheetProjection(t: Theme) {
  const p = PALETTE[t];
  const stage = 600; // virtual stage height in px
  const snaps = [0.25, 0.6, 0.92];
  const snapY = snaps.map((f) => stage * (1 - f));
  const releaseY = stage * (1 - 0.4);
  const v = -0.3; // px/ms, upward
  const proj = project(releaseY, v);
  const target = nearest(snapY, proj);
  const frames = simulate({ x: releaseY, v: v * 1000 }, target);

  const x0 = 120;
  const x1 = W - 120;
  const y0 = 40;
  const y1 = H - 70;
  const tMin = -240;
  const tMax = 760;
  const X = (ms: number) => x0 + ((ms - tMin) / (tMax - tMin)) * (x1 - x0);
  const Y = (openPct: number) => y1 - (openPct / 100) * (y1 - y0);
  const pct = (py: number) => (1 - py / stage) * 100;

  let body = '';
  // Axes
  body += `<line x1="${x0}" y1="${y1}" x2="${x1}" y2="${y1}" stroke="${p.fg}"/>`;
  body += `<line x1="${X(0)}" y1="${y0 - 10}" x2="${X(0)}" y2="${y1}" stroke="${p.rule}" stroke-dasharray="3 4"/>`;
  body += text(X(0) + 8, y0 + 4, 'release', p.muted, 12);
  for (let ms = -200; ms <= 700; ms += 100) {
    body += `<line x1="${X(ms)}" y1="${y1}" x2="${X(ms)}" y2="${y1 + 6}" stroke="${p.fg}"/>`;
    body += text(X(ms), y1 + 24, `${ms}`, p.muted, 11, 'middle');
  }
  body += text(x1, y1 + 46, 'time, ms', p.muted, 12, 'end');
  // Snap lines
  snaps.forEach((f) => {
    const y = Y(f * 100);
    body += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${p.rule}"/>`;
    body += text(x0 - 12, y + 4, `${Math.round(f * 100)}%`, p.fg, 12, 'end');
  });
  body += text(x0 - 12, y0 - 14, 'open', p.muted, 12, 'end');
  // Drag before release (finger)
  const drag: string[] = [];
  for (let ms = -200; ms <= 0; ms += 10) {
    const k = (ms + 200) / 200;
    const eased = 1 - (1 - k) * (1 - k);
    drag.push(`${X(ms).toFixed(1)},${Y(25 + (40 - 25) * eased).toFixed(1)}`);
  }
  body += `<polyline points="${drag.join(' ')}" fill="none" stroke="${p.muted}" stroke-width="2" stroke-dasharray="4 4"/>`;
  body += text(X(-200), Y(25) + 22, 'finger drag', p.muted, 12);
  // Spring
  const pts = frames.map((f, i) => `${X((i * 1000) / 120).toFixed(1)},${Y(pct(f.x)).toFixed(1)}`);
  body += `<polyline points="${pts.join(' ')}" fill="none" stroke="${p.accent}" stroke-width="2.5"/>`;
  body += `<circle cx="${X(0)}" cy="${Y(40)}" r="5" fill="${p.fg}"/>`;
  body += text(X(0) + 10, Y(40) + 20, 'let go at 40%, v = 0.3 px/ms up', p.fg, 12);
  // Projection
  const projPct = pct(proj);
  body += `<line x1="${X(0)}" y1="${Y(40)}" x2="${x1}" y2="${Y(projPct)}" stroke="${p.muted}" stroke-dasharray="2 5"/>`;
  body += `<rect x="${x1 - 2}" y="${Y(projPct) - 2}" width="22" height="4" fill="${p.mark}"${p.edge === 'none' ? '' : ` stroke="${p.edge}"`}/>`;
  body += text(x1 + 26, Y(projPct) + 4, `${Math.round(projPct)}%`, p.fg, 12);
  body += text(x1, Y(projPct) - 12, 'projected rest', p.muted, 12, 'end');
  body += text(X(380), Y(60) - 14, `spring settles on ${Math.round(pct(target))}%`, p.accent, 12);

  return {
    svg: wrap(body, 'Sheet flick projection chart'),
    facts: { releasePct: 40, projectedPct: projPct, landsPct: pct(target), frames: frames.length },
  };
}

/** Five people, one weekend: balances and the greedy settle-up payments. */
export function tabSettle(t: Theme) {
  const p = PALETTE[t];
  const people = ['Asha', 'Ravi', 'Kiran', 'Meera', 'Dev'];
  const paid = [480000, 120000, 0, 260000, 40000];
  const r = splitAndSettle(paid);
  const colX = 120;
  const rowH = 44;
  let body = '';
  body += text(colX, 56, 'Person', p.muted, 12);
  body += text(colX + 190, 56, 'Paid', p.muted, 12, 'end');
  body += text(colX + 300, 56, 'Share', p.muted, 12, 'end');
  body += text(colX + 430, 56, 'Balance', p.muted, 12, 'end');
  body += `<line x1="${colX}" y1="70" x2="${colX + 430}" y2="70" stroke="${p.fg}"/>`;
  people.forEach((name, i) => {
    const y = 104 + i * rowH;
    body += text(colX, y, name, p.fg, 15, 'start', SANS, 600);
    body += text(colX + 190, y, formatINR(paid[i]!), p.fg, 14, 'end');
    body += text(colX + 300, y, formatINR(r.shares[i]!), p.muted, 14, 'end');
    const b = r.balances[i]!;
    body += text(colX + 430, y, `${b > 0 ? '+' : b < 0 ? '-' : ''}${formatINR(Math.abs(b))}`, b >= 0 ? p.fg : p.muted, 14, 'end');
    body += `<line x1="${colX}" y1="${y + 16}" x2="${colX + 430}" y2="${y + 16}" stroke="${p.rule}" stroke-dasharray="1 4"/>`;
  });
  body += text(colX, 104 + 5 * rowH + 4, `Total ${formatINR(r.total)}`, p.muted, 12);

  const rx = 700;
  body += text(rx, 56, `Settle up · ${r.transfers.length} payments`, p.muted, 12);
  body += `<line x1="${rx}" y1="70" x2="${W - 120}" y2="70" stroke="${p.fg}"/>`;
  r.transfers.forEach((tr, i) => {
    const y = 104 + i * rowH;
    const from = people[tr.from]!;
    const to = people[tr.to]!;
    body += text(rx, y, from, p.fg, 15, 'start', SANS, 600);
    body += `<line x1="${rx + 72}" y1="${y - 5}" x2="${rx + 128}" y2="${y - 5}" stroke="${p.accent}" stroke-width="1.5"/><path d="M${rx + 128} ${y - 9} l7 4 -7 4z" fill="${p.accent}"/>`;
    body += text(rx + 148, y, to, p.fg, 15, 'start', SANS, 600);
    body += text(W - 120, y, formatINR(tr.amount), p.fg, 14, 'end');
    body += `<line x1="${rx}" y1="${y + 16}" x2="${W - 120}" y2="${y + 16}" stroke="${p.rule}" stroke-dasharray="1 4"/>`;
  });
  body += markRect(rx, 104 + r.transfers.length * rowH - 6, 10, t);
  body += text(rx + 18, 104 + r.transfers.length * rowH + 4, 'everyone square', p.muted, 12);
  return { svg: wrap(body, 'Settle-up receipt for five people'), transfers: r.transfers.length };
}

/** Four static frames of the Masthead intro. */
export function mastheadFrames(t: Theme) {
  const p = PALETTE[t];
  const steps = [0, 0.35, 0.65, 1];
  const fw = 520;
  const fh = (fw * 220) / 840;
  const gx = 40;
  const startX = (W - (fw * 2 + gx)) / 2;
  let body = '';
  steps.forEach((s, i) => {
    const x = startX + (i % 2) * (fw + gx);
    const y = 40 + Math.floor(i / 2) * (fh + 56);
    const inner = bannerSvg({ title: 'Masthead', subtitle: 'README BANNER', theme: t, animate: false, progress: s, id: `f${i}` })
      .replace(/^<svg[^>]*>/, `<svg x="${x}" y="${y}" width="${fw}" height="${fh.toFixed(1)}" viewBox="0 0 840 220">`);
    body += inner;
    body += `<rect x="${x}" y="${y}" width="${fw}" height="${fh.toFixed(1)}" fill="none" stroke="${p.rule}"/>`;
    body += text(x, y + fh + 24, `${Math.round(s * 100)}%`, p.muted, 12);
  });
  return wrap(body, 'Four frames of a Masthead banner');
}

/** The home page wireframe on its 12-column grid and 8px baseline. */
export function portfolioGrid(t: Theme) {
  const p = PALETTE[t];
  const pad = 64;
  const gap = 20;
  const cols = 12;
  const colW = (W - pad * 2 - gap * (cols - 1)) / cols;
  const cx = (i: number) => pad + i * (colW + gap);
  const span = (a: number, n: number) => ({ x: cx(a), w: n * colW + (n - 1) * gap });
  let body = '';
  // Baseline
  for (let y = 0; y < H; y += 8) body += `<line x1="0" y1="${y + 0.5}" x2="${W}" y2="${y + 0.5}" stroke="${p.line}" stroke-opacity="0.35"/>`;
  // Columns
  for (let i = 0; i < cols; i++) {
    body += `<rect x="${cx(i).toFixed(1)}" y="0" width="${colW.toFixed(1)}" height="${H}" fill="${p.soft}" stroke="${p.line}" stroke-width="1"/>`;
  }
  // Wireframe
  const bar = (a: number, n: number, y: number, h: number, fill: string = p.fg) => {
    const s = span(a, n);
    return `<rect x="${s.x.toFixed(1)}" y="${y}" width="${s.w.toFixed(1)}" height="${h}" fill="${fill}"/>`;
  };
  body += markRect(cx(0), 24, 12, t) + bar(0, 1, 26, 8, p.muted).replace(`x="${cx(0).toFixed(1)}"`, `x="${(cx(0) + 20).toFixed(1)}"`);
  body += bar(10, 2, 26, 8, p.muted);
  body += `<line x1="${pad}" y1="56" x2="${W - pad}" y2="56" stroke="${p.rule}"/>`;
  body += bar(0, 7, 88, 56) + bar(0, 6, 152, 56);
  body += markRect(span(0, 6).x + span(0, 6).w + 8, 176, 28, t);
  body += bar(0, 5, 240, 10, p.muted) + bar(0, 4, 260, 10, p.muted);
  [0, 1, 2, 3].forEach((r) => (body += bar(7, 2, 240 + r * 20, 8, p.muted) + bar(9, 3, 240 + r * 20, 8, p.muted)));
  body += `<line x1="${pad}" y1="336" x2="${W - pad}" y2="336" stroke="${p.fg}" stroke-width="1.5"/>`;
  [0, 1, 2].forEach((r) => {
    const y = 352 + r * 32;
    body += bar(0, 1, y + 8, 8, p.muted) + bar(1, 3, y + 4, 14) + bar(4, 2, y + 8, 8, p.muted) + bar(6, 3, y + 8, 8, p.muted) + bar(9, 2, y + 8, 8, p.muted) + bar(11, 1, y + 8, 8, p.muted);
    body += `<line x1="${pad}" y1="${y + 30}" x2="${W - pad}" y2="${y + 30}" stroke="${p.rule}"/>`;
  });
  return wrap(body, 'Home page wireframe on a 12-column grid');
}

export const FIGURES = {
  'tonal-hues': (t: Theme) => tonalHues(t).svg,
  'sheet-projection': (t: Theme) => sheetProjection(t).svg,
  'tab-settle': (t: Theme) => tabSettle(t).svg,
  'masthead-frames': mastheadFrames,
  'portfolio-grid': portfolioGrid,
} as const;
