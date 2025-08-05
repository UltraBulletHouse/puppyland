import { html } from 'lit';

export const MapModalStyles = html`
  <style>
    #map-modal-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      width: 100%;
      background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-white) 100%);
      border-radius: var(--border-radius-medium);
      overflow: hidden;
    }
    #map-modal-main-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      width: 100%;
      position: relative;
      padding: 20px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%);
    }

    #map-modal-main-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
      opacity: 0.3;
    }
    #close-btn-container {
      display: flex;
      justify-content: end;
      width: 100%;
      position: relative;
      z-index: 10;
      padding: 0 10px;
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
      color: var(--color-primary);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      margin-bottom: 10px;
    }

    #dh-info {
      background: rgba(255, 255, 255, 0.15);
      border-radius: var(--border-radius-medium);
      padding: 20px;
      margin-bottom: 15px;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      width: 100%;
    }
    #dh-details {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #dh-hp-container {
      width: 100%;
      margin: 20px 0;
      padding: 16px;
      background: var(--color-white);
      border: 1px solid var(--color-primary-medium);
      border-radius: var(--border-radius-medium);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      position: relative;
    }

    .hp-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .hp-icon {
      font-size: 20px;
      padding: 8px;
      border-radius: var(--border-radius-circle);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #e74c3c, #c0392b);
      color: white;
    }

    .hp-icon.enemy {
      background: linear-gradient(135deg, var(--color-primary), #ff4757);
    }

    .hp-title {
      font-weight: 600;
      font-size: 16px;
      color: var(--color-black);
      flex: 1;
    }

    .hp-value {
      font-weight: 700;
      font-size: 18px;
      color: var(--color-primary);
    }

    .hp-progress {
      margin-top: 8px;
    }

    .hp-progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-size: 12px;
    }

    .hp-progress-current {
      color: var(--color-black-medium);
      font-weight: 500;
    }

    .hp-progress-percentage {
      color: var(--color-primary);
      font-weight: 600;
    }

    .modern-hp-bar {
      width: 100%;
      height: 12px;
      background: var(--color-primary-light);
      border-radius: 6px;
      overflow: hidden;
      position: relative;
    }

    .hp-fill {
      height: 100%;
      border-radius: 6px;
      transition: width 0.6s ease;
      position: relative;
      overflow: hidden;
      background: linear-gradient(90deg, #4caf50, #2e7d32);
    }

    .hp-fill.enemy {
      background: linear-gradient(90deg, var(--color-primary), #ff4757);
    }

    .hp-fill.low {
      background: linear-gradient(90deg, #ff9800, #f57c00);
    }

    .hp-fill.critical {
      background: linear-gradient(90deg, #f44336, #d32f2f);
    }

    .hp-fill::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
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
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      outline: none;
    }
    
    #doghouse-icon.shake {
      animation: shake 0.5s ease-in-out;
    }

    #doghouse-icon.attack-success {
      animation: attackSuccess 1s ease-in-out;
    }

    #doghouse-icon.destroyed {
      animation: destruction 1.5s ease-in-out forwards;
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }

    @keyframes attackSuccess {
      0% { transform: scale(1) rotate(0deg); }
      25% { transform: scale(1.1) rotate(-5deg); }
      50% { transform: scale(1.2) rotate(5deg); }
      75% { transform: scale(1.1) rotate(-2deg); }
      100% { transform: scale(1) rotate(0deg); }
    }

    @keyframes destruction {
      0% { 
        transform: scale(1) rotate(0deg);
        opacity: 1;
        filter: brightness(1);
      }
      20% { 
        transform: scale(1.3) rotate(-10deg);
        filter: brightness(1.5) contrast(1.2);
      }
      40% { 
        transform: scale(1.1) rotate(15deg);
        filter: brightness(2) contrast(1.5);
      }
      60% { 
        transform: scale(0.8) rotate(-20deg);
        opacity: 0.8;
        filter: brightness(0.5) blur(2px);
      }
      80% { 
        transform: scale(0.4) rotate(25deg);
        opacity: 0.4;
        filter: brightness(0.2) blur(4px);
      }
      100% { 
        transform: scale(0) rotate(45deg);
        opacity: 0;
        filter: brightness(0) blur(8px);
      }
    }

    .screen-shake {
      animation: screenShake 0.8s ease-in-out;
    }

    @keyframes screenShake {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      10% { transform: translate(-2px, -1px) rotate(-0.5deg); }
      20% { transform: translate(-1px, 2px) rotate(0.5deg); }
      30% { transform: translate(3px, 0px) rotate(-0.5deg); }
      40% { transform: translate(0px, -2px) rotate(0.5deg); }
      50% { transform: translate(-2px, 1px) rotate(-0.5deg); }
      60% { transform: translate(2px, 0px) rotate(0.5deg); }
      70% { transform: translate(0px, -1px) rotate(-0.5deg); }
      80% { transform: translate(-1px, 2px) rotate(0.5deg); }
      90% { transform: translate(1px, -1px) rotate(-0.5deg); }
    }

    .destruction-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at center, rgba(255, 107, 53, 0.3), transparent 70%);
      animation: destructionFlash 1.5s ease-out forwards;
      pointer-events: none;
      z-index: 50;
    }

    @keyframes destructionFlash {
      0% { opacity: 0; }
      20% { opacity: 1; }
      100% { opacity: 0; }
    }

    /* Dynamic particle explosion animations */
    @keyframes explode-0 { to { transform: translate(-60px, -80px) scale(0); opacity: 0; } }
    @keyframes explode-1 { to { transform: translate(70px, -90px) scale(0); opacity: 0; } }
    @keyframes explode-2 { to { transform: translate(-40px, 60px) scale(0); opacity: 0; } }
    @keyframes explode-3 { to { transform: translate(80px, 50px) scale(0); opacity: 0; } }
    @keyframes explode-4 { to { transform: translate(-90px, -20px) scale(0); opacity: 0; } }
    @keyframes explode-5 { to { transform: translate(90px, -30px) scale(0); opacity: 0; } }
    @keyframes explode-6 { to { transform: translate(-30px, -100px) scale(0); opacity: 0; } }
    @keyframes explode-7 { to { transform: translate(40px, -110px) scale(0); opacity: 0; } }
    @keyframes explode-8 { to { transform: translate(-70px, 40px) scale(0); opacity: 0; } }
    @keyframes explode-9 { to { transform: translate(60px, 70px) scale(0); opacity: 0; } }
    @keyframes explode-10 { to { transform: translate(-50px, -50px) scale(0); opacity: 0; } }
    @keyframes explode-11 { to { transform: translate(50px, -60px) scale(0); opacity: 0; } }
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
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 10;
    }

    .feedback-indicator {
      position: absolute;
      font-size: 18px;
      font-weight: bold;
      pointer-events: none;
      padding: 6px 12px;
      border-radius: 15px;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      border: 2px solid;
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 100px;
      justify-content: center;
      white-space: nowrap;
    }

    .damage-indicator {
      background: linear-gradient(135deg, rgba(220, 53, 69, 0.95), rgba(220, 53, 69, 0.8));
      color: white;
      border-color: #dc3545;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation: damageFlow 2.5s ease-out forwards;
    }

    .damage-indicator.destruction-message {
      background: linear-gradient(135deg, rgba(255, 107, 53, 0.95), rgba(238, 64, 53, 0.9));
      border-color: #ff6b35;
      font-size: 22px;
      font-weight: 900;
      padding: 10px 20px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
      animation: destructionMessage 3s ease-out forwards;
    }

    @keyframes destructionMessage {
      0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.3);
      }
      20% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.5);
      }
      40% {
        transform: translate(-50%, -50%) scale(1.2);
      }
      70% {
        opacity: 1;
        transform: translate(-50%, -80%) scale(1);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -120%) scale(0.8);
      }
    }

    .energy-indicator {
      background: linear-gradient(135deg, rgba(255, 149, 0, 0.95), rgba(255, 149, 0, 0.8));
      color: white;
      border-color: #ff9500;
      top: 20%;
      right: 10%;
      animation: floatUpRight 2.5s ease-out forwards;
    }

    .experience-indicator {
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.95), rgba(76, 175, 80, 0.8));
      color: white;
      border-color: #4caf50;
      top: 20%;
      left: 10%;
      animation: floatUpLeft 2.5s ease-out forwards;
    }

    @keyframes damageFlow {
      0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
      }
      15% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.2);
      }
      30% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      60% {
        opacity: 1;
        transform: translate(-50%, -200%) scale(0.9);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -300%) scale(0.7);
      }
    }

    @keyframes floatUpLeft {
      0% {
        opacity: 0;
        transform: translateY(20px) translateX(-20px) scale(0.8);
      }
      15% {
        opacity: 1;
        transform: translateY(0) translateX(0) scale(1.1);
      }
      25% {
        transform: translateY(0) translateX(0) scale(1);
      }
      85% {
        opacity: 1;
        transform: translateY(-30px) translateX(-10px) scale(1);
      }
      100% {
        opacity: 0;
        transform: translateY(-60px) translateX(-20px) scale(0.8);
      }
    }

    @keyframes floatUpRight {
      0% {
        opacity: 0;
        transform: translateY(20px) translateX(20px) scale(0.8);
      }
      15% {
        opacity: 1;
        transform: translateY(0) translateX(0) scale(1.1);
      }
      25% {
        transform: translateY(0) translateX(0) scale(1);
      }
      85% {
        opacity: 1;
        transform: translateY(-30px) translateX(10px) scale(1);
      }
      100% {
        opacity: 0;
        transform: translateY(-60px) translateX(20px) scale(0.8);
      }
    }

    #tap-instructions {
      text-align: center;
      margin: 20px 0;
      padding: 15px;
      background: linear-gradient(135deg, rgba(var(--color-primary-rgb, 220, 53, 69), 0.1), rgba(var(--color-primary-rgb, 220, 53, 69), 0.05));
      border-radius: 15px;
      border: 1px solid rgba(var(--color-primary-rgb, 220, 53, 69), 0.2);
    }

    #tap-instructions p {
      margin: 10px 0;
      font-size: 16px;
      color: var(--color-primary);
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    #tap-progress {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 15px;
    }

    .tap-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e0e0e0, #bdbdbd);
      border: 2px solid #ccc;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: relative;
    }

    .tap-dot.active {
      background: linear-gradient(135deg, var(--color-primary), #ff4757);
      border-color: var(--color-primary);
      box-shadow: 0 4px 12px rgba(var(--color-primary-rgb, 220, 53, 69), 0.4);
      animation: tapPulse 0.4s ease;
    }

    .tap-dot.active::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary), transparent);
      animation: ripple 0.6s ease-out;
      z-index: -1;
    }

    @keyframes tapPulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.4);
      }
      100% {
        transform: scale(1);
      }
    }

    @keyframes ripple {
      0% {
        transform: scale(1);
        opacity: 0.7;
      }
      100% {
        transform: scale(2);
        opacity: 0;
      }
    }
  </style>
`;
