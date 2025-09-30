// Lightweight image and icon preloader to avoid first-use flicker
// Uses the same URL resolution helpers as components so paths match Vite bundling

import { preloadRawSvgIcons } from '../assets/iconsTemplates/rawSvgIcon';
import { getImagePngUrl } from './getImage';

let preloadedBitmaps: HTMLImageElement[] = [];

function addBitmap(src: string) {
  const img = new Image();
  (img as any).fetchpriority = 'low';
  img.decoding = 'async';
  img.src = src;
  preloadedBitmaps.push(img);
  if ('decode' in img) (img as any).decode?.().catch(() => {});
}

export function preloadPngBadges(names: string[]) {
  try {
    names.forEach((name) => {
      const src = getImagePngUrl(name);
      addBitmap(src);
    });
  } catch {}
}

// Preload every PNG inside assets/icons-png via Vite's glob import
export function preloadAllPngBadges() {
  try {
    // The 'as: "url"' option returns resolved URLs for the files
    const files = import.meta.glob('../assets/icons-png/*.png', {
      eager: true,
      import: 'default',
      query: '?url',
    }) as Record<string, string>;
    const urls = Object.values(files);
    urls.forEach((src) => addBitmap(src));
  } catch {}
}

// Preload all inline SVG marker/icon assets
export function preloadAllSvgIcons() {
  try {
    const files = import.meta.glob('../assets/icons/*.svg', {
      eager: true,
      import: 'default',
      query: '?url',
    }) as Record<string, string>;
    Object.values(files).forEach((src) => addBitmap(src));
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

let svgTemplatePreloadPromise: Promise<void> | null = null;

export function preloadAllSvgTemplates(): Promise<void> {
  if (!svgTemplatePreloadPromise) {
    const modules = import.meta.glob('../assets/iconsTemplates/*.ts');
    svgTemplatePreloadPromise = Promise.all(
      Object.entries(modules)
        .filter(([path]) => !path.endsWith('/rawSvgIcon.ts'))
        .map(async ([, loader]) => {
          try {
            await loader();
          } catch {}
        })
    )
      .then(() => {})
      .catch(() => {});
  }
  return svgTemplatePreloadPromise;
}

export function preloadImagesAndIconsOnAppLoad(
  options: {
    shoelaceIcons?: string[];
    staticAssetUrls?: string[];
  } = {}
) {
  try {
    preloadAllPngBadges();
  } catch {}
  try {
    preloadAllSvgIcons();
  } catch {}
  void preloadAllSvgTemplates();
  void preloadRawSvgIcons();

  if (options.shoelaceIcons?.length) {
    const unique = [...new Set(options.shoelaceIcons)];
    void preloadShoelaceIcons(unique);
  }

  if (options.staticAssetUrls?.length) {
    const unique = [...new Set(options.staticAssetUrls)];
    void preloadStaticUrls(unique);
  }
}
