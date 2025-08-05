import { consume } from '@lit/context';
import confetti from 'canvas-confetti';
// import * as signalR from '@microsoft/signalr';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/progress-bar/progress-bar.js';

import { API_DOGHOUSE_ATTACK, API_DOGHOUSE_REPAIR } from '../../../constants/apiConstants';
import { attackEnergy, repairEnergy } from '../../../constants/config';
import { dogInfoContext, updateDogInfoEvent } from '../../../contexts/dogInfoContext';
import { accessTokenContext } from '../../../contexts/userFirebaseContext';
import { DogInfo } from '../../../types/dog';
import { AttackDoghouseResponse, RepairDoghouseResponse } from '../../../types/doghouse';

import { apiCall } from '../../../utils/apiUtils';
import { sendEvent } from '../../../utils/eventUtils';
import '../../app-modal/app-modal';
import '../../app-spinner/app-spinner';
import { MapModalStyles } from './map-modal-styles';

/**
 * @fires closeMapModal
 * @fires closePopup
 */
@customElement('map-modal')
export class MapModal extends LitElement {
  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  @consume({ context: dogInfoContext, subscribe: true })
  @property({ attribute: false })
  dogInfo: DogInfo | null = null;

  @property({ type: Boolean })
  open: boolean = false;

  @property({ type: Boolean })
  isOwn: boolean = false;

  @property({ type: String })
  dhId?: string;

  @property({ type: String })
  dhName?: string;

  @property({ type: String })
  dhHp?: string;

  @property({ type: String })
  dhMaxHp?: string;

  @state()
  btnLoading: boolean = false;

  @state()
  isLevelUp: boolean = false;

  @state()
  tapCount: number = 0;

  @state()
  isShaking: boolean = false;

  @state()
  showDamageIndicator: boolean = false;

  @state()
  showEnergyIndicator: boolean = false;

  @state()
  showExperienceIndicator: boolean = false;

  @state()
  damageAmount: number = 0;

  @state()
  experienceAmount: number = 0;

  @state()
  isAttackSuccess: boolean = false;

  @state()
  isDestroyed: boolean = false;

  @state()
  showDestructionEffect: boolean = false;

  // WEBSOCKETS
  // connection = new signalR.HubConnectionBuilder()
  // .withUrl('https://mydogapi.azurewebsites.net/doghouse-hub')
  // .build();

  closeMapModal = () => {
    // WEBSOCKETS
    // this.connection.invoke("RemoveFromGroup", this.dhId).catch((err: Error) => {
    //   console.error(err.toString());
    // });

    sendEvent(this, 'closeMapModal');
  };

  // WEBSOCKETS
  // runSignal = () => {
  //   this.connection.start()
  //       .then(() => {
  //         this.connection.invoke("AddToGroup", this.dhId).catch((err: Error) => {
  //           console.error(err.toString());
  //       });
  //       });

  //       this.connection.on("ReceiveMessage", (message: number) => {
  //         console.log("Received message: " + message);
  //         // Display the message to the user
  //         // e.g., update the DOM
  //     });
  // }

  loadingButton = () => {
    this.btnLoading = true;

    setTimeout(() => {
      this.btnLoading = false;
    }, 3000);
  };

  handleDoghouseTap = () => {
    if (!this.isOwn && !this.btnLoading) {
      this.tapCount++;
      this.triggerShakeAnimation();
      
      if (this.tapCount >= 3) {
        this.tapCount = 0;
        this.triggerAttackSuccessAnimation();
        this.attackDoghouse();
      }
    }
  };

  triggerShakeAnimation = () => {
    this.isShaking = true;
    setTimeout(() => {
      this.isShaking = false;
    }, 500);
  };

  triggerAttackSuccessAnimation = () => {
    this.isAttackSuccess = true;
    setTimeout(() => {
      this.isAttackSuccess = false;
    }, 1000);
  };

  triggerDestructionEffect = () => {
    // Start destruction animation
    this.showDestructionEffect = true;
    this.isDestroyed = true;
    
    // Screen shake effect
    this.triggerScreenShake();
    
    // Create particle explosion
    this.createParticleExplosion();
    
    // After destruction animation, show confetti and close
    setTimeout(() => {
      this.launchConfetti();
    }, 1500);
  };

  triggerScreenShake = () => {
    const modalContainer = this.shadowRoot?.querySelector('#map-modal-container') as HTMLElement;
    if (modalContainer) {
      modalContainer.classList.add('screen-shake');
      setTimeout(() => {
        modalContainer.classList.remove('screen-shake');
      }, 800);
    }
  };

