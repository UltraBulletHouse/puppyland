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
`;
