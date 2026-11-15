---
title: Sheet
order: 2
kind: library
stack: [TypeScript, Web Components, Pointer Events]
year: 2026
summary: A zero-dependency bottom-sheet Web Component with real flick physics, snap points and an accessible dialog.
repo: sheet
role: Design and engineering
timeline: November 2026, in progress
demo: sheet
demoLabel: Drag the card or flick it. Arrow keys work too.
---

## The problem

The bottom sheet is the most common mobile pattern the web still does badly. The best-known drawer, Vaul, feels right, but it is React-only and its README now says the repo is unmaintained. The closest Web Component, pure-web-bottom-sheet, is clever: it rides on CSS scroll snap and scroll-driven animations. That also sets its limits. The browser decides where a flick lands, there is no spring to tune, and it needs Safari 18.2 or newer.

If you write plain HTML, Astro, Svelte or Vue, the choice today is pulling in React for one drawer or living with a sheet that feels slightly off.

## The approach

Sheet is one custom element, `<bottom-sheet>`, with no dependencies. Snap points are an attribute (`snap="25% 60% 100%"`), and so are the spring settings. It opens inside a native `<dialog>`, which brings the top layer, Esc to close and a focus trap for free, and the page behind it becomes `inert`.

The feel comes from three small pieces of maths. While you drag, it keeps the last 100 ms of pointer samples and measures velocity. On release it projects where the throw would come to rest under iOS-style deceleration, and picks the snap point nearest that projected spot, not the spot where your finger let go. A damped spring then carries the sheet there, starting at your release velocity so there is no jolt. Past the top or bottom it rubber-bands instead of stopping dead.

<figure class="bleed">
  <img class="only-light" src="/media/sheet-projection-light.svg" width="1200" height="460" loading="lazy" decoding="async" alt="Chart of sheet position over time. The finger lets go between two snap points, the projected rest point lies past the next one, and the spring curve settles on that snap point.">
  <img class="only-dark" src="/media/sheet-projection-dark.svg" width="1200" height="460" loading="lazy" decoding="async" alt="Chart of sheet position over time. The finger lets go between two snap points, the projected rest point lies past the next one, and the spring curve settles on that snap point.">
  <figcaption>A flick released at 40% open and 0.3 px/ms, simulated with the same spring as the demo (stiffness 400, damping 40). The release point is closer to 25%, but the projection points past 60%, so that is where it lands.</figcaption>
</figure>

## What is hard

Nested scrolling. A list inside the sheet should scroll, but a downward drag at the top of that list should move the sheet. Sheet takes the gesture only when the content is scrolled to the top and the drag goes down, or when the sheet is not yet at its highest snap point. Getting this wrong is the main reason web sheets feel broken.

The on-screen keyboard is the other one. The sheet listens to `visualViewport`, so a focused input is never hidden behind the keyboard.

## Where it is now

Being built, with a size target under 6 kB gzipped. The demo above uses the same formulas, written small for this page. The docs site will print velocity and the projected landing point live while you drag, so you can see why the sheet lands where it does.
