import { formatOklch, ramp } from '../lib/oklch';
import { uid } from './uid';

/** Tonal mini-demo: one hue slider redraws a 10-step OKLCH ramp with WCAG contrast labels. */
export function mount(root: HTMLElement): void {
  const id = uid('tonal-hue');
  root.innerHTML = `
    <div class="tn">
      <div class="tn-controls">
        <label class="mono" for="${id}">Hue</label>
        <input class="range" id="${id}" type="range" min="0" max="359" step="1" value="264" />
        <output class="mono tn-out" for="${id}">264°</output>
      </div>
      <ol class="tn-ramp" aria-label="Ten-step OKLCH ramp"></ol>
      <p class="tn-code mono"><code></code></p>
    </div>`;

  const input = root.querySelector<HTMLInputElement>('input')!;
  const out = root.querySelector<HTMLOutputElement>('output')!;
  const list = root.querySelector<HTMLOListElement>('.tn-ramp')!;
  const code = root.querySelector<HTMLElement>('.tn-code code')!;

  const tiles = Array.from({ length: 10 }, () => {
    const li = document.createElement('li');
    li.className = 'tn-tile';
    li.innerHTML = '<span class="tn-step"></span><span class="tn-ratio"></span><span class="tn-grade"></span>';
    list.append(li);
    return li;
  });

  const render = () => {
    const hue = Number(input.value);
    out.value = `${hue}°`;
    const swatches = ramp(hue);
    swatches.forEach((s, i) => {
      const li = tiles[i]!;
      li.style.background = s.hex;
      li.style.color = s.text === 'white' ? '#ffffff' : '#16150f';
      li.children[0]!.textContent = String(s.step);
      li.children[1]!.textContent = s.ratio.toFixed(1);
      li.children[2]!.textContent = s.grade === 'AA large' ? 'AA18' : s.grade;
      li.setAttribute(
        'aria-label',
        `Step ${s.step}, ${s.hex}, ${s.text} text at ${s.ratio.toFixed(1)} to 1, ${s.grade}`,
      );
    });
    const mid = swatches[5]!;
    code.textContent = `--h${hue}-500: ${formatOklch(mid.oklch)}; /* ${mid.hex} */`;
  };

  input.addEventListener('input', render);
  render();
}