  createParticleExplosion = () => {
    const container = this.shadowRoot?.querySelector('#map-modal-main-section') as HTMLElement;
    if (!container) return;

    // Create multiple explosion particles
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.className = 'explosion-particle';
      particle.style.cssText = `
        position: absolute;
        width: 8px;
        height: 8px;
        background: ${this.getRandomExplosionColor()};
        border-radius: 50%;
        top: 50%;
        left: 50%;
        pointer-events: none;
        z-index: 100;
        animation: explode-${i} 1.5s ease-out forwards;
      `;
      
      container.appendChild(particle);
      
      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 1500);
    }
  };

  getRandomExplosionColor = () => {
    const colors = ['#ff6b35', '#f7931e', '#ffd23f', '#ee4035', '#ff9500', '#ff4757'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  showVisualFeedback = (damage: number, experience: number) => {
    this.damageAmount = damage;
    this.experienceAmount = experience;
    
    // Show damage indicator
    this.showDamageIndicator = true;
    setTimeout(() => {
      this.showDamageIndicator = false;
    }, 2000);
    
    // Show energy consumption indicator
    this.showEnergyIndicator = true;
    setTimeout(() => {
      this.showEnergyIndicator = false;
    }, 2000);
    
    // Show experience indicator
    this.showExperienceIndicator = true;
    setTimeout(() => {
      this.showExperienceIndicator = false;
    }, 2000);
  };

  attackDoghouse = async () => {
    if (!this.accessToken || !this.dhId || !this.dogInfo?.id) return;

    this.loadingButton();

    const attackDoghouseResponse = await apiCall(this.accessToken).patch<AttackDoghouseResponse>(
      API_DOGHOUSE_ATTACK,
      { doghouseId: this.dhId, dogId: this.dogInfo.id }
    );

    const dogInfoResponse = attackDoghouseResponse?.data?.dog;
    const doghouseInfoResponse = attackDoghouseResponse?.data?.doghouse;
    const attackResult = attackDoghouseResponse?.data?.attackResult;
    const isLevelUp = attackDoghouseResponse?.data?.isLevelUp;

    if (isLevelUp) {
      this.isLevelUp = isLevelUp;
    }

    if (attackResult.isDoghouseDestroyed) {
      this.triggerDestructionEffect();
      this.showVisualFeedback(attackResult.damageDealt, attackResult.experienceGained);
    } else {
      this.showVisualFeedback(attackResult.damageDealt, attackResult.experienceGained);
    }

    if (dogInfoResponse) {
      updateDogInfoEvent(this, dogInfoResponse);
    }
    if (attackResult?.isDoghouseDestroyed) {
      this.dhHp = '0';
    } else if (doghouseInfoResponse) {
      this.dhHp = doghouseInfoResponse.hp.toString();
    }

    sendEvent<string>(this, 'updateDoghouses', doghouseInfoResponse?.hp.toString());
  };

  repairDoghouse = async () => {
    if (!this.accessToken || !this.dhId || !this.dogInfo?.id) return;

    const repairDoghouseResponse = await apiCall(this.accessToken).patch<RepairDoghouseResponse>(
      API_DOGHOUSE_REPAIR,
      { doghouseId: this.dhId, dogId: this.dogInfo.id }
    );

    const dogInfoResponse = repairDoghouseResponse?.data?.dog;
    const doghouseInfoResponse = repairDoghouseResponse?.data?.doghouse;

    if (dogInfoResponse) {
      updateDogInfoEvent(this, dogInfoResponse);
    }

    if (doghouseInfoResponse) {
      this.dhHp = doghouseInfoResponse.hp.toString();
      sendEvent<string>(this, 'updateDoghouses', doghouseInfoResponse.hp.toString());
    }
  };

  launchConfetti() {
    const canvas = globalThis.document.getElementById(
      'confetti-canvas'
    ) as HTMLCanvasElement | null;
    if (!canvas) {
      console.warn('Confetti canvas not found!');
      return;
    }

    canvas.style.display = 'block';
    canvas.width = globalThis.innerWidth;
    canvas.height = globalThis.innerHeight;

    confetti.create(canvas, { resize: true, useWorker: false })({
      particleCount: 240,
      spread: 100,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      canvas.style.display = 'none';
      this.closeMapModal();
      sendEvent(this, 'closePopup');
    }, 4500);
  }

  render() {
    // WEBSOCKETS
    // this.runSignal()
    const hpPercent = Math.round((Number(this.dhHp) / Number(this.dhMaxHp)) * 100);

    const mainSection = html`
      <div id="map-modal-main-section" style="position: relative;">
        <!-- Visual Feedback Indicators -->
        <div id="visual-feedback-container">
          ${this.showDamageIndicator ? html`
            <div class="feedback-indicator damage-indicator ${this.isDestroyed ? 'destruction-message' : ''}">
              <sl-icon name="${this.isDestroyed ? 'explosion' : 'heart-crack'}"></sl-icon>
              ${this.isDestroyed ? 'DESTROYED!' : `-${this.damageAmount} HP`}
            </div>
          ` : ''}
          
          ${this.showEnergyIndicator ? html`
            <div class="feedback-indicator energy-indicator">
              <sl-icon name="lightning-charge"></sl-icon>
              -${attackEnergy} Energy
            </div>
          ` : ''}
          
          ${this.showExperienceIndicator ? html`
            <div class="feedback-indicator experience-indicator">
              <sl-icon name="star-fill"></sl-icon>
              +${this.experienceAmount} XP
            </div>
          ` : ''}
        </div>

        <div id="dh-info">
          <div id="dh-name">${this.dhName}</div>
          <div 
            id="doghouse-icon" 
            class=${this.isShaking ? 'shake' : this.isAttackSuccess ? 'attack-success' : this.isDestroyed ? 'destroyed' : ''}
            @click=${this.handleDoghouseTap}
            style="cursor: ${!this.isOwn ? 'pointer' : 'default'}"
          >
            <svg-icon name="doghouseOne"></svg-icon>
          </div>
          
          ${this.showDestructionEffect ? html`
            <div class="destruction-overlay"></div>
          ` : ''}
        </div>

        <div id="dh-hp-container">
          <div class="hp-header">
            <div class="hp-icon ${!this.isOwn ? 'enemy' : ''}">
              <sl-icon name="heart-pulse"></sl-icon>
            </div>
            <div class="hp-title">Health</div>
            <div class="hp-value">${this.dhHp}</div>
          </div>
          <div class="hp-progress">
            <div class="hp-progress-info">
              <span class="hp-progress-current">${this.dhHp} / ${this.dhMaxHp} HP</span>
              <span class="hp-progress-percentage">${hpPercent}%</span>
            </div>
            <div class="modern-hp-bar">
              <div 
                class="hp-fill ${!this.isOwn ? 'enemy' : ''} ${hpPercent < 30 ? 'critical' : hpPercent < 60 ? 'low' : ''}"
                style="width: ${hpPercent}%"
              ></div>
            </div>
          </div>
        </div>
        
        <div id="center">
          ${!this.isOwn ? html`
            <div id="tap-instructions">
              <p>Tap the doghouse ${3 - this.tapCount} time${3 - this.tapCount !== 1 ? 's' : ''} to attack!</p>
              <div id="tap-progress">
                ${Array.from({length: 3}, (_, i) => html`
                  <div class="tap-dot ${i < this.tapCount ? 'active' : ''}"></div>
                `)}
              </div>
            </div>
          ` : html``}
        </div>
        
        <div id="footer-btn">
          ${this.isOwn
            ? html`<sl-button id="heal-btn" @click=${this.repairDoghouse} pill
                >Repair - ${repairEnergy}<sl-icon name="lightning-charge"></sl-icon
              ></sl-button>`
            : html``}
        </div>
      </div>
    `;

    const levelUpSection = html`
      <div id="map-modal-level-up">
        <h2>🎉 Level Up! 🎉</h2>
        <h3>You reached level <strong>${this.dogInfo?.level}</strong>!</h3>
        <div>
          <ul>
            <li><sl-icon name="lightning-charge"></sl-icon>Max energy +10</li>
            <li><sl-icon name="lightning"></sl-icon>Energy restored</li>
            <li><sl-icon name="house-add"></sl-icon>Doghouse +1</li>
            <li><sl-icon name="house-heart"></sl-icon>All doghouses health +10</li>
          </ul>
        </div>
        <sl-button class="claim-btn" @click=${this.closeMapModal} pill>Claim </sl-button>
      </div>
    `;

    const baseTemplate = html`
      ${MapModalStyles}

      <div id="map-modal-container" class=${this.isOwn ? 'own-doghouse-modal' : 'enemy-doghouse-modal'}>
        <div id="close-btn-container">
          <div
            id="close-btn"
            class=${!this.isOwn ? 'close-btn--enemy' : ''}
            @click=${this.closeMapModal}
          >
            <sl-icon name="x"></sl-icon>
          </div>
        </div>
        ${this.isLevelUp ? levelUpSection : mainSection}
      </div>
    `;

    return html`<app-modal
      modalId="attack-doghouse"
      .open=${this.open}
      .element=${baseTemplate}
    ></app-modal>`;
  }
}