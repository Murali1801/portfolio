import { bannerSvg, byteSize } from '../lib/banner';
import { uid } from './uid';

/** Masthead mini-demo: an animated SVG banner preview with title, theme and play/pause. */
export function mount(root: HTMLElement): void {
  const id = uid('mh');
  const field = uid('mh-title');
  root.innerHTML = `
    <div class="mh">
      <div class="mh-frame" data-mode="light"></div>
      <div class="mh-controls">
        <div class="mh-field">
          <label class="mono" for="${field}">Title</label>
          <input id="${field}" value="Masthead" maxlength="20" autocomplete="off" spellcheck="false" />
        </div>
        <div class="mh-seg" role="group" aria-label="Preview theme">
          <button type="button" aria-pressed="true" data-mode="light">Light</button>
          <button type="button" aria-pressed="false" data-mode="dark">Dark</button>
        </div>
        <button type="button" class="mh-btn" aria-pressed="false" data-play>Pause</button>
        <button type="button" class="mh-btn" data-replay>Replay</button>
      </div>
      <p class="mh-size mono muted" aria-live="polite"></p>
    </div>`;

  const frame = root.querySelector<HTMLElement>('.mh-frame')!;
  const input = root.querySelector<HTMLInputElement>('input')!;
  const modes = [...root.querySelectorAll<HTMLButtonElement>('.mh-seg button')];
  const play = root.querySelector<HTMLButtonElement>('[data-play]')!;
  const replay = root.querySelector<HTMLButtonElement>('[data-replay]')!;
  const size = root.querySelector<HTMLElement>('.mh-size')!;

  let mode: 'light' | 'dark' = 'light';
  let paused = false;
  let timer = 0;

  const render = () => {
    const svg = bannerSvg({ title: input.value, subtitle: 'README BANNER · LIGHT + DARK', theme: mode, id });
    frame.innerHTML = svg;
    frame.dataset.mode = mode;
    // Place the block cursor right after the real rendered title.
    const text = frame.querySelector<SVGTextElement>('text');
    const cursor = frame.querySelector<SVGRectElement>(`.${id}-c`);
    if (text && cursor) {
      const fit = () => {
        try {
          const box = text.getBBox();
          if (box.width) cursor.setAttribute('x', String(Math.min(840 - 70, box.x + box.width + 10)));
        } catch {}
      };
      fit();
      document.fonts?.ready.then(fit);
    }
    size.textContent = `${(byteSize(svg) / 1024).toFixed(1)} kB · one file · no script · no external fonts or images`;
  };

  const setPaused = (p: boolean) => {
    paused = p;
    frame.classList.toggle('is-paused', p);
    play.setAttribute('aria-pressed', String(p));
    play.textContent = p ? 'Play' : 'Pause';
  };

  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = window.setTimeout(render, 250);
  });
  modes.forEach((b) =>
    b.addEventListener('click', () => {
      mode = b.dataset.mode as 'light' | 'dark';
      modes.forEach((m) => m.setAttribute('aria-pressed', String(m === b)));
      render();
    }),
  );
  play.addEventListener('click', () => setPaused(!paused));
  replay.addEventListener('click', () => {
    render();
    setPaused(false);
  });

  render();
}
