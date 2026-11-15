/** Unique ids for labels inside demos (several can live on one page). */
let n = 0;
export const uid = (p: string): string => `${p}-${++n}`;

export const reducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
