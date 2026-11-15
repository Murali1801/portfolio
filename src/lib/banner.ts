/** Masthead mini-demo: an animated README banner as one self-contained SVG string (no script, no external assets). */

export interface BannerOptions {
  title: string;
  subtitle?: string;
  theme?: 'light' | 'dark';
  width?: number;
  height?: number;
  /** Prefix for class names so several banners can share one page. */
  id?: string;
  /** false renders a static frame (used by the case-study figure). */
  animate?: boolean;
  /** 0..1 progress of the static frame when animate is false. */
  progress?: number;
}

export const BANNER_THEMES = {
  light: { bg: '#F3F0E8', fg: '#16150F', muted: '#6E6A62', line: '#D9D4C8', mark: '#F6D21F', edge: '#16150F' },
  dark: { bg: '#121210', fg: '#ECE9E1', muted: '#A19C92', line: '#2A2925', mark: '#F6D21F', edge: 'none' },
} as const;

export function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (ch) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' })[ch]!);
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const r1 = (v: number) => Math.round(v * 10) / 10;

export function bannerSvg(o: BannerOptions): string {
  const w = o.width ?? 840;
  const h = o.height ?? 220;
  const t = BANNER_THEMES[o.theme ?? 'light'];
  const id = (o.id ?? 'mh').replace(/[^a-z0-9-]/gi, '') || 'mh';
  const animate = o.animate ?? true;
  const p = clamp01(o.progress ?? 1);
  const raw = o.title.trim().slice(0, 32) || 'Untitled';
  const title = escapeXml(raw);
  const subtitle = escapeXml((o.subtitle ?? '').slice(0, 80));
  const pad = 40;
  const cols = 12;
  const colW = (w - pad * 2) / cols;
  const titleSize = Math.round(h * 0.34);
  const titleY = Math.round(h * 0.56);
  // Width estimate for the block cursor; the live demo re-measures the real text.
  const cursorX = Math.min(w - pad - titleSize * 0.4, pad + raw.length * titleSize * 0.58 + 12);
  const lineLen = h - 32;

  const lines: string[] = [];
  for (let i = 0; i <= cols; i++) {
    const x = r1(pad + i * colW);
    const offset = animate ? lineLen : r1(lineLen * (1 - clamp01(p * 2.2 - i / cols)));
    const delay = animate ? ` style="animation-delay:${i * 40}ms"` : '';
    lines.push(
      `<line class="${id}-g" x1="${x}" y1="16" x2="${x}" y2="${h - 16}" stroke-dasharray="${lineLen}" stroke-dashoffset="${offset}"${delay}/>`,
    );
  }

  const tp = clamp01((p - 0.35) / 0.35);
  const titleAttr = animate ? '' : ` opacity="${tp.toFixed(2)}" transform="translate(0 ${r1((1 - tp) * 12)})"`;
  const subAttr = animate ? '' : ` opacity="${clamp01((p - 0.6) / 0.3).toFixed(2)}"`;
  const cursorAttr = animate ? '' : ` opacity="${p > 0.7 ? 1 : 0}"`;

  const css = animate
    ? `.${id}-g{stroke:${t.line};stroke-width:1;animation:${id}-draw 1.2s cubic-bezier(.2,.7,.2,1) forwards}` +
      `.${id}-t{opacity:0;animation:${id}-in .6s cubic-bezier(.2,.7,.2,1) .7s forwards}` +
      `.${id}-s{opacity:0;animation:${id}-fade .5s ease 1.1s forwards}` +
      `.${id}-c{animation:${id}-blink 1s steps(1) infinite}` +
      `@keyframes ${id}-draw{to{stroke-dashoffset:0}}` +
      `@keyframes ${id}-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}` +
      `@keyframes ${id}-fade{to{opacity:1}}` +
      `@keyframes ${id}-blink{50%{opacity:0}}` +
      `@media (prefers-reduced-motion:reduce){.${id}-g,.${id}-t,.${id}-s,.${id}-c{animation:none;opacity:1;stroke-dashoffset:0}}`
    : `.${id}-g{stroke:${t.line};stroke-width:1}`;

  const cw = Math.round(titleSize * 0.4);
  const ch = Math.round(titleSize * 0.52);

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}">` +
    `<style>${css}</style>` +
    `<rect width="${w}" height="${h}" fill="${t.bg}"/>` +
    lines.join('') +
    `<g class="${id}-t"${titleAttr}><text x="${pad}" y="${titleY}" fill="${t.fg}" font-family="'Schibsted Grotesk',system-ui,sans-serif" font-weight="700" font-size="${titleSize}" letter-spacing="-2">${title}</text></g>` +
    `<rect class="${id}-c" x="${r1(cursorX)}" y="${titleY - ch}" width="${cw}" height="${ch}" fill="${t.mark}"` +
    (t.edge === 'none' ? '' : ` stroke="${t.edge}" stroke-width="2"`) +
    `${cursorAttr}/>` +
    (subtitle
      ? `<g class="${id}-s"${subAttr}><text x="${pad}" y="${h - 36}" fill="${t.muted}" font-family="'JetBrains Mono',ui-monospace,monospace" font-size="14" letter-spacing="1">${subtitle}</text></g>`
      : '') +
    `</svg>`
  );
}

export function byteSize(s: string): number {
  return new TextEncoder().encode(s).length;
}
