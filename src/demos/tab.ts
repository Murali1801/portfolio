import { formatINR, splitAndSettle, toPaise } from '../lib/settle';
import { uid } from './uid';

const PEOPLE = [
  { name: 'Asha', paid: '3000' },
  { name: 'Ravi', paid: '450' },
  { name: 'Kiran', paid: '0' },
];

/** Tab mini-demo: three people, what each paid, the equal share and the fewest settle-up lines. */
export function mount(root: HTMLElement): void {
  const rows = PEOPLE.map((p, i) => {
    const n = uid('tab-name');
    const a = uid('tab-paid');
    return `
      <div class="tb-person">
        <label class="sr-only" for="${n}">Person ${i + 1} name</label>
        <input class="tb-name" id="${n}" value="${p.name}" maxlength="12" autocomplete="off" spellcheck="false" />
        <label class="sr-only" for="${a}">Person ${i + 1} paid, in rupees</label>
        <span class="tb-amt"><span aria-hidden="true">₹</span><input id="${a}" value="${p.paid}" inputmode="decimal" autocomplete="off" /></span>
      </div>`;
  }).join('');

  root.innerHTML = `
    <div class="tb">
      <div class="tb-people">
        <p class="mono muted tb-cap" aria-hidden="true"><span>Name</span><span>Paid</span></p>
        ${rows}
      </div>
      <div class="tb-receipt">
        <p class="tb-line"><span>Total</span><span class="tb-dots"></span><span data-total></span></p>
        <p class="tb-line"><span>Each</span><span class="tb-dots"></span><span data-each></span></p>
        <p class="tb-head mono">Settle up</p>
        <ul class="tb-transfers" aria-live="polite"></ul>
      </div>
    </div>`;

  const names = [...root.querySelectorAll<HTMLInputElement>('.tb-name')];
  const amounts = [...root.querySelectorAll<HTMLInputElement>('.tb-amt input')];
  const total = root.querySelector<HTMLElement>('[data-total]')!;
  const each = root.querySelector<HTMLElement>('[data-each]')!;
  const list = root.querySelector<HTMLUListElement>('.tb-transfers')!;

  const render = () => {
    const label = (i: number) => names[i]!.value.trim() || `Person ${i + 1}`;
    const paid = amounts.map((el) => toPaise(el.value));
    amounts.forEach((el) => el.setAttribute('aria-invalid', String(!/^\s*₹?\s*[\d,]*\.?\d*\s*$/.test(el.value))));
    const r = splitAndSettle(paid);
    total.textContent = formatINR(r.total);
    const lo = Math.min(...r.shares);
    const hi = Math.max(...r.shares);
    each.textContent = lo === hi ? formatINR(lo) : `${formatINR(lo)} or ${formatINR(hi)}`;
    list.replaceChildren(
      ...(r.transfers.length
        ? r.transfers.map((t) => {
            const li = document.createElement('li');
            li.className = 'tb-line';
            const who = document.createElement('span');
            who.textContent = `${label(t.from)} → ${label(t.to)}`;
            const dots = document.createElement('span');
            dots.className = 'tb-dots';
            const amt = document.createElement('span');
            amt.textContent = formatINR(t.amount);
            li.append(who, dots, amt);
            return li;
          })
        : [Object.assign(document.createElement('li'), { className: 'tb-square', textContent: 'All square. Nobody owes anything.' })]),
    );
  };

  root.addEventListener('input', render);
  render();
}
