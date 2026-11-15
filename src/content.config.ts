import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Live mini-demos that can open inside an index row. Add your own in src/demos/. */
export const DEMOS = ['tonal', 'sheet', 'tab', 'masthead', 'grid', 'none'] as const;

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    /** Position in the index (1 = first row). */
    order: z.number().int().positive(),
    kind: z.enum(['tool', 'library', 'app', 'template', 'site', 'client']),
    stack: z.array(z.string()).min(1),
    year: z.number().int(),
    /** One line for the index panel and the case-study lede. */
    summary: z.string().max(220),
    /** GitHub repo name under site.config github.user. Used for stars and the source link. */
    repo: z.string().optional(),
    /** Overrides the liveUrl() helper in site.config.ts. Set to false for no live link. */
    live: z.union([z.url(), z.literal(false)]).optional(),
    role: z.string(),
    timeline: z.string(),
    /** Static status instead of the star count, e.g. "live" or "npm". */
    status: z.string().optional(),
    demo: z.enum(DEMOS).default('none'),
    /** Caption above the live demo. */
    demoLabel: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects };
