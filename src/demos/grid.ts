import { initSpec, isSpecOn } from '../scripts/spec';

/** Portfolio mini-demo: turns spec mode on and reports the grid it draws. */
export function mount(root: HTMLElement): void {
  initSpec();
  root.innerHTML = `
    <div class="gd">
      <p class="gd-copy">Every page sits on a 12-column grid and an 8px baseline. Turn it on and check the alignment yourself.</p>
      <button type="button" class="gd-btn" aria-pressed="false" data-spec-toggle>
        <span class="gd-state"></span>
      </button>
      <dl class="gd-specs mono">
        <div><dt>Columns</dt><dd data-k="cols"></dd></div>
        <div><dt>Column</dt><dd data-k="col"></dd></div>
        <div><dt>Gutter</dt><dd data-k="gap"></dd></div>
        <div><dt>Baseline</dt><dd>8px</dd></div>
      </dl>
      <p class="mono muted">Shortcut: <kbd>G</kbd> on any page.</p>
    </div>`;

  const btn = root.querySelector<HTMLButtonElement>('.gd-btn')!;
  const state = root.querySelector<HTMLElement>('.gd-state')!;
  const out = (k: string) => root.querySelector<HTMLElement>(`[data-k="${k}"]`)!;

  const sync = () => {
    const on = isSpecOn();
    btn.setAttribute('aria-pressed', String(on));
    state.textContent = on ? 'Turn off spec mode' : 'Turn on spec mode';
  };

  const measure = () => {
    const cols = [...document.querySelectorAll<HTMLElement>('.spec-col')].filter((c) => c.offsetWidth > 0);
    const first = cols[0];
    const second = cols[1];
    if (!first) return;
    const a = first.getBoundingClientRect();
    out('cols').textContent = String(cols.length);
    out('col').textContent = `${a.width.toFixed(1)}px`;
    out('gap').textContent = second ? `${(second.getBoundingClientRect().left - a.right).toFixed(0)}px` : '0px';
  };

  window.addEventListener('spec:change', sync);
  new ResizeObserver(measure).observe(document.body);
  sync();
  measure();
}
