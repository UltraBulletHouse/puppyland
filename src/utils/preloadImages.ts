// Lightweight image and icon preloader to avoid first-use flicker
// Uses the same URL resolution helpers as components so paths match Vite bundling

import { getImagePngUrl } from './getImage';

let preloadedBitmaps: HTMLImageElement[] = [];

export function preloadPngBadges(names: string[]) {
  try {
    names.forEach((name) => {
      const src = getImagePngUrl(name);
      const img = new Image();
      // Hint lower priority; these are small but not critical
      (img as any).fetchpriority = 'low';
      img.decoding = 'async';
      img.src = src;
      // Keep a reference so the GC doesn't collect before decode finishes
      preloadedBitmaps.push(img);
      // Trigger decode to avoid paint hitch on first display
      if ('decode' in img) {
        (img as any).decode?.().catch(() => {});
      }
    });
  } catch {}
}

// Preload every PNG inside assets/icons-png via Vite's glob import
export function preloadAllPngBadges() {
  try {
    // The 'as: "url"' option returns resolved URLs for the files
    const files = import.meta.glob('../assets/icons-png/*.png', {
      eager: true,
      as: 'url',
    }) as Record<string, string>;
    const urls = Object.values(files);
    urls.forEach((src) => {
      const img = new Image();
      (img as any).fetchpriority = 'low';
      img.decoding = 'async';
      img.src = src;
      preloadedBitmaps.push(img);
      if ('decode' in img) (img as any).decode?.().catch(() => {});
    });
  } catch {}
}

// Shoelace icon files are copied to /shoelace/assets/icons by Vite (vite.config.mts)
// Warm the HTTP cache by fetching a curated list of icons we use frequently.
export async function preloadShoelaceIcons(names: string[]) {
  const base = (import.meta.env.BASE_URL || '/') + 'shoelace/assets/icons/';
  await Promise.all(
    names.map(async (n) => {
      try {
        await fetch(`${base}${n}.svg`, {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'force-cache',
        });
      } catch {}
    })
  );
}

// Preload specific static URLs (SVGs/PNGs), just to warm the HTTP cache.
export async function preloadStaticUrls(urls: string[]) {
  await Promise.all(
    urls.map(async (u) => {
      try {
        await fetch(u, { method: 'GET', credentials: 'same-origin', cache: 'force-cache' });
      } catch {}
    })
  );
}

// Preload svg template modules used by <svg-icon name="...">
export async function preloadSvgTemplates(names: string[]) {
  await Promise.all(
    names.map(async (n) => {
      try {
        await import(`../assets/iconsTemplates/${n}.ts`);
      } catch {}
    })
  );
}
