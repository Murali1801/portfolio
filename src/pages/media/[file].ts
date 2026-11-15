import type { APIRoute, GetStaticPaths } from 'astro';
import { FIGURES, type Theme } from '../../lib/figures';

export const getStaticPaths = (() =>
  Object.keys(FIGURES).flatMap((name) =>
    (['light', 'dark'] as Theme[]).map((theme) => ({
      params: { file: `${name}-${theme}.svg` },
      props: { name, theme },
    })),
  )) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const { name, theme } = props as { name: keyof typeof FIGURES; theme: Theme };
  return new Response(FIGURES[name](theme), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
};
