import { css } from 'lit';

export const sharedStyles = css`
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
