/**
 * Serves each partner's logo: as a single-color mark (the default), or,
 * for a partner with `logoMode: grayscale`, as the logo itself in gray.
 *
 * Both are generated at build time from whatever file the partner
 * supplied. A mark is white, with the logo's shape in its alpha channel;
 * PartnerMark.astro uses it as a CSS mask and paints it in the site's own
 * ink. A grayscale logo is shown as an ordinary image. See
 * src/lib/logo-mark.ts for how a logo is reduced.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

import { getPartnerLogoGray, getPartnerMark } from '../../lib/logo-mark';

export const getStaticPaths: GetStaticPaths = async () => {
  const partners = await getCollection('partners');
  return partners
    .filter((p) => p.data.logo)
    .map((p) => ({
      params: { id: p.id },
      props: { logo: p.data.logo, invert: p.data.logoInvert, mode: p.data.logoMode },
    }));
};

export const GET: APIRoute = async ({ props }) => {
  const { png } =
    props.mode === 'grayscale'
      ? await getPartnerLogoGray(props.logo as string)
      : await getPartnerMark(props.logo as string, { invert: props.invert as boolean });

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
