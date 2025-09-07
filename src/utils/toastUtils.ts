// Lightweight, app-themed toast (no Shoelace components)
// Usage: toastWarning('message'); toastDanger('message');

type Variant = 'default' | 'primary' | 'success' | 'warning' | 'danger';

interface ToastOptions {
  message: string;
  variant?: Variant;
  duration?: number; // ms; Infinity keeps it until click
}

const ensureStack = () => {
  let stack = document.getElementById('app-toast-stack') as HTMLDivElement | null;
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'app-toast-stack';
    // Position near top of the viewport, respecting safe areas
    stack.style.cssText = [
      'position: fixed',
      'left: 50%','transform: translateX(-50%)',
      'top: calc(12px + env(safe-area-inset-top))','z-index: 3000',
      'display: flex','flex-direction: column','gap: 8px',
      'pointer-events: none', // clicks go to children only
      'padding: 0 12px','width: 100%','max-width: 560px',
    ].join(';');
    document.body.appendChild(stack);
  }
  return stack;
};

const colorFor = (v: Variant) => {
  switch (v) {
    case 'primary': return 'var(--primary)';
    case 'success': return 'var(--success)';
    case 'warning': return 'var(--warning)';
    case 'danger': return 'var(--danger)';
    default: return 'var(--sky)';
  }
};

export const showToast = ({ message, variant = 'default', duration = 3000 }: ToastOptions) => {
  const stack = ensureStack();

  const toast = document.createElement('div');
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  const accentColor = colorFor(variant);
  toast.style.cssText = [
    'pointer-events: auto',
    'display: inline-flex','align-items: center','gap: 10px',
    'margin: 0 auto',
    'background: var(--color-surface-strong)','color: var(--text)',
    `border: 1px solid ${accentColor}`,
    'box-shadow: var(--shadow)','border-radius: 12px',
    'padding: 10px 14px',
    'max-width: 100%','overflow: hidden',
    'animation: app-toast-in 160ms ease-out',
  ].join(';');

  const accent = document.createElement('div');
  accent.style.cssText = [
    'width: 4px','align-self: stretch',
    `background: ${accentColor}`,
    'border-radius: 4px',
  ].join(';');

  const text = document.createElement('div');
  text.textContent = message;
  text.style.cssText = [
    'font-family: var(--font-body)','font-size: 14px','line-height: 18px',
  ].join(';');

  const close = document.createElement('button');
  close.type = 'button';
  close.ariaLabel = 'Close';
  close.textContent = '×';
  close.style.cssText = [
    'margin-left: 8px','border: none','background: transparent',
    'color: var(--text)','cursor: pointer','font-size: 18px',
    'line-height: 1','padding: 0 2px',
  ].join(';');

  const style = document.createElement('style');
  style.textContent = `
    @keyframes app-toast-in {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes app-toast-out {
      to { opacity: 0; transform: translateY(-4px); }
    }
  `;

  const remove = () => {
    toast.style.animation = 'app-toast-out 160ms ease-in forwards';
    setTimeout(() => toast.remove(), 180);
  };

  close.addEventListener('click', remove);

  toast.append(style, accent, text, close);
  stack.appendChild(toast);

  if (isFinite(duration)) {
    setTimeout(remove, duration);
  }

  return remove;
};

const TOAST_DURATION = 5000

export const toastWarning = (message: string, duration = TOAST_DURATION) =>
  showToast({ message, variant: 'warning', duration });
export const toastDanger = (message: string, duration = TOAST_DURATION) =>
  showToast({ message, variant: 'danger', duration });
export const toastSuccess = (message: string, duration = TOAST_DURATION) =>
  showToast({ message, variant: 'success', duration });
export const toastPrimary = (message: string, duration = TOAST_DURATION) =>
  showToast({ message, variant: 'primary', duration });
