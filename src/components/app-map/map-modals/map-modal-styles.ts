import { html } from 'lit';

export const MapModalStyles = html`
  <style>
    #map-modal-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      width: 100%;
    }
    #map-modal-main-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      width: 100%;
    }
    #close-btn-container {
      display: flex;
      justify-content: end;
      width: 100%;
    }
    #close-btn {
      display: flex;
      justify-content: end;
      width: 100%;
      padding: 4px 0px;
      border-radius: 50px;
      font-size: 30px;
      color: var(--color-secondary);
    }
    .close-btn--enemy {
      color: var(--color-primary) !important;
    }
    #dh-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      margin-bottom: 1rem;
    }
    #dh-name {
      font-weight: 700;
      font-size: 1.5rem;
      color: var(--color-black);
      margin-bottom: 0.5rem;
      text-align: center;
    }
    #dh-status {
      font-size: 0.9rem;
      padding: 0.25rem 0.75rem;
      border-radius: var(--border-radius-circle);
      font-weight: 500;
    }
    #dh-status.enemy {
      background: var(--color-primary-light);
      color: var(--color-primary);
    }
    #dh-status.own {
      background: var(--color-secondary-light);
      color: var(--color-secondary);
    }
    #dh-details {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #dh-hp-section {
      width: 100%;
      margin: 1rem 0;
    }
    #dh-hp-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--color-black);
    }
    .hp-percent {
      font-size: 0.85rem;
      color: var(--color-black-medium);
    }
    #dh-hp-bar {
      --indicator-color: var(--color-secondary);
      --height: 16px;
      --track-color: var(--color-primary-light);
    }
    .dh-hp-bar--enemy {
      --indicator-color: var(--color-primary) !important;
    }
    .dh-hp-bar--own {
      --indicator-color: var(--color-secondary) !important;
    }
    #footer-btn {
      padding: 10px;
    }
    #center {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
    }
    #doghouse-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 80px;
      margin: 1.5rem 0;
    }
    #actions-section {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }
    .action-description {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      background: var(--color-primary-light);
      border-radius: var(--border-radius-small);
      font-size: 0.9rem;
      color: var(--color-black);
    }
    .section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      font-size: 1.1rem;
      color: var(--color-black);
      margin-bottom: 0.5rem;
    }
    .action-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .action-label {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--color-black-medium);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .buffs-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    .buff-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .full-health-notice {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: var(--color-secondary-light);
      border-radius: var(--border-radius-small);
      color: var(--color-secondary);
      font-weight: 500;
      margin-top: 1rem;
    }
    #attack-btn::part(base) {
      font-size: 1.1rem;
      background-color: var(--color-primary);
      color: var(--color-white);
      padding: 1rem 2rem;
      border-radius: var(--border-radius-medium);
      font-weight: 600;
    }
    .repair-btn::part(base) {
      font-size: 1rem;
      background-color: var(--color-secondary);
      color: var(--color-white);
      width: 100%;
      border-radius: var(--border-radius-small);
    }
    .buff-btn::part(base) {
      font-size: 0.9rem;
      padding: 0.75rem;
      border-radius: var(--border-radius-small);
      font-weight: 500;
      width: 100%;
    }
    .buff-btn--repair50::part(base) {
      background-color: #17a2b8;
      color: white;
    }
    .buff-btn--repairmax::part(base) {
      background-color: #6f42c1;
      color: white;
    }
    .buff-btn:disabled::part(base) {
      opacity: 0.6;
    }
    #map-modal-level-up {
      display: flex;
      flex-direction: column;
      align-items: center;

      * {
        font-weight: 400;
      }

      h3 {
        font-size: 25px;
        color: var(--color-primary);

        strong {
          font-weight: 700;
        }
      }

      ul {
        list-style: none;
        padding: 0;
        margin-top: 40px;
      }

      li {
        margin-bottom: 10px;

        sl-icon {
          margin-right: 10px;
        }
      }

      .claim-btn {
        margin-top: 30px;
      }

      .claim-btn::part(base) {
        font-size: 18px;
        background-color: var(--color-primary);
        color: var(--color-white);
      }
    }
  </style>
`;
