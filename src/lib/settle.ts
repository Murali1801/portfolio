/** Tab mini-demo: money as integer paise, equal split, greedy settle-up. */

export interface Transfer {
  from: number;
  to: number;
  amount: number; // paise
}

/** Split `total` paise into `n` parts that differ by at most 1 paisa. Extra paise go to the first people. */
export function splitEqual(total: number, n: number): number[] {
  if (n <= 0) return [];
  const base = Math.floor(total / n);
  const extra = total - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < extra ? 1 : 0));
}

/** Positive = is owed money, negative = owes money. Sums to zero. */
export function balances(paid: number[], shares: number[]): number[] {
  return paid.map((p, i) => p - (shares[i] ?? 0));
}

/** Largest debtor pays largest creditor until everyone is square. At most n - 1 transfers. */
export function settle(bal: number[]): Transfer[] {
  const people = bal.map((amount, i) => ({ i, amount }));
  const out: Transfer[] = [];
  for (let guard = 0; guard < bal.length * 2; guard++) {
    const creditors = people.filter((d) => d.amount > 0).sort((a, b) => b.amount - a.amount || a.i - b.i);
    const debtors = people.filter((d) => d.amount < 0).sort((a, b) => a.amount - b.amount || a.i - b.i);
    const c = creditors[0];
    const d = debtors[0];
    if (!c || !d) break;
    const amount = Math.min(c.amount, -d.amount);
    out.push({ from: d.i, to: c.i, amount });
    c.amount -= amount;
    d.amount += amount;
  }
  return out;
}

/** Parse a rupee amount typed by a person ("1,200.5") into paise. Invalid or negative input is 0. */
export function toPaise(input: string): number {
  const n = Number(input.replace(/[,\s₹]/g, ''));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

export function formatINR(paise: number): string {
  const rupees = paise / 100;
  const frac = paise % 100 !== 0;
  return '₹' + rupees.toLocaleString('en-IN', { minimumFractionDigits: frac ? 2 : 0, maximumFractionDigits: 2 });
}

export function splitAndSettle(paid: number[]) {
  const total = paid.reduce((a, b) => a + b, 0);
  const shares = splitEqual(total, paid.length);
  const bal = balances(paid, shares);
  return { total, shares, balances: bal, transfers: settle(bal) };
}
