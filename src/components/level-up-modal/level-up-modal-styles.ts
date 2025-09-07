import { html } from 'lit';

export const LevelUpModalStyles = html`
  <style>
    :host {
      font-family: var(--font-body);
    }
    #level-up-modal {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      padding: 40px 30px;
      background: var(--color-primary-light);
      border-radius: var(--border-radius-medium);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      margin: 20px;
      overflow: hidden;
    }

    #level-up-modal::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(
        90deg,
        transparent,
        var(--color-medal-gold),
        color-mix(in srgb, var(--color-medal-gold) 60%, var(--color-primary) 40%),
        var(--color-medal-gold),
        transparent
      );
      animation: levelUpGlow 2s ease-in-out infinite alternate;
    }

    @keyframes levelUpGlow {
      0% {
        opacity: 0.6;
      }
      100% {
        opacity: 1;
      }
    }

    #level-up-modal h2 {
      font-size: 32px;
      font-weight: 800;
      background: linear-gradient(
        135deg,
        var(--color-medal-gold),
        color-mix(in srgb, var(--color-medal-gold) 60%, var(--color-primary) 40%),
        var(--color-medal-gold)
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-align: center;
      margin: 0 0 10px 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      animation: levelUpPulse 2s ease-in-out infinite alternate;
    }

    @keyframes levelUpPulse {
      0% {
        transform: scale(1);
      }
      100% {
        transform: scale(1.05);
      }
    }

    #level-up-modal h3 {
      font-size: 24px;
      color: var(--color-primary);
      text-align: center;
      margin: 0 0 30px 0;
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    #level-up-modal h3 strong {
      font-weight: 800;
      background: linear-gradient(135deg, var(--color-primary), #ff4757);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    #level-up-modal ul {
      list-style: none;
      padding: 0;
      margin: 0;
      width: 100%;
    }

    #level-up-modal li {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: var(--border-radius-medium);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      font-weight: 500;
      font-size: 16px;
      color: var(--color-black);
      transition: all 0.3s ease;
      animation: levelUpItemSlide 0.6s ease-out forwards;
      opacity: 0;
      transform: translateX(-20px);
    }

    #level-up-modal li:nth-child(1) {
      animation-delay: 0.2s;
    }
    #level-up-modal li:nth-child(2) {
      animation-delay: 0.4s;
    }
    #level-up-modal li:nth-child(3) {
      animation-delay: 0.6s;
    }
    #level-up-modal li:nth-child(4) {
      animation-delay: 0.8s;
    }

    @keyframes levelUpItemSlide {
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    #level-up-modal li:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    #level-up-modal li sl-icon {
      margin-right: 12px;
      font-size: 20px;
      padding: 6px;
      border-radius: var(--border-radius-circle);
      background: linear-gradient(135deg, var(--color-primary), #ff4757);
      color: white;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }

    .claim-btn {
      margin-top: 30px;
      position: relative;
      overflow: hidden;
    }

    .claim-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s ease;
    }

    .claim-btn:hover::before {
      left: 100%;
    }

    .claim-btn::part(base) {
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(
        135deg,
        var(--color-medal-gold),
        color-mix(in srgb, var(--color-medal-gold) 60%, var(--color-primary) 40%)
      );
      color: var(--color-white);
      border: none;
      box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
      transition: all 0.3s ease;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .claim-btn:hover::part(base) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 107, 53, 0.5);
    }
  </style>
`;
