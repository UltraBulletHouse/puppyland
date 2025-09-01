import { html, TemplateResult } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

// Lazily import all SVGs in ../icons as raw strings
const rawSvgs = import.meta.glob('../icons/*.svg', { as: 'raw' }) as Record<
  string,
  () => Promise<string>
>;

// Build a lookup from base filename to importer
const byName: Record<string, () => Promise<string>> = {};
for (const path in rawSvgs) {
  const base = path.split('/').pop() || path;
  const name = base.replace(/\.svg$/i, '');
  byName[name] = rawSvgs[path];
}

function normalizeName(name: string): string {
  // strip directories and extension if provided
  const base = name.split('/').pop() || name;
  return base.replace(/\.svg$/i, '');
}

function makeResponsive(svg: string): string {
  let s = svg.replace(/<\?xml[^>]*>/, '');

  // If no viewBox, try to infer from width/height numbers
  if (!/viewBox=/i.test(s)) {
    const m = s.match(/<svg[^>]*\bwidth=["'](\d+(?:\.\d+)?)["'][^>]*\bheight=["'](\d+(?:\.\d+)?)["'][^>]*>/i);
    if (m) {
      const [w, h] = [m[1], m[2]];
      s = s.replace(/<svg([^>]*)>/i, `<svg$1 viewBox="0 0 ${w} ${h}">`);
    }
  }

  // Remove explicit width/height, add scalable attrs
  s = s
    .replace(/<svg([^>]*)\bwidth=["'][^"']*["']([^>]*)>/i, '<svg$1$2>')
    .replace(/<svg([^>]*)\bheight=["'][^"']*["']([^>]*)>/i, '<svg$1$2>')
    .replace(
      /<svg([^>]*)>/i,
      '<svg$1 width="100%" height="100%" preserveAspectRatio="xMidYMid meet">'
    );

  // Strip common solid background (specific to dog-face.svg)
  s = s
    .replace(/<path[^>]*\bfill=["']#090909["'][^>]*\/>\s*/gi, '')
    .replace(/<rect[^>]*\bfill=["']#090909["'][^>]*\/>\s*/gi, '');

  return s;
}

export async function getRawSvgIcon(name: string): Promise<TemplateResult<1> | undefined> {
  const key = normalizeName(name);
  const importer = byName[key];
  if (!importer) return undefined;
  try {
    const raw = await importer();
    const adjusted = makeResponsive(raw);
    return html`${unsafeSVG(adjusted)}`;
  } catch (e) {
    console.error('Error loading raw svg', key, e);
    return undefined;
  }
}
