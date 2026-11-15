/** Sheet physics: velocity sampling, iOS-style projection, rubber band and a damped spring. */

export interface Sample {
  t: number; // ms
  y: number; // px
}

export interface SpringParams {
  stiffness: number;
  damping: number;
  mass: number;
}

export const DEFAULT_SPRING: SpringParams = { stiffness: 400, damping: 40, mass: 1 };

/** Velocity in px/ms from the samples inside the last `windowMs`. */
export function velocity(samples: Sample[], windowMs = 100): number {
  if (samples.length < 2) return 0;
  const last = samples[samples.length - 1]!;
  let first = last;
  for (let i = samples.length - 1; i >= 0; i--) {
    const s = samples[i]!;
    if (last.t - s.t > windowMs) break;
    first = s;
  }
  const dt = last.t - first.t;
  return dt > 0 ? (last.y - first.y) / dt : 0;
}

/** Where a flick would come to rest with exponential deceleration `d` per ms. */
export function project(y: number, v: number, d = 0.998): number {
  return y + (v * d) / (1 - d);
}

export function nearest(points: readonly number[], y: number): number {
  let best = points[0]!;
  for (const p of points) if (Math.abs(p - y) < Math.abs(best - y)) best = p;
  return best;
}

/** Resistance past a limit: grows slower the further you pull, never beyond `dim`. */
export function rubberband(overshoot: number, dim: number, c = 0.55): number {
  const sign = Math.sign(overshoot);
  const x = Math.abs(overshoot);
  return sign * (1 - 1 / ((x * c) / dim + 1)) * dim;
}

export interface SpringState {
  x: number; // px
  v: number; // px/s
}

/** One semi-implicit Euler step. dt in seconds. */
export function stepSpring(s: SpringState, target: number, dt: number, p: SpringParams = DEFAULT_SPRING): SpringState {
  const a = (-p.stiffness * (s.x - target) - p.damping * s.v) / p.mass;
  const v = s.v + a * dt;
  return { x: s.x + v * dt, v };
}

export function atRest(s: SpringState, target: number, eps = 0.5): boolean {
  return Math.abs(s.x - target) < eps && Math.abs(s.v) < eps * 10;
}

/** Run the spring to rest at 120 Hz. Returns every frame (for tests and figures). */
export function simulate(
  start: SpringState,
  target: number,
  p: SpringParams = DEFAULT_SPRING,
  maxSeconds = 3,
): SpringState[] {
  const dt = 1 / 120;
  const frames: SpringState[] = [start];
  let s = start;
  for (let i = 0; i < maxSeconds / dt; i++) {
    s = stepSpring(s, target, dt, p);
    frames.push(s);
    if (atRest(s, target)) break;
  }
  return frames;
}
