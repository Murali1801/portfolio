---
title: Tab
order: 3
kind: app
stack: [TypeScript, PWA, IndexedDB]
year: 2026
summary: Split bills with friends. No account, no server, works offline.
repo: tab
role: Design and engineering
timeline: November 2026, in progress
demo: tab
demoLabel: Three people, one bill. Type what each person paid.
---

## The problem

Splitwise taught everyone the model: groups, expenses, balances, settle up. Its free tier now limits how many expenses you can add in a day and keeps receipt scanning and charts for Pro. The open-source alternatives drop the paywall but need a server: Spliit runs on Postgres, and ihatemoney and SplitPro are apps you host yourself. Kostos is the closest to offline, with a CRDT in IndexedDB and an encrypted sync relay, but it grows into trips, stats and 153 currencies.

On a trip, the moment you need a bill splitter is often the moment you have no signal.

## The approach

Tab runs entirely on the phone. Data sits in IndexedDB, a service worker caches the app on first load, and it keeps working in airplane mode. To share a group without a server, Tab packs it into the part of the link after the `#`, which browsers never send to a server, or into a QR code.

Money is stored as whole paise. When ₹1,000 splits three ways, somebody carries the extra paisa, and Tab picks who in a fixed order, so every phone in the group computes the same answer.

Settle-up starts greedy: whoever owes the most pays whoever is owed the most, and repeat. For five people that takes at most four payments, and in general one fewer than the number of people. For small groups, an exact pass then looks for subgroups whose balances already cancel out, which can remove more payments. The screen says "fewer payments" only when it has actually computed that.

<figure class="bleed">
  <img class="only-light" src="/media/tab-settle-light.svg" width="1200" height="460" loading="lazy" decoding="async" alt="Receipt-style list of five people's balances on the left and the greedy settle-up payments on the right.">
  <img class="only-dark" src="/media/tab-settle-dark.svg" width="1200" height="460" loading="lazy" decoding="async" alt="Receipt-style list of five people's balances on the left and the greedy settle-up payments on the right.">
  <figcaption>A sample group of five after a weekend. Balances and payments are computed by the settle-up function used in the demo.</figcaption>
</figure>

Each payment line gets a UPI button for Indian users, and the settle-up screen exports as a receipt image to send on WhatsApp.

## What is hard

The true minimum number of payments is an NP-hard problem, so the exact pass runs only for groups of twelve or fewer and the greedy answer covers the rest.

Sync without a server. Version one shares snapshots through links. Real two-way sync means a CRDT, and that comes later, only if snapshots turn out to be too limiting in use.

## Where it is now

Being built, with a target under 100 kB. The calculator above is the settle-up core in miniature: an equal split in paise and greedy payments. The add-expense and settle-up panels in the app will use Sheet.
