/**
 * site.config.ts: everything personal lives here.
 * Fork the template, edit this file and src/styles/theme.css, then write
 * your projects in src/content/projects/*.md.
 */

export const site = {
  /** Production URL, used for the sitemap, canonical links and OG tags. */
  url: 'https://portfolio.vercel.app', // TODO: replace with the real deploy URL

  /** Full name: the large heading on the home page. */
  name: 'Muralidhar Acharya',
  /** Short name: header, footer signature, page titles. */
  shortName: 'Murali',
  role: 'Web and app developer',
  location: 'India',

  /** The one honest line under your name. */
  intro:
    'I design and build websites and mobile apps. Currently: open-source tools for colour, UI and READMEs.',

  /** Meta description for search results and link previews. */
  description:
    'Muralidhar Acharya, web and app developer in India. Case studies and live demos of open-source tools for colour, UI and READMEs.',

  /** Local clock in the first screen. Any IANA zone works. */
  timeZone: 'Asia/Kolkata',
  timeZoneLabel: 'IST',

  /** Copy-email button in the footer. Leave empty to hide it. */
  email: '' as string,

  github: {
    user: 'Murali1801',
    /** Repo that holds this site, for the footer "source" link. */
    repo: 'portfolio',
  },

  /** Avatar in the about block (public/ path). Set to null to hide it. */
  avatar: { src: '/avatar.png', alt: 'Pixel-art black cat in a cobalt hoodie, typing on a laptop', pixelated: true },

  about: {
    heading: 'About',
    paragraphs: [
      'I am Murali, a web and app developer based in India. I build storefronts, marketing sites, dashboards and mobile apps, mostly for small direct-to-consumer brands.',
      'Client work taught me to care about pages that load fast, read well on a cheap phone and can be edited by the owner without calling me. The tools on this page are the ones I kept wishing existed while doing that work.',
    ],
    stack: [
      'TypeScript',
      'React',
      'Next.js',
      'Tailwind CSS',
      'Firebase',
      'Supabase',
      'Python',
      'React Native / Expo',
      'Liquid / Shopify',
    ],
  },

  stars: {
    /** Fetch GitHub star counts at build time. Falls back to "new" when offline or the repo is missing. */
    fetch: true,
    timeoutMs: 4000,
  },
} as const;

/** Live demo URL for a project repo. Frontmatter `live` overrides it. */
export function liveUrl(repo: string): string {
  return `https://${repo}.vercel.app`; // TODO: placeholder until each project is deployed
}

export function repoUrl(repo: string): string {
  return `https://github.com/${site.github.user}/${repo}`;
}

export type SiteConfig = typeof site;
