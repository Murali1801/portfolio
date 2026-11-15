/** Small OKLCH toolkit for the Tonal mini-demo and figures. Math from Björn Ottosson's Oklab paper. */

export type RGB = [number, number, number]; // gamma-encoded sRGB, 0..1

export interface Oklch {
  l: number; // 0..1
  c: number; // 0..~0.4
  h: number; // degrees
}

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toGamma = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function oklchToLinearSrgb({ l, c, h }: Oklch): RGB {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
}

export function srgbToOklch(rgb: RGB): Oklch {
  const [r, g, b] = rgb.map(toLinear) as RGB;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const c = Math.hypot(A, B);
  let h = (Math.atan2(B, A) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c, h: c < 1e-4 ? 0 : h };
}

export function inSrgbGamut(lin: RGB, eps = 1e-4): boolean {
  return lin.every((v) => v >= -eps && v <= 1 + eps);
}

/** Map an OKLCH colour into sRGB by lowering chroma (keeps lightness and hue). */
export function toSrgb(color: Oklch): { rgb: RGB; c: number; clipped: boolean } {
  let lin = oklchToLinearSrgb(color);
  if (inSrgbGamut(lin)) return { rgb: lin.map((v) => toGamma(clamp01(v))) as RGB, c: color.c, clipped: false };
  let lo = 0;
  let hi = color.c;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inSrgbGamut(oklchToLinearSrgb({ ...color, c: mid }))) lo = mid;
    else hi = mid;
  }
  lin = oklchToLinearSrgb({ ...color, c: lo });
  return { rgb: lin.map((v) => toGamma(clamp01(v))) as RGB, c: lo, clipped: true };
}

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((x) => x + x).join('') : h;
  const n = parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function rgbToHex(rgb: RGB): string {
  return '#' + rgb.map((v) => Math.round(clamp01(v) * 255).toString(16).padStart(2, '0')).join('');
}

/** h in degrees, s and l in 0..1. */
export function hslToRgb(h: number, s: number, l: number): RGB {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

/** WCAG 2.x relative luminance of a gamma-encoded sRGB colour. */
export function luminance(rgb: RGB): number {
  const [r, g, b] = rgb.map(toLinear) as RGB;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: RGB, b: RGB): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export type Grade = 'AAA' | 'AA' | 'AA large' | 'fail';

export function grade(ratio: number): Grade {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA large';
  return 'fail';
}

export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
const L_CURVE = [0.97, 0.93, 0.87, 0.79, 0.7, 0.61, 0.52, 0.44, 0.36, 0.28];
const C_CURVE = [0.1, 0.22, 0.42, 0.66, 0.88, 1, 0.94, 0.82, 0.68, 0.54];

export interface Swatch {
  step: number;
  oklch: Oklch;
  hex: string;
  rgb: RGB;
  /** Which text colour reads best on this swatch. */
  text: 'white' | 'ink';
  ratio: number;
  grade: Grade;
}

export const WHITE: RGB = [1, 1, 1];
export const INK: RGB = hexToRgb('#16150f');

/** A 10-step ramp for one hue: fixed lightness curve, chroma clipped into sRGB. */
export function ramp(hue: number, peakChroma = 0.19): Swatch[] {
  return STEPS.map((step, i) => {
    const target: Oklch = { l: L_CURVE[i]!, c: peakChroma * C_CURVE[i]!, h: hue };
    const { rgb, c } = toSrgb(target);
    const onWhite = contrast(rgb, WHITE);
    const onInk = contrast(rgb, INK);
    const text = onWhite >= onInk ? 'white' : 'ink';
    const ratio = Math.max(onWhite, onInk);
    return { step, oklch: { ...target, c }, hex: rgbToHex(rgb), rgb, text, ratio, grade: grade(ratio) };
  });
}

export function formatOklch({ l, c, h }: Oklch): string {
  return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${Math.round(h)})`;
}
