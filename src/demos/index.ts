/**
 * Demo registry. Each demo is a tiny standalone module that exports mount(el).
 * Modules are fetched on demand, so pages ship no demo code until a demo is opened.
 * To add your own: create src/demos/<name>.ts, register it here and in DEMOS (src/content.config.ts).
 */

type Mount = (el: HTMLElement) => void;

const loaders: Record<string, () => Promise<{ mount: Mount }>> = {
  tonal: () => import('./tonal'),
  sheet: () => import('./sheet'),
  tab: () => import('./tab'),
  masthead: () => import('./masthead'),
  grid: () => import('./grid'),
};

export async function mountDemo(el: HTMLElement): Promise<void> {
  if (el.dataset.mounted) return;
  const key = el.dataset.demo ?? '';
  const load = loaders[key];
  if (!load) return;
  el.dataset.mounted = 'loading';
  el.setAttribute('aria-busy', 'true');
  try {
    const mod = await load();
    el.replaceChildren();
    mod.mount(el);
    el.dataset.mounted = 'true';
  } catch {
    el.dataset.mounted = '';
    const p = el.querySelector('[data-demo-fallback]');
    if (p) p.textContent = 'The demo could not load. Check your connection and open the row again.';
  } finally {
    el.removeAttribute('aria-busy');
  }
}
