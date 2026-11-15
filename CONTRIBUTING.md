# Contributing

Thanks for helping with the portfolio template, a case-study-first Astro portfolio template that ships zero JS by default. Issues, ideas and pull requests are all welcome.

## Getting started

You need Node 22.18 or newer.

```bash
git clone https://github.com/Murali1801/portfolio.git
cd portfolio
npm install
npm run dev
```

Before you open a pull request:

```bash
npm test
npm run build
```

Both run in CI on every pull request.

## Where things live

- `src/content/projects/` holds one Markdown file per project, typed by `src/content.config.ts`.
- `src/demos/` has the small live demos that load when an index row opens.
- `site.config.ts` and `src/styles/theme.css` are the two files people edit to make it theirs.

## Project rules

- Pages must stay zero JS by default; scripts only for islands that need them.
- Anything a forker would change belongs in `site.config.ts` or `theme.css`, not hard-coded.
- Keep Lighthouse scores where they are; mention the before and after in the PR if you touch layout or fonts.

## Good first issues

Issues labelled [good first issue](https://github.com/Murali1801/portfolio/labels/good%20first%20issue) are small and self-contained. Comment on one before you start so two people don't pick the same thing.

## Pull requests

- One change per pull request, with a short description of what and why.
- Add or update tests when you change logic.
- Screenshots or a short screen recording help for anything visual.

## Code of conduct

Be kind and assume good intent. Harassment or personal attacks aren't tolerated.
