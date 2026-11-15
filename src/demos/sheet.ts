import { DEFAULT_SPRING, atRest, nearest, project, rubberband, stepSpring, velocity, type Sample } from '../lib/spring';
import { reducedMotion } from './uid';

const SNAPS = [0.25, 0.6, 0.92]; // visible fraction of the stage
const NAMES = ['25% open', '60% open', '92% open'];

/** Sheet mini-demo: a card you can drag or flick; it springs to the snap point the throw points at. */
export function mount(root: HTMLElement): void {
  root.innerHTML = `
    <div class="sh">
      <div class="sh-stage">
        <div class="sh-page" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
        <div class="sh-ruler" aria-hidden="true">
          ${SNAPS.map(() => '<i class="sh-tick"></i>').join('')}
          <i class="sh-proj"></i>
        </div>
        <div class="sh-sheet">
          <div class="sh-grab" role="slider" tabindex="0" aria-orientation="vertical"
            aria-label="Sheet position" aria-valuemin="1" aria-valuemax="3" aria-valuenow="2" aria-valuetext="${NAMES[1]}">
            <span class="sh-pill"></span>
          </div>
          <div class="sh-body">
            <p class="sh-title">Bottom sheet</p>
            <p class="mono muted">Snap points 25 · 60 · 92%</p>
            <span class="sh-line"></span><span class="sh-line short"></span><span class="sh-line"></span>
          </div>
        </div>
      </div>
      <p class="sh-readout mono" aria-live="polite">Drag or flick the card. Arrow keys move between snap points.</p>
    </div>`;

  const stage = root.querySelector<HTMLElement>('.sh-stage')!;
  const sheet = root.querySelector<HTMLElement>('.sh-sheet')!;
  const grab = root.querySelector<HTMLElement>('.sh-grab')!;
  const ticks = [...root.querySelectorAll<HTMLElement>('.sh-tick')];
  const projTick = root.querySelector<HTMLElement>('.sh-proj')!;
  const readout = root.querySelector<HTMLElement>('.sh-readout')!;

  let H = stage.clientHeight || 360;
  let y = 0;
  let snapIndex = 1;
  let raf = 0;

  const snapY = () => SNAPS.map((f) => H * (1 - f));
  const pct = (py: number) => Math.round((1 - py / H) * 100);
  const place = (py: number) => {
    y = py;
    sheet.style.transform = `translate3d(0, ${py.toFixed(2)}px, 0)`;
  };
  const layout = () => {
    H = stage.clientHeight || 360;
    snapY().forEach((sy, i) => (ticks[i]!.style.transform = `translateY(${sy}px)`));
    cancelAnimationFrame(raf);
    place(snapY()[snapIndex]!);
  };

  const setAria = () => {
    grab.setAttribute('aria-valuenow', String(snapIndex + 1));
    grab.setAttribute('aria-valuetext', NAMES[snapIndex]!);
  };

  const springTo = (target: number, v0PxPerMs: number) => {
    cancelAnimationFrame(raf);
    snapIndex = snapY().indexOf(target);
    setAria();
    if (reducedMotion()) {
      place(target);
      return;
    }
    let state = { x: y, v: v0PxPerMs * 1000 };
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      state = stepSpring(state, target, dt, DEFAULT_SPRING);
      place(state.x);
      if (atRest(state, target)) place(target);
      else raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  };

  // Pointer drag with velocity sampling.
  let dragging = false;
  let startPointer = 0;
  let startY = 0;
  let samples: Sample[] = [];

  sheet.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true;
    cancelAnimationFrame(raf);
    sheet.setPointerCapture(e.pointerId);
    startPointer = e.clientY;
    startY = y;
    samples = [{ t: e.timeStamp, y }];
    projTick.classList.remove('is-on');
    sheet.classList.add('is-dragging');
  });

  sheet.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const ys = snapY();
    const minY = ys[2]!;
    const maxY = ys[0]!;
    let raw = startY + (e.clientY - startPointer);
    if (raw < minY) raw = minY - rubberband(minY - raw, H);
    else if (raw > maxY) raw = maxY + rubberband(raw - maxY, H);
    place(raw);
    samples.push({ t: e.timeStamp, y: raw });
    if (samples.length > 30) samples.shift();
  });

  const release = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    sheet.classList.remove('is-dragging');
    if (sheet.hasPointerCapture(e.pointerId)) sheet.releasePointerCapture(e.pointerId);
    const v = velocity(samples);
    const proj = project(y, v);
    const target = nearest(snapY(), proj);
    const shown = Math.min(Math.max(proj, 0), H);
    projTick.style.transform = `translateY(${shown}px)`;
    projTick.classList.add('is-on');
    readout.textContent = `v = ${Math.abs(v).toFixed(2)} px/ms ${v < 0 ? 'up' : v > 0 ? 'down' : ''} · projected ${pct(proj)}% · lands at ${pct(target)}%`;
    springTo(target, v);
  };
  sheet.addEventListener('pointerup', release);
  sheet.addEventListener('pointercancel', release);

  grab.addEventListener('keydown', (e) => {
    let next = snapIndex;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') next = Math.min(2, snapIndex + 1);
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') next = Math.max(0, snapIndex - 1);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = 2;
    else if (e.key === 'Enter' || e.key === ' ') next = (snapIndex + 1) % 3;
    else return;
    e.preventDefault();
    projTick.classList.remove('is-on');
    readout.textContent = `Keyboard · lands at ${Math.round(SNAPS[next]! * 100)}%`;
    springTo(snapY()[next]!, 0);
  });

  new ResizeObserver(layout).observe(stage);
  layout();
}
