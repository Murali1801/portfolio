---
title: Portfolio
order: 5
kind: template
stack: [Astro, TypeScript, CSS]
year: 2026
summary: A case-study-first portfolio template for developers who ship things. Astro, zero JS by default.
repo: portfolio
role: Design and engineering
timeline: November 2026, v0.1.0
demo: grid
demoLabel: Spec mode, the grid behind every page
---

## The problem

The developer portfolio templates with the most stars are showing their age. Brittany Chiang's v4 is well made and has been cloned so often that its navy and mint now read as a template, and Gatsby, which it runs on, has mostly been left behind. Many popular React templates ship a whole framework runtime for a page that is mostly text. Few treat the project as the main content: you get a card, a screenshot and a link away.

## The approach

This site is the template. Projects are Markdown files in a content collection with typed frontmatter, so a missing year or an unknown kind fails the build instead of shipping. The home page is an index table, and each row opens in place into a live demo of that project. Case studies are one 680 px column with full-bleed breaks for media.

It ships zero JavaScript by default. Demos are islands that load only when you open a row or scroll a case study's demo into view. The clock, the theme switch and spec mode are a few small scripts. GitHub star counts are fetched once at build time and printed as plain text. Offline, or for a repo that does not exist yet, the row says "new" and the build carries on.

Restyling takes two files: `site.config.ts` for your name, links and copy, and `src/styles/theme.css` for colours, type, spacing and motion.

<figure class="bleed">
  <img class="only-light" src="/media/portfolio-grid-light.svg" width="1200" height="460" loading="lazy" decoding="async" alt="Wireframe of the home page with the 12-column grid and 8 pixel baseline drawn over it in blue hairlines.">
  <img class="only-dark" src="/media/portfolio-grid-dark.svg" width="1200" height="460" loading="lazy" decoding="async" alt="Wireframe of the home page with the 12-column grid and 8 pixel baseline drawn over it in blue hairlines.">
  <figcaption>The home page on its grid. Press G on any page to see the real one.</figcaption>
</figure>

## What is hard

Staying zero-JS without feeling static. The rows expand with a CSS `grid-template-rows` transition, so the only script is the toggle, and demo code is fetched on first open. With JavaScript off, every row shows its summary and links, so nothing is locked away.

Restraint. A template is tempting to fill with options. This one has one layout and two files to edit, on purpose.

## Where it is now

Version 0.1.0, and you are looking at it. Fork it, edit two files and write your projects in Markdown.
