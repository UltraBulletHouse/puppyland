import { css } from 'lit';

export const sharedStyles = css`
  :host {
    font-family: var(--font-body);
  }
  /* Ensure form controls use body font within shadow roots */
  button,
  input,
  select,
  textarea {
    font-family: var(--font-body);
  }
  /* Consistent styling for Shoelace drawers */
  sl-drawer {
    /* spacing tokens (supported by Shoelace drawers/dialogs) */
    --header-spacing: 16px;
    --body-spacing: 16px;
    --footer-spacing: 16px;
  }
  sl-drawer::part(panel) {
    background: var(--color-surface-strong);
    border: 1px solid var(--color-surface-border);
    box-shadow: var(--shadow);
    border-radius: var(--border-radius-medium);
    color: var(--text);
    font-family: var(--font-body);
  }
  sl-drawer::part(overlay) {
    background-color: var(--sl-overlay-background-color);
    /* keep blur minimal for perf */
    backdrop-filter: blur(1px);
  }
  sl-drawer::part(header),
  sl-drawer::part(title) {
    font-family: var(--font-head);
    font-weight: 600;
    color: var(--text);
  }
  sl-drawer::part(body) {
    font-family: var(--font-body);
    color: var(--text);
  }
  sl-drawer::part(close-button) {
    color: var(--primary);
  }
  sl-drawer[placement='bottom']::part(panel) {
    border-top-left-radius: var(--border-radius-medium);
    border-top-right-radius: var(--border-radius-medium);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  sl-drawer[placement='top']::part(panel) {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-left-radius: var(--border-radius-medium);
    border-bottom-right-radius: var(--border-radius-medium);
  }
  sl-drawer[placement='start']::part(panel) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-top-right-radius: var(--border-radius-medium);
    border-bottom-right-radius: var(--border-radius-medium);
  }
  sl-drawer[placement='end']::part(panel) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-top-left-radius: var(--border-radius-medium);
    border-bottom-left-radius: var(--border-radius-medium);
  }
  * {
    box-sizing: border-box;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
    font-family: var(--font-head);
    font-weight: 600;
  }
  .icon-button:active:not(.icon-button--disabled),
  .icon-button:focus-visible:not(.icon-button--disabled) {
    color: var(--color-primary);
  }
  img {
    pointer-events: none; /* optional: makes the image non-interactive entirely */
  }

  /* Respect reduced motion and optimize animations */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  /* ---------------- Focus reset for inputs ---------------- */
  /* Remove visual focus styles from native inputs */
  .input--standard.input--focused:not(.input--disabled),
  .input--focused,
  input:focus,
  input:focus-visible,
  input:focus-within,
  textarea:focus,
  textarea:focus-visible,
  textarea:focus-within,
  select:focus,
  select:focus-visible,
  select:focus-within {
    outline: none !important;
    box-shadow: none !important;
    border-color: var(--primary);
  }

  /* Disable Shoelace focus rings for inputs and selects */
  sl-input,
  sl-select {
    /* Zero out the shared Shoelace focus ring */
    --sl-focus-ring-width: 0 !important;
    --sl-focus-ring-color: transparent !important;
    --sl-focus-ring: 0 0 0 0 transparent !important;
    --sl-focus-ring-offset: 0 !important;
  }

  /* Force-remove any box-shadow/outline applied inside Shoelace parts */
  sl-input::part(base),
  sl-input::part(input),
  sl-input::part(form-control-input),
  sl-select::part(combobox),
  sl-select::part(display-input) {
    box-shadow: none !important;
    outline: none !important;
    border-color: var(--primary);
    --sl-focus-ring-width: 0 !important;
    --sl-focus-ring-color: transparent !important;
    --sl-focus-ring: 0 0 0 0 transparent !important;
    --sl-focus-ring-offset: 0 !important;
  }

  /* Explicitly remove focus box-shadows on focus states (small/standard) */
  sl-input::part(base):focus-within,
  sl-input::part(form-control-input):focus-within,
  sl-input::part(input):focus,
  sl-input::part(input):focus-visible,
  sl-input[size='small']::part(base):focus-within,
  sl-input[size='medium']::part(base):focus-within,
  sl-input[size='large']::part(base):focus-within,
  sl-select::part(combobox):focus-within,
  sl-select::part(display-input):focus,
  sl-select::part(display-input):focus-visible {
    box-shadow: none !important;
    outline: none !important;
  }
`;
