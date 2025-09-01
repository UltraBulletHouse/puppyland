import { html } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

// Load the raw SVG from assets and adapt it for inline usage
// - Strip the XML header
// - Ensure scalable sizing with viewBox and 100% dimensions
// Note: Vite supports `?raw` to import the file contents as a string.
// If your bundler differs, replace with a static template as in other iconsTemplates.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite `?raw` import returns a string at build time
import dogFaceRaw from '../icons/dog-face.svg?raw';

const adjusted = dogFaceRaw
  // Remove XML declaration if present
  .replace(/<\?xml[^>]*>/, '')
  // Force responsive sizing and preserve aspect ratio
  .replace(
    /<svg([^>]*)width="1024"\s*height="1024"([^>]*)>/,
    '<svg$1viewBox="0 0 1024 1024" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"$2>'
  )
  // Remove solid background path (black rectangle)
  .replace(/<path[^>]*fill=["']#090909["'][^>]*\/>\s*/i, '');

export const dogFaceSvg = html`${unsafeSVG(adjusted)}`;
