---
title: Tonal
order: 1
kind: tool
stack: [TypeScript, Vite, OKLCH]
year: 2026
summary: Build accessible OKLCH colour scales and export them to CSS, Tailwind v4 and design tokens. Runs in your browser.
repo: tonal
role: Design and engineering
timeline: November 2026, in progress
demo: tonal
demoLabel: Hue slider, OKLCH ramp, WCAG contrast per step
---

## The problem

Most palette generators still think in HSL. In HSL, a yellow and a blue at "50% lightness" look nothing alike: the yellow is close to white to the eye and the blue is close to navy. Build a scale by stepping HSL lightness and step 500 passes contrast for one hue and fails for the next. You find out when a button ships unreadable.

The tools that get this right each cover one slice. oklch.com explains a single colour very well. Leonardo solves lightness from target contrast ratios. Radix gives every step a job. Huetone prints contrast per swatch. None of them puts OKLCH ramps, equal lightness across hues, a WCAG and APCA matrix, P3 gamut and Tailwind v4 export on one static page that needs no login.

<figure class="bleed">
  <img class="only-light" src="/media/tonal-hues-light.svg" width="1200" height="460" loading="lazy" decoding="async" alt="Two rows of twelve hues. The HSL row, all at 50% lightness, swings from 1.2 to 8.9 contrast against white. The OKLCH row, all at the same L, stays between 3.4 and 3.9.">
  <img class="only-dark" src="/media/tonal-hues-dark.svg" width="1200" height="460" loading="lazy" decoding="async" alt="Two rows of twelve hues. The HSL row, all at 50% lightness, swings from 1.2 to 8.9 contrast against white. The OKLCH row, all at the same L, stays between 3.4 and 3.9.">
  <figcaption>Same "lightness", twelve hues. The number under each swatch is its WCAG contrast against white, computed for this page.</figcaption>
</figure>

## The approach

Tonal works in OKLCH, where L tracks perceived lightness. Every hue in a palette shares one lightness curve, so step 500 of red, green and blue sits at the same perceived lightness and close to the same contrast. Chroma follows its own curve and is pulled back into sRGB per swatch, with lightness and hue held fixed, so the colour on screen is the colour you export.

The main screen is a matrix: hues as rows, steps as columns, no gaps. Each tile prints its L, C and H and a contrast badge. Hover or focus a tile and every other tile shows its contrast against that one, so "which text step works on this background?" takes one gesture instead of a spreadsheet. Steps carry roles borrowed from Radix (backgrounds, borders, solids, text), so the export says what each value is for.

The whole palette lives in the URL hash. No account, no backend: a link is the save file.

## What is hard

Gamut mapping is a trade. Lowering chroma keeps lightness honest, but a saturated yellow at step 300 loses most of its colour in sRGB. Tonal shows the P3 value next to the clipped sRGB fallback, marked with a hatched corner, instead of hiding the loss.

WCAG 2 contrast and APCA disagree, most of all on dark backgrounds and mid tones. Tonal shows both and lets you choose which one drives the badges, rather than declaring one of them right.

## Where it is now

Being built. The first release covers the matrix, the contrast lens and export to CSS variables, Tailwind v4 `@theme` and DTCG JSON. The same engine as an npm package with a CLI comes after that. The slider above runs a small version of the ramp maths, written for this page.
