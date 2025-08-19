import { consume } from '@lit/context';
// import * as signalR from '@microsoft/signalr';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/progress-bar/progress-bar.js';

import {
  API_DOGHOUSE_APPLY_BUFF,
  API_DOGHOUSE_ATTACK,
  API_DOGHOUSE_REPAIR,
} from '../../../constants/apiConstants';
import { attackEnergy, repairEnergy } from '../../../constants/config';
import { dogInfoContext, updateDogInfoEvent } from '../../../contexts/dogInfoContext';
import { accessTokenContext } from '../../../contexts/userFirebaseContext';
import { DogInfo } from '../../../types/dog';
import { AttackDoghouseResponse, RepairDoghouseResponse } from '../../../types/doghouse';
import { apiCall } from '../../../utils/apiUtils';
import { sendEvent } from '../../../utils/eventUtils';
import '../../app-modal/app-modal';
import '../../app-spinner/app-spinner';
import '../../icon-png/icon-png';
import { MapModalStyles } from './map-modal-styles';

/**
 * @fires closeMapModal
 * @fires closePopup
 */
@customElement('map-modal')
export class MapModal extends LitElement {
  @property({ type: Number }) lat?: number;
  @property({ type: Number }) lng?: number;
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
  repairTapCount: number = 0;

  @state()
  isShaking: boolean = false;

  @state()
  showDamageIndicator: boolean = false;

  @state()
  showRepairIndicator: boolean = false;

  @state()
  showEnergyIndicator: boolean = false;

  @state()
  showExperienceIndicator: boolean = false;

  @state()
  damageAmount: number = 0;

  @state()
  repairAmount: number = 0;

  @state()
  experienceAmount: number = 0;

  @state()
  isAttackSuccess: boolean = false;

  @state()
  isRepairSuccess: boolean = false;

  @state()
  isDestroyed: boolean = false;

  @state()
  showDestructionEffect: boolean = false;

  @state()
  showRepairBlockedMessage: boolean = false;

  @state()
  repairBlockedReason: string = '';

  @state()
  showAttackBlockedMessage: boolean = false;

  @state()
  attackBlockedReason: string = '';

  @state()
  showBuffsSection: boolean = false;

  @state()
  showBuffAppliedMessage: boolean = false;

  @state()
  buffAppliedMessage: string = '';

  @state()
  private buffToConfirm: string | null = null;

  private handleBuffClick(buffSku: string) {
    this.buffToConfirm = buffSku;
  }

  private cancelBuffConfirmation() {
    this.buffToConfirm = null;
  }

  applyBuffToDoghouse = async (buffSku: string) => {
    if (!this.accessToken || !this.dhId || !this.dogInfo?.id) return;

    this.btnLoading = true;

    try {
      const applyBuffResponse = await apiCall(this.accessToken).patch<RepairDoghouseResponse>(
        API_DOGHOUSE_APPLY_BUFF,
        {
          doghouseId: this.dhId,
          dogId: this.dogInfo.id,
          buffSku: buffSku,
        }
      );

      const dogInfoResponse = applyBuffResponse?.data?.dog;
      const doghouseInfoResponse = applyBuffResponse?.data?.doghouse;

      if (dogInfoResponse) {
        updateDogInfoEvent(this, dogInfoResponse);
      }

      if (doghouseInfoResponse) {
        this.dhHp = doghouseInfoResponse.hp.toString();
        sendEvent<string>(this, 'updateDoghouses', doghouseInfoResponse.hp.toString());
      }

      this.showBuffAppliedMessageWithReason(`Buff ${buffSku} applied successfully!`);
    } catch (error: any) {
      console.error('Error applying buff:', error);
      this.showBuffAppliedMessageWithReason(error.response.data.message || 'Failed to apply buff.');
    } finally {
      this.buffToConfirm = null;
      this.btnLoading = false;
    }
  };

  showBuffAppliedMessageWithReason = (reason: string) => {
    this.buffAppliedMessage = reason;
    this.showBuffAppliedMessage = true;
    setTimeout(() => {
      this.showBuffAppliedMessage = false;
    }, 3000);
  };

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

