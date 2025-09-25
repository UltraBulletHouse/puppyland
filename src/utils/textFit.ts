/* Auto-fit text utility for shrinking font-size when content overflows.
 * Usage: Add data-autofit to any element that should shrink-to-fit.
 * Global installer will observe elements and window resize/locale changes.
 */

export interface AutoFitOptions {
  minFontPx?: number; // Minimum font size in px
  stepPx?: number; // Decrement step in px
  maxLines?: number | null; // If provided, attempts to keep within this many lines
}

const DEFAULTS: Required<AutoFitOptions> = {
  minFontPx: 12,
  stepPx: 0.5,
  maxLines: null,
};

function getOrigFontSize(el: HTMLElement): number {
  const style = window.getComputedStyle(el);
  const size = parseFloat(style.fontSize || '14');
  return Number.isFinite(size) ? size : 14;
}

function getLineHeightPx(el: HTMLElement): number {
  const style = window.getComputedStyle(el);
  const lh = style.lineHeight;
  if (!lh || lh === 'normal') {
    // Approximate 1.2 * font size
    return getOrigFontSize(el) * 1.2;
  }
  const v = parseFloat(lh);
  return Number.isFinite(v) ? v : getOrigFontSize(el) * 1.2;
}

function elementIsVisible(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function fitElement(el: HTMLElement, options: AutoFitOptions = {}): void {
  // Allow per-element overrides via data attributes
  const dataMin = parseFloat(el.getAttribute('data-min-font') || '');
  const dataStep = parseFloat(el.getAttribute('data-step') || '');
  const dataMaxLinesAttr = el.getAttribute('data-max-lines');
  const dataOpts: AutoFitOptions = {};
  if (Number.isFinite(dataMin)) dataOpts.minFontPx = dataMin;
  if (Number.isFinite(dataStep)) dataOpts.stepPx = dataStep;
  if (dataMaxLinesAttr !== null) {
    const v = parseInt(dataMaxLinesAttr, 10);
    if (Number.isFinite(v)) dataOpts.maxLines = v;
  }
  const opts = { ...DEFAULTS, ...dataOpts, ...options };

  // Ensure reasonable measuring context
  const prevDisplay = el.style.display;
  const prevWhiteSpace = el.style.whiteSpace;
  const prevMaxWidth = el.style.maxWidth;

  el.style.display = el.style.display || 'inline-block';
  if (opts.maxLines && opts.maxLines > 1) {
    el.style.whiteSpace = 'normal';
  } else {
    el.style.whiteSpace = el.style.whiteSpace || 'nowrap';
  }
  el.style.maxWidth = el.style.maxWidth || '100%';

  // Reset to original size before measuring
  const orig = getOrigFontSize(el);
  el.style.fontSize = `${orig}px`;

  // If not visible yet, retry soon
  if (!elementIsVisible(el) || el.clientWidth === 0) {
    requestAnimationFrame(() => fitElement(el, options));
    return;
  }

  const maxLines = opts.maxLines;
  const lineHeight = getLineHeightPx(el);

  let size = orig;
  // Avoid growing if style constraints already applied, only shrink
  while (
    size > opts.minFontPx &&
    (el.scrollWidth > el.clientWidth ||
      (maxLines && Math.ceil(el.scrollHeight / lineHeight) > maxLines))
  ) {
    size -= opts.stepPx;
    el.style.fontSize = `${size}px`;
  }

  // Restore non-critical inline styles if they were empty before
  if (!prevDisplay) el.style.removeProperty('display');
  if (!prevWhiteSpace) el.style.removeProperty('white-space');
  if (!prevMaxWidth) el.style.removeProperty('max-width');
}

function setupForElement(el: HTMLElement) {
  // Debounce fitting to avoid excessive recalcs
  let raf = 0;
  const schedule = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => fitElement(el));
  };

  // Observe element box changes
  const ro = new ResizeObserver(() => schedule());
  try {
    ro.observe(el);
  } catch {}

  // Initial
  schedule();

  // Store cleanup
  (el as any).__autofitCleanup = () => ro.disconnect();
}

export function installAutoFit(selector = '[data-autofit]') {
  // Install for existing matches
  document.querySelectorAll<HTMLElement>(selector).forEach((el) => setupForElement(el));

  // Observe future additions
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((n) => {
        if (n instanceof HTMLElement) {
          if (n.matches && n.matches(selector)) setupForElement(n as HTMLElement);
          n.querySelectorAll &&
            n.querySelectorAll<HTMLElement>(selector).forEach((el) => setupForElement(el));
        }
      });
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });

  // Refit on language change and window resize
  const onLocale = () => {
    document.querySelectorAll<HTMLElement>(selector).forEach((el) => fitElement(el));
  };
  window.addEventListener('locale-changed', onLocale);
  window.addEventListener('resize', onLocale);

  // Return an uninstall function
  return () => {
    mo.disconnect();
    window.removeEventListener('locale-changed', onLocale);
    window.removeEventListener('resize', onLocale);
    document
      .querySelectorAll<HTMLElement>(selector)
      .forEach((el) => (el as any).__autofitCleanup?.());
  };
}
