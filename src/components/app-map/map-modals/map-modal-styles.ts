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
      transition: transform 0.1s ease;
    }
    
    #doghouse-icon.shake {
      animation: shake 0.5s ease-in-out;
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
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

    #visual-feedback-container {
      position: relative;
      width: 100%;
      height: 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .feedback-indicator {
      position: absolute;
      font-size: 18px;
      font-weight: bold;
      animation: fadeInUp 2s ease-out forwards;
      pointer-events: none;
    }

    .damage-indicator {
      color: var(--color-primary);
      top: 0;
    }

    .energy-indicator {
      color: #ff9500;
      top: 20px;
    }

    .experience-indicator {
      color: #4caf50;
      top: 40px;
    }

    @keyframes fadeInUp {
      0% {
        opacity: 0;
        transform: translateY(20px);
      }
      20% {
        opacity: 1;
        transform: translateY(0);
      }
      80% {
        opacity: 1;
        transform: translateY(0);
      }
      100% {
        opacity: 0;
        transform: translateY(-20px);
      }
    }

    #tap-instructions {
      text-align: center;
      margin: 20px 0;
    }

    #tap-instructions p {
      margin: 10px 0;
      font-size: 16px;
      color: var(--color-primary);
      font-weight: 500;
    }

    #tap-progress {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 15px;
    }

    .tap-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #ddd;
      transition: background-color 0.3s ease;
    }

    .tap-dot.active {
      background-color: var(--color-primary);
      animation: pulse 0.3s ease;
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.3);
      }
      100% {
        transform: scale(1);
      }
    }
  </style>
`;
