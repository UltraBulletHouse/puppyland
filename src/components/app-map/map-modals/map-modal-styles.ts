import { html } from 'lit';

export const MapModalStyles = html`
  <style>
    #map-modal-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      width: 100%;
      border-radius: var(--border-radius-medium);
      overflow: hidden;
      will-change: transform, opacity;
    }
    .own-doghouse-modal {
      background: linear-gradient(
        135deg,
        rgba(76, 175, 80, 0.15) 0%,
        rgba(129, 199, 132, 0.08) 50%,
        var(--color-white) 100%
      );
    }
    .enemy-doghouse-modal {
      background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-white) 100%);
    }
    #map-modal-main-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      width: 100%;
      position: relative;
      padding: 20px;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.1) 0%,
        transparent 50%,
        rgba(255, 255, 255, 0.05) 100%
      );
    }

    #map-modal-main-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      opacity: 0.3;
    }

    .own-doghouse-modal #map-modal-main-section::before {
      background: linear-gradient(90deg, transparent, var(--color-secondary), transparent);
    }
    .enemy-doghouse-modal #map-modal-main-section::before {
      background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
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
      margin-bottom: 5px;
    }

    #dh-info {
      background: rgba(255, 255, 255, 0.15);
      border-radius: var(--border-radius-medium);
      padding: 20px;
      margin-bottom: 15px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      width: 100%;
    }

    #doghouse-container {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 170px;
      padding-top: 10px;
    }

    #doghouse-icon {
      font-size: 80px;
      z-index: 2;
      position: relative;
      transition: transform 0.1s ease;
      will-change: transform, opacity;
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      outline: none;
    }

    .tap-overlay {
      position: absolute;
      top: 100px;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      z-index: 3;
      pointer-events: none;
      padding-top: 10px;
    }

    .tap-instructions-compact,
    .repair-instructions-compact {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      padding: 8px 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border: 2px solid;
      text-align: center;
      /* backdrop-filter removed by default for mobile performance */
      max-width: 200px;
    }

    .tap-instructions-compact {
      border-color: var(--color-primary);
    }

    .repair-instructions-compact {
      border-color: var(--color-secondary);
    }

    .tap-instructions-compact p,
    .repair-instructions-compact p {
      margin: 4px 0;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.2;
    }

    .tap-instructions-compact p {
      color: var(--color-primary);
    }

    .repair-instructions-compact p {
      color: var(--color-secondary);
    }

    .tap-progress-compact,
    .repair-progress-compact {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 6px;
    }

    .attack-blocked-instructions-compact,
    .repair-blocked-instructions-compact {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      padding: 8px 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border: 2px solid;
      text-align: center;
      /* backdrop-filter removed by default for mobile performance */
      max-width: 220px;
    }

    .attack-blocked-instructions-compact {
      border-color: #f44336;
    }

    .repair-blocked-instructions-compact {
      border-color: #ff9800;
    }

    .attack-blocked-instructions-compact p,
    .repair-blocked-instructions-compact p {
      margin: 4px 0;
      font-size: 11px;
      font-weight: 600;
      line-height: 1.3;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .attack-blocked-instructions-compact p {
      color: #f44336;
    }

    .repair-blocked-instructions-compact p {
      color: #ff9800;
    }

    .attack-blocked-instructions-compact sl-icon,
    .repair-blocked-instructions-compact sl-icon {
      font-size: 14px;
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
      border-radius: var(--border-radius-medium);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      position: relative;
    }

    .own-doghouse-modal #dh-hp-container {
      border: 1px solid var(--color-secondary-light);
    }
    .enemy-doghouse-modal #dh-hp-container {
      border: 1px solid var(--color-primary-light);
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
      border-radius: 6px;
      overflow: hidden;
      position: relative;
    }

    .own-doghouse-modal .modern-hp-bar {
      background: var(--color-secondary-light);
    }
    .enemy-doghouse-modal .modern-hp-bar {
      background: var(--color-primary-light);
    }

    .hp-fill {
      height: 100%;
      border-radius: 6px;
      transition: width 0.6s ease;
      position: relative;
      overflow: hidden;
      background: linear-gradient(90deg, #4caf50, #2e7d32);
      will-change: width, transform;
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

    #doghouse-icon.shake {
      animation: shake 0.5s ease-in-out;
    }

    #doghouse-icon.attack-success {
      animation: attackSuccess 1s ease-in-out;
    }

    #doghouse-icon.repair-success {
      animation: repairSuccess 1s ease-in-out;
    }

    #doghouse-icon.destroyed {
      animation: destruction 1s ease-in-out forwards;
    }

    @keyframes shake {
      0%,
      100% {
        transform: translateX(0);
      }
      10%,
      30%,
      50%,
      70%,
      90% {
        transform: translateX(-5px);
      }
      20%,
      40%,
      60%,
      80% {
        transform: translateX(5px);
      }
    }

    @keyframes attackSuccess {
      0% {
        transform: scale(1) rotate(0deg);
      }
      25% {
        transform: scale(1.1) rotate(-5deg);
      }
      50% {
        transform: scale(1.2) rotate(5deg);
      }
      75% {
        transform: scale(1.1) rotate(-2deg);
      }
      100% {
        transform: scale(1) rotate(0deg);
      }
    }

    @keyframes repairSuccess {
      0% {
        transform: scale(1) rotate(0deg);
      }
      25% {
        transform: scale(1.1) rotate(2deg);
      }
      50% {
        transform: scale(1.2) rotate(-2deg);
      }
      75% {
        transform: scale(1.1) rotate(1deg);
      }
      100% {
        transform: scale(1) rotate(0deg);
      }
    }

    @keyframes destruction {
      0% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
      }
      50% {
        transform: scale(1.5) rotate(15deg);
        opacity: 0.5;
      }
      100% {
        transform: scale(0) rotate(45deg);
        opacity: 0;
      }
    }

    .screen-shake {
      animation: screenShake 0.8s ease-in-out;
    }

    @keyframes screenShake {
      0%,
      100% {
        transform: translate(0, 0) rotate(0deg);
      }
      10% {
        transform: translate(-2px, -1px) rotate(-0.5deg);
      }
      20% {
        transform: translate(-1px, 2px) rotate(0.5deg);
      }
      30% {
        transform: translate(3px, 0px) rotate(-0.5deg);
      }
      40% {
        transform: translate(0px, -2px) rotate(0.5deg);
      }
      50% {
        transform: translate(-2px, 1px) rotate(-0.5deg);
      }
      60% {
        transform: translate(2px, 0px) rotate(0.5deg);
      }
      70% {
        transform: translate(0px, -1px) rotate(-0.5deg);
      }
      80% {
        transform: translate(-1px, 2px) rotate(0.5deg);
      }
      90% {
        transform: translate(1px, -1px) rotate(-0.5deg);
      }
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
      will-change: opacity, transform;
    }

    @keyframes destructionFlash {
      0% {
        opacity: 0;
      }
      20% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }

    /* Dynamic particle explosion animations */
    @keyframes explode-0 {
      to {
        transform: translate(-60px, -80px) scale(0);
        opacity: 0;
      }
    }
    @keyframes explode-1 {
      to {
        transform: translate(70px, -90px) scale(0);
        opacity: 0;
      }
    }
    @keyframes explode-2 {
      to {
        transform: translate(-40px, 60px) scale(0);
        opacity: 0;
      }
    }
    @keyframes explode-3 {
      to {
        transform: translate(80px, 50px) scale(0);
        opacity: 0;
      }
    }
    @keyframes explode-4 {
      to {
        transform: translate(-90px, -20px) scale(0);
        opacity: 0;
      }
    }
    @keyframes explode-5 {
      to {
        transform: translate(90px, -30px) scale(0);
        opacity: 0;
      }
    }
    @keyframes explode-6 {
      to {
        transform: translate(-30px, -100px) scale(0);
        opacity: 0;
      }
    }
    @keyframes explode-7 {
      to {
        transform: translate(40px, -110px) scale(0);
        opacity: 0;
      }
    }
    @keyframes explode-8 {
      to {
        transform: translate(-70px, 40px) scale(0);
        opacity: 0;
      }
    }
    @keyframes explode-9 {
      to {
        transform: translate(60px, 70px) scale(0);
        opacity: 0;
      }
    }
    @keyframes explode-10 {
      to {
        transform: translate(-50px, -50px) scale(0);
        opacity: 0;
      }
    }
    @keyframes explode-11 {
      to {
        transform: translate(50px, -60px) scale(0);
        opacity: 0;
      }
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

    #visual-feedback-container {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      /* Ensure feedback overlays above any in-content overlay (e.g., destruction) */
      z-index: 100;
    }

    .feedback-indicator {
      position: absolute;
      font-size: 18px;
      font-weight: bold;
      pointer-events: none;
      padding: 6px 12px;
      border-radius: 15px;
      /* backdrop-filter removed by default for mobile performance */
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      border: 2px solid;
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 100px;
      justify-content: center;
      white-space: nowrap;
      will-change: transform, opacity;
      z-index: 60; /* above doghouse icon, tap overlay, and destruction overlay */
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
      background: linear-gradient(
        135deg,
        rgba(var(--color-primary-rgb, 220, 53, 69), 0.1),
        rgba(var(--color-primary-rgb, 220, 53, 69), 0.05)
      );
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

    /* Repair indicator styles */
    .repair-indicator {
      background: linear-gradient(135deg, #4caf50, #81c784);
      color: white;
      animation: floatUpCenter 2s ease-out forwards;
    }

    /* Repair blocked indicator styles */
    .repair-blocked-indicator {
      background: linear-gradient(135deg, #ff9800, #ffb74d);
      color: white;
      animation: floatUpCenter 3s ease-out forwards;
      font-size: 14px;
      padding: 8px 16px;
      max-width: 280px;
      text-align: center;
    }

    /* Attack blocked indicator styles */
    .attack-blocked-indicator {
      background: linear-gradient(135deg, #f44336, #ef5350);
      color: white;
      animation: floatUpCenter 3s ease-out forwards;
      font-size: 14px;
      padding: 8px 16px;
      max-width: 280px;
      text-align: center;
    }

    /* Repair instructions styles */
    #repair-instructions {
      text-align: center;
      margin: 20px 0;
      padding: 15px;
      background: linear-gradient(
        135deg,
        rgba(var(--color-secondary-rgb, 40, 167, 69), 0.1),
        rgba(var(--color-secondary-rgb, 40, 167, 69), 0.05)
      );
      border-radius: 15px;
      border: 1px solid rgba(var(--color-secondary-rgb, 40, 167, 69), 0.2);
    }

    #repair-instructions p {
      margin: 10px 0;
      font-size: 16px;
      color: var(--color-secondary);
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    #repair-progress {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 15px;
    }

    .repair-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e0e0e0, #bdbdbd);
      border: 2px solid #ccc;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: relative;
    }

    .repair-dot.active {
      background: linear-gradient(135deg, var(--color-secondary), #4caf50);
      border-color: var(--color-secondary);
      box-shadow: 0 4px 12px rgba(var(--color-secondary-rgb, 40, 167, 69), 0.4);
      animation: repairPulse 0.4s ease;
    }

    .repair-dot.active::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-secondary), transparent);
      animation: repairRipple 0.6s ease-out;
      z-index: -1;
    }

    @keyframes repairPulse {
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

    @keyframes repairRipple {
      0% {
        transform: scale(1);
        opacity: 0.7;
      }
      100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    /* Repair blocked instructions styles */
    #repair-blocked-instructions {
      text-align: center;
      margin: 20px 0;
      padding: 15px;
      background: linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 152, 0, 0.05));
      border-radius: 15px;
      border: 1px solid rgba(255, 152, 0, 0.3);
    }

    #repair-blocked-instructions p {
      margin: 10px 0;
      font-size: 16px;
      color: #ff9800;
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    #repair-blocked-instructions sl-icon {
      font-size: 18px;
    }

    /* Attack blocked instructions styles */
    #attack-blocked-instructions {
      text-align: center;
      margin: 20px 0;
      padding: 15px;
      background: linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(244, 67, 54, 0.05));
      border-radius: 15px;
      border: 1px solid rgba(244, 67, 54, 0.3);
    }

    #attack-blocked-instructions p {
      margin: 10px 0;
      font-size: 16px;
      color: #f44336;
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    #attack-blocked-instructions sl-icon {
      font-size: 18px;
    }

    #buffs-section {
      width: 100%;
      margin-top: 10px;
      padding: 16px;
      background: var(--color-white);
      border-radius: var(--border-radius-medium);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .own-doghouse-modal #buffs-section {
      border: 1px solid var(--color-secondary-light);
    }
    .enemy-doghouse-modal #buffs-section {
      border: 1px solid var(--color-primary-light);
    }

    .buffs-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-weight: 600;
      font-size: 13px;
      color: var(--color-black);
      margin-bottom: 12px;
    }

    .buffs-header > div {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .buffs-header .user-energy {
      font-size: 14px;
      font-weight: 700;
      color: var(--color-primary);
    }

    .buffs-header sl-icon {
      font-size: 20px;
      padding: 8px;
      border-radius: var(--border-radius-circle);
      background: linear-gradient(135deg, #9b59b6, #8e44ad);
      color: white;
    }

    .buffs-header .user-energy sl-icon {
      background: linear-gradient(135deg, #ffeb3b, #ffc107);
      color: var(--color-black);
    }

    .buffs-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 20px;
    }

    .buff-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      cursor: pointer;
      padding: 8px;
      border-radius: var(--border-radius-medium);
      background: var(--color-white);
      border: 1px solid var(--sl-color-gray-300);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
      position: relative;
      min-height: 80px;
    }

    .buff-item:hover {
      background: var(--sl-color-gray-100);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .buff-item:active {
      transform: translateY(0);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
      background: var(--sl-color-gray-200);
    }

    .buff-item .buff-name {
      font-size: 12px;
      font-weight: 500;
      color: var(--color-black-medium);
      margin-top: 4px;
    }

    .buff-item icon-png-badge {
      --icon-png-badge-width: 36px;
      --icon-png-badge-height: 36px;
    }

    .buff-confirmation {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: row;
      gap: 8px;
      width: 100%;
      justify-content: center;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: var(--border-radius-medium);
    }

    .buff-confirmation sl-button::part(base) {
      width: 40px;
      height: 40px;
    }

    .buff-confirmation sl-button::part(base) {
      font-size: 20px;
      padding-top: 7px;
    }

    .buff-applied-indicator {
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.95), rgba(76, 175, 80, 0.8));
      color: white;
      border-color: #4caf50;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation: damageFlow 2.5s ease-out forwards;
    }

    @media (max-width: 600px) {
      #map-modal-main-section {
        padding: 15px;
      }

      #dh-info {
        padding: 15px;
        margin-bottom: 10px;
      }

      #dh-name {
        font-size: 18px;
        margin-bottom: 3px;
      }

      #doghouse-container {
        min-height: 140px;
        padding-top: 8px;
      }

      #doghouse-icon {
        font-size: 60px;
      }

      .tap-overlay {
        top: 80px;
        padding-top: 8px;
      }

      .tap-instructions-compact,
      .repair-instructions-compact {
        max-width: 180px;
        padding: 6px 10px;
      }

      .tap-instructions-compact p,
      .repair-instructions-compact p {
        font-size: 11px;
      }

      .attack-blocked-instructions-compact,
      .repair-blocked-instructions-compact {
        max-width: 200px;
        padding: 6px 10px;
      }

      .attack-blocked-instructions-compact p,
      .repair-blocked-instructions-compact p {
        font-size: 10px;
      }

      .tap-progress-compact,
      .repair-progress-compact {
        gap: 6px;
        margin-top: 4px;
      }

      .tap-dot,
      .repair-dot {
        width: 12px;
        height: 12px;
      }

      #dh-hp-container {
        padding: 12px;
        margin: 15px 0;
      }

      .hp-header {
        gap: 6px;
        margin-bottom: 8px;
      }

      .hp-icon {
        width: 32px;
        height: 32px;
        font-size: 18px;
      }

      .hp-title {
        font-size: 14px;
      }

      .hp-value {
        font-size: 16px;
      }

      .hp-progress-info {
        font-size: 11px;
        margin-bottom: 4px;
      }

      .modern-hp-bar {
        height: 10px;
      }
    }

    @media (max-width: 480px) {
      #map-modal-main-section {
        padding: 10px;
      }

      #dh-info {
        padding: 12px;
      }

      #dh-name {
        font-size: 16px;
      }

      #doghouse-container {
        min-height: 120px;
        padding-top: 5px;
      }

      #doghouse-icon {
        font-size: 50px;
      }

      .tap-overlay {
        top: 70px;
        padding-top: 5px;
      }

      .tap-instructions-compact,
      .repair-instructions-compact {
        max-width: 160px;
        padding: 5px 8px;
      }

      .tap-instructions-compact p,
      .repair-instructions-compact p {
        font-size: 10px;
      }

      .attack-blocked-instructions-compact,
      .repair-blocked-instructions-compact {
        max-width: 180px;
        padding: 5px 8px;
      }

      .attack-blocked-instructions-compact p,
      .repair-blocked-instructions-compact p {
        font-size: 9px;
      }

      .tap-dot,
      .repair-dot {
        width: 10px;
        height: 10px;
      }

      #dh-hp-container {
        padding: 10px;
        margin: 10px 0;
      }

      .hp-title {
        font-size: 13px;
      }

      .hp-value {
        font-size: 14px;
      }
    }

    /* Desktop-only blur effects for nicer visuals */
    @media (pointer: fine) and (min-width: 768px) {
      .tap-instructions-compact,
      .repair-instructions-compact,
      .attack-blocked-instructions-compact,
      .repair-blocked-instructions-compact,
      .feedback-indicator {
        backdrop-filter: blur(8px);
      }
    }

    /* Animations are always enabled (override OS reduced motion) */

    /* Shorter animation durations on small screens for smoother performance */
    @media (max-width: 600px) {
      #doghouse-icon.shake {
        animation-duration: 0.35s;
      }
      #doghouse-icon.attack-success,
      #doghouse-icon.repair-success {
        animation-duration: 0.7s;
      }
      .screen-shake {
        animation-duration: 0.6s;
      }
      .destruction-overlay {
        animation-duration: 1s;
      }
      .damage-indicator,
      .energy-indicator,
      .experience-indicator,
      .repair-indicator {
        animation-duration: 1.2s;
      }
      .damage-indicator.destruction-message {
        animation-duration: 1.6s;
      }
      .tap-dot.active,
      .repair-dot.active {
        animation-duration: 0.3s;
      }
      .tap-dot.active::after,
      .repair-dot.active::after {
        animation-duration: 0.5s;
      }
    }

    /* Lighter shadows on small screens */
    @media (max-width: 480px) {
      .feedback-indicator {
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      }
      .tap-instructions-compact,
      .repair-instructions-compact,
      .attack-blocked-instructions-compact,
      .repair-blocked-instructions-compact {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
      }
    }
  </style>
`;