  handleDoghouseTap = () => {
    if (this.btnLoading) return;

    if (!this.isOwn) {
      // Check if attack is allowed
      const { canAttack, reason } = this.canAttackDoghouse();

      if (!canAttack) {
        this.showAttackBlockedMessageWithReason(reason);
        return;
      }

      // Attack logic for enemy doghouses
      this.tapCount++;
      this.triggerShakeAnimation();

      if (this.tapCount >= 3) {
        this.triggerAttackSuccessAnimation();
        this.attackDoghouse();
      }
    } else if (this.isOwn) {
      // Check if repair is allowed
      const { canRepair, reason } = this.canRepairDoghouse();

      if (!canRepair) {
        this.showRepairBlockedMessageWithReason(reason);
        return;
      }

      // Repair logic for own doghouses
      this.repairTapCount++;
      this.triggerShakeAnimation();

      if (this.repairTapCount >= 3) {
        this.triggerRepairSuccessAnimation();
        this.repairDoghouseWithTaps();
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

  triggerRepairSuccessAnimation = () => {
    this.isRepairSuccess = true;
    setTimeout(() => {
      this.isRepairSuccess = false;
    }, 1000);
  };

  canRepairDoghouse = (): { canRepair: boolean; reason: string } => {
    const currentHp = Number(this.dhHp);
    const maxHp = Number(this.dhMaxHp);
    const userEnergy = this.dogInfo?.energy || 0;

    if (currentHp >= maxHp) {
      return { canRepair: false, reason: 'Doghouse is already at full health!' };
    }

    if (userEnergy < repairEnergy) {
      return { canRepair: false, reason: `Not enough energy! Need ${repairEnergy} energy.` };
    }

    return { canRepair: true, reason: '' };
  };

  showRepairBlockedMessageWithReason = (reason: string) => {
    this.repairBlockedReason = reason;
    this.showRepairBlockedMessage = true;
    setTimeout(() => {
      this.showRepairBlockedMessage = false;
    }, 3000);
  };

  canAttackDoghouse = (): { canAttack: boolean; reason: string } => {
    const userEnergy = this.dogInfo?.energy || 0;

    if (userEnergy < attackEnergy) {
      return { canAttack: false, reason: `Not enough energy! Need ${attackEnergy} energy.` };
    }

    return { canAttack: true, reason: '' };
  };

  showAttackBlockedMessageWithReason = (reason: string) => {
    this.attackBlockedReason = reason;
    this.showAttackBlockedMessage = true;
    setTimeout(() => {
      this.showAttackBlockedMessage = false;
    }, 3000);
  };

  triggerDestructionEffect = () => {
    // Start destruction animation
    this.showDestructionEffect = true;
    this.isDestroyed = true;

    // Screen shake effect
    this.triggerScreenShake();

    // Create particle explosion
    this.createParticleExplosion();
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

  showRepairVisualFeedback = (repairAmount: number) => {
    this.repairAmount = repairAmount;

    // Show repair indicator
    this.showRepairIndicator = true;
    setTimeout(() => {
      this.showRepairIndicator = false;
    }, 2000);

    // Show energy consumption indicator
    this.showEnergyIndicator = true;
    setTimeout(() => {
      this.showEnergyIndicator = false;
    }, 2000);
  };

  attackDoghouse = async () => {
    if (!this.accessToken || !this.dhId || !this.dogInfo?.id) return;

    this.btnLoading = true;

    try {
      const attackDoghouseResponse = await apiCall(this.accessToken).patch<AttackDoghouseResponse>(
        API_DOGHOUSE_ATTACK,
        { doghouseId: this.dhId, dogId: this.dogInfo.id, userLat: this.lat, userLng: this.lng }
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
        setTimeout(() => {
          this.closeMapModal();
        }, 2500);
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
    } catch (error) {
      console.error('Error attacking doghouse:', error);
    } finally {
      this.btnLoading = false;
      this.tapCount = 0;
    }
  };

  repairDoghouse = async () => {
    if (!this.accessToken || !this.dhId || !this.dogInfo?.id) return;

    const repairDoghouseResponse = await apiCall(this.accessToken).patch<RepairDoghouseResponse>(
      API_DOGHOUSE_REPAIR,
      { doghouseId: this.dhId, dogId: this.dogInfo.id, userLat: this.lat, userLng: this.lng }
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

  repairDoghouseWithTaps = async () => {
    if (!this.accessToken || !this.dhId || !this.dogInfo?.id) return;

    this.btnLoading = true;

    try {
      const currentHp = Number(this.dhHp);

      const repairDoghouseResponse = await apiCall(this.accessToken).patch<RepairDoghouseResponse>(
        API_DOGHOUSE_REPAIR,
        { doghouseId: this.dhId, dogId: this.dogInfo.id, userLat: this.lat, userLng: this.lng }
      );

      const dogInfoResponse = repairDoghouseResponse?.data?.dog;
      const doghouseInfoResponse = repairDoghouseResponse?.data?.doghouse;

      // Calculate actual health restored
      let healthRestored = 0;
      if (doghouseInfoResponse) {
        const newHp = doghouseInfoResponse.hp;
        healthRestored = newHp - currentHp;
      }

      // Show visual feedback for repair with actual amount
      if (healthRestored > 0) {
        this.showRepairVisualFeedback(healthRestored);
      } else {
        // Fallback for edge cases
        this.showRepairVisualFeedback(1);
      }

      if (dogInfoResponse) {
        updateDogInfoEvent(this, dogInfoResponse);
      }

      if (doghouseInfoResponse) {
        this.dhHp = doghouseInfoResponse.hp.toString();
        sendEvent<string>(this, 'updateDoghouses', doghouseInfoResponse.hp.toString());
      }
    } catch (error) {
      console.error('Error repairing doghouse:', error);
    } finally {
      this.btnLoading = false;
      this.repairTapCount = 0;
    }
  };

  render() {
    // WEBSOCKETS
    // this.runSignal()
    const hpPercent = Math.round((Number(this.dhHp) / Number(this.dhMaxHp)) * 100);

    const hasDoghouseBuffs =
      this.dogInfo?.buffsForDoghouses && this.dogInfo.buffsForDoghouses.length > 0;

    const mainSection = html`
      <div id="map-modal-main-section" style="position: relative;">
        <!-- Visual Feedback Indicators -->
        <div id="visual-feedback-container">
          ${this.showDamageIndicator
            ? html`
                <div
                  class="feedback-indicator damage-indicator ${this.isDestroyed
                    ? 'destruction-message'
                    : ''}"
                >
                  <sl-icon name="${this.isDestroyed ? 'explosion' : 'heartbreak'}"></sl-icon>
                  ${this.isDestroyed ? 'DESTROYED!' : `-${this.damageAmount} HP`}
                </div>
              `
            : ''}
          ${this.showRepairIndicator
            ? html`
                <div class="feedback-indicator repair-indicator">
                  <sl-icon name="heart-pulse"></sl-icon>
                  +${this.repairAmount} HP
                </div>
              `
            : ''}
          ${this.showEnergyIndicator
            ? html`
                <div class="feedback-indicator energy-indicator">
                  <sl-icon name="lightning-charge"></sl-icon>
                  -${this.isOwn ? repairEnergy : attackEnergy} Energy
                </div>
              `
            : ''}
          ${this.showExperienceIndicator
            ? html`
                <div class="feedback-indicator experience-indicator">
                  <sl-icon name="star-fill"></sl-icon>
                  +${this.experienceAmount} XP
                </div>
              `
            : ''}
          ${this.showRepairBlockedMessage
            ? html`
                <div class="feedback-indicator repair-blocked-indicator">
                  <sl-icon name="exclamation-triangle"></sl-icon>
                  ${this.repairBlockedReason}
                </div>
              `
            : ''}
          ${this.showAttackBlockedMessage
            ? html`
                <div class="feedback-indicator attack-blocked-indicator">
                  <sl-icon name="exclamation-triangle"></sl-icon>
                  ${this.attackBlockedReason}
                </div>
              `
            : ''}
        </div>

        <div id="dh-info">
          <div id="dh-name">${this.dhName}</div>
          <div id="doghouse-container">
            <div
              id="doghouse-icon"
              class=${this.isShaking
                ? 'shake'
                : this.isAttackSuccess
                  ? 'attack-success'
                  : this.isRepairSuccess
                    ? 'repair-success'
                    : this.isDestroyed
                      ? 'destroyed'
                      : ''}
              @click=${this.handleDoghouseTap}
              style="cursor: pointer"
            >
              <svg-icon name="doghouseOne"></svg-icon>
            </div>

            <!-- Tapping instructions and progress dots overlaid on doghouse -->
            ${!this.isOwn
              ? (() => {
                  const { canAttack, reason } = this.canAttackDoghouse();
                  return canAttack
                    ? html`
                        <div class="tap-overlay">
                          <div class="tap-instructions-compact">
                            <p>
                              Tap ${3 - this.tapCount} time${3 - this.tapCount !== 1 ? 's' : ''} to
                              attack!
                            </p>
                            <div class="tap-progress-compact">
                              ${Array.from(
                                { length: 3 },
                                (_, i) => html`
                                  <div class="tap-dot ${i < this.tapCount ? 'active' : ''}"></div>
                                `
                              )}
                            </div>
                          </div>
                        </div>
                      `
                    : html`
                        <div class="tap-overlay">
                          <div class="attack-blocked-instructions-compact">
                            <p>
                              <sl-icon name="info-circle"></sl-icon>
                              ${reason}
                            </p>
                          </div>
                        </div>
                      `;
                })()
              : this.isOwn
                ? (() => {
                    const { canRepair, reason } = this.canRepairDoghouse();
                    return canRepair
                      ? html`
                          <div class="tap-overlay">
                            <div class="repair-instructions-compact">
                              <p>
                                Tap ${3 - this.repairTapCount}
                                time${3 - this.repairTapCount !== 1 ? 's' : ''} to repair!
                              </p>
                              <div class="repair-progress-compact">
                                ${Array.from(
                                  { length: 3 },
                                  (_, i) => html`
                                    <div
                                      class="repair-dot ${i < this.repairTapCount ? 'active' : ''}"
                                    ></div>
                                  `
                                )}
                              </div>
                            </div>
                          </div>
                        `
                      : html`
                          <div class="tap-overlay">
                            <div class="repair-blocked-instructions-compact">
                              <p>
                                <sl-icon name="info-circle"></sl-icon>
                                ${reason}
                              </p>
                            </div>
                          </div>
                        `;
                  })()
                : html``}
            ${this.showDestructionEffect ? html` <div class="destruction-overlay"></div> ` : ''}
          </div>
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
                class="hp-fill ${!this.isOwn ? 'enemy' : ''} ${hpPercent < 30
                  ? 'critical'
                  : hpPercent < 60
                    ? 'low'
                    : ''}"
                style="width: ${hpPercent}%"
              ></div>
            </div>
          </div>
        </div>

        ${hasDoghouseBuffs
          ? html`
              <div id="buffs-section">
                <div class="buffs-header">
                  <div><sl-icon name="magic"></sl-icon> Available Buffs</div>
                  <div class="user-energy">
                    <sl-icon name="lightning-charge"></sl-icon> ${this.dogInfo?.energy}
                  </div>
                </div>
                <div class="buffs-list">
                  ${this.isOwn
                    ? this.dogInfo?.buffsForDoghouses?.map(
                        (buff) => html`
                          <div class="buff-item" @click=${() => this.handleBuffClick(buff.buffSku)}>
                            ${this.buffToConfirm === buff.buffSku
                              ? html`
                                  <div class="buff-confirmation">
                                    <sl-button
                                      size="small"
                                      variant="success"
                                      pill
                                      title="Confirm"
                                      @click=${(e: Event) => {
                                        e.stopPropagation();
                                        this.applyBuffToDoghouse(buff.buffSku);
                                      }}
                                      ><sl-icon name="check-lg"></sl-icon
                                    ></sl-button>
                                    <sl-button
                                      size="small"
                                      variant="danger"
                                      pill
                                      title="Cancel"
                                      @click=${(e: Event) => {
                                        e.stopPropagation();
                                        this.cancelBuffConfirmation();
                                      }}
                                      ><sl-icon name="x-lg"></sl-icon
                                    ></sl-button>
                                  </div>
                                `
                              : html`
                                  <icon-png-badge
                                    name="${buff.buffSku.includes('repair')
                                      ? 'toolkit'
                                      : 'energy-drink'}"
                                    badge="${buff.quantity}"
                                  ></icon-png-badge>
                                  <span class="buff-name">${buff.name}</span>
                                `}
                          </div>
                        `
                      )
                    : ''}
                </div>
              </div>
            `
          : ''}
        ${this.showBuffAppliedMessage
          ? html`
              <div class="feedback-indicator buff-applied-indicator">
                <sl-icon name="check-circle"></sl-icon>
                ${this.buffAppliedMessage}
              </div>
            `
          : ''}
      </div>
    `;

    const levelUpSection = html`
      <div id="map-modal-level-up">
        <h2>🎉 Level Up! 🎉</h2>
        <h3>You reached level <strong>${this.dogInfo?.level}</strong>!</h3>
        <div>
          <ul>
            <li><sl-icon name="plus-circle"></sl-icon>Skill point +1</li>
            
            <li><sl-icon name="house-add"></sl-icon>Doghouse +1</li>
            
          </ul>
        </div>
        <sl-button class="claim-btn" @click=${this.closeMapModal} pill>Claim </sl-button>
      </div>
    `;

    const baseTemplate = html`
      ${MapModalStyles}

      <div
        id="map-modal-container"
        class=${this.isOwn ? 'own-doghouse-modal' : 'enemy-doghouse-modal'}
      >
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
