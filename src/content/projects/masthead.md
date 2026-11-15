---
title: Masthead
order: 4
kind: tool
stack: [TypeScript, SVG, CSS animation]
year: 2026
summary: Design animated SVG banners for your GitHub README. No server, your fonts, light and dark.
repo: masthead
role: Design and engineering
timeline: November 2026, in progress
demo: masthead
demoLabel: One SVG string. Edit the title, switch the theme, pause it.
---

## The problem

README banners are popular and fragile. capsule-render and readme-typing-svg draw your image on a hosted server, so your profile depends on someone else's uptime and quota, and capsule-render's own README calls its public instance best-effort. The fonts are whatever the server has, characters like `#` and `&` break the URL, and dark mode is an afterthought.

## The approach

Masthead runs in your browser and hands you files. Pick a template, edit the text, font and timing, then download two SVGs, one for light and one for dark, plus the `<picture>` snippet that swaps them with GitHub's theme. You commit the files to your own repo, so nothing is hot-linked and nothing goes down.

GitHub shows README images through a proxy with strict rules: no JavaScript, and no external fonts or images inside the SVG. So Masthead converts your text to outlines from the Google Font you picked, and all motion is CSS keyframes inside the file. Every file carries a `prefers-reduced-motion` rule, which still works inside an `<img>`.

<figure class="bleed">
  <img class="only-light" src="/media/masthead-frames-light.svg" width="1200" height="460" loading="lazy" decoding="async" alt="Four frames of one banner: grid lines drawing in, then the title rising into place, then the subtitle and a yellow block cursor.">
  <img class="only-dark" src="/media/masthead-frames-dark.svg" width="1200" height="460" loading="lazy" decoding="async" alt="Four frames of one banner: grid lines drawing in, then the title rising into place, then the subtitle and a yellow block cursor.">
  <figcaption>Frames at 0, 35, 65 and 100% of the intro, rendered by the banner function from the demo.</figcaption>
</figure>

## What is hard

Timing without JavaScript. Masthead's editor has a timeline scrubber that pauses the CSS animations and drives them with a negative `animation-delay`, so dragging the playhead shows the exact frame GitHub will show.

File size. Outlined text grows fast with long titles and ornate fonts. Under the preview, a live check lists what GitHub needs: no script, fonts outlined, size under 50 kB, a dark variant, alt text and a reduced-motion rule.

## Where it is now

Being built. The banner in the demo above comes from a small function that follows the same rules: one SVG string, CSS keyframes, a reduced-motion rule and no external references. It uses live text where Masthead will use outlines.
