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
    #dh-name {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      font-weight: 600;
      font-size: 20px;
      text-wrap: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    #dh-details {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #dh-hp-container {
      width: 100%;
      margin: 20px 0 20px;
    }
    #dh-hp-value {
      display: flex;
      justify-content: center;
    }
    #dh-hp-bar {
      --indicator-color: var(--color-secondary);
      --height: 12px;
    }
    .dh-hp-bar--enemy {
      --indicator-color: var(--color-primary) !important;
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
      margin: 30px 0;
    }
    #attack-btn::part(base) {
      font-size: 18px;
      background-color: var(--color-primary);
      color: var(--color-white);
    }
    #heal-btn::part(base) {
      font-size: 18px;
      background-color: var(--color-secondary);
      color: var(--color-white);
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
