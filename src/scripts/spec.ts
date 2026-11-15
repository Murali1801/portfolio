/** Spec mode: a 12-column grid + 8px baseline overlay. Toggle with G or any [data-spec-toggle]. */

const KEY = 'spec';
const root = document.documentElement;

export function isSpecOn(): boolean {
  return root.hasAttribute('data-spec');
}

export function setSpec(on: boolean): void {
  root.toggleAttribute('data-spec', on);
  try {
    sessionStorage.setItem(KEY, on ? '1' : '0');
  } catch {}
  document.querySelectorAll('[data-spec-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(on)));
  window.dispatchEvent(new CustomEvent('spec:change', { detail: { on } }));
}

export function toggleSpec(): void {
  setSpec(!isSpecOn());
}

let ready = false;

export function initSpec(): void {
  if (ready) return;
  ready = true;
  let stored = false;
  try {
    stored = sessionStorage.getItem(KEY) === '1';
  } catch {}
  if (stored) setSpec(true);

  document.addEventListener('click', (e) => {
    const t = (e.target as Element | null)?.closest('[data-spec-toggle]');
    if (t) toggleSpec();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'g' && e.key !== 'G') return;
    if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
    const el = e.target as HTMLElement | null;
    if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
    toggleSpec();
  });
}
