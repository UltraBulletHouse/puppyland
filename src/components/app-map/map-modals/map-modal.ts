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
import { alertNotifySuccess } from '../../../utils/alertsUtils';
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
  buffLoading: string | null = null;

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
      this.launchConfetti();

      alertNotifySuccess(
        `
        💥 You destroyed doghouse!!!  </br>
        🎓 ${attackResult.experienceGained} XP
        `
      );
    } else {
      alertNotifySuccess(
        `
        💥 ${attackResult.damageDealt} DMG  </br>
        🎓 ${attackResult.experienceGained} XP
        `
      );
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

    this.loadingButton();

    const attackDoghouseResponse = await apiCall(this.accessToken).patch<RepairDoghouseResponse>(
      API_DOGHOUSE_REPAIR,
      { doghouseId: this.dhId, dogId: this.dogInfo.id }
    );

    const dogInfoResponse = attackDoghouseResponse?.data?.dog;
    const doghouseInfoResponse = attackDoghouseResponse?.data?.doghouse;

    if (dogInfoResponse) {
      updateDogInfoEvent(this, dogInfoResponse);
    }

    if (doghouseInfoResponse) {
      this.dhHp = doghouseInfoResponse.hp.toString();
      alertNotifySuccess(`🔧 Doghouse repaired!`);
    }

    sendEvent<string>(this, 'updateDoghouses', doghouseInfoResponse?.hp.toString());
  };

  applyBuff = async (buffType: 'repair50' | 'repairMax') => {
    if (!this.accessToken || !this.dhId || !this.dogInfo?.id) return;

    this.buffLoading = buffType;

    // Mock API call for now - replace with actual API endpoint
    setTimeout(() => {
      const currentHp = Number(this.dhHp);
      const maxHp = Number(this.dhMaxHp);
      
      if (buffType === 'repair50') {
        const newHp = Math.min(currentHp + 50, maxHp);
        this.dhHp = newHp.toString();
        alertNotifySuccess(`✨ Repair Buff Applied! +50 HP`);
      } else if (buffType === 'repairMax') {
        this.dhHp = this.dhMaxHp;
        alertNotifySuccess(`⚡ Max Repair Buff Applied! Full HP restored!`);
      }

      this.buffLoading = null;
      sendEvent<string>(this, 'updateDoghouses', this.dhHp);
    }, 1500);
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
    const currentHp = Number(this.dhHp);
    const maxHp = Number(this.dhMaxHp);
    const isFullHealth = currentHp >= maxHp;

    const mainSection = html`
      <div id="map-modal-main-section">
        <div id="dh-header">
          <div id="dh-name">${this.dhName}</div>
          <div id="dh-status" class=${!this.isOwn ? 'enemy' : 'own'}>
            ${!this.isOwn ? '⚔️ Enemy Territory' : '🏠 Your Doghouse'}
          </div>
        </div>
        
        <div id="doghouse-icon">
          <svg-icon name="doghouseOne"></svg-icon>
        </div>
        
        <div id="dh-hp-section">
          <div id="dh-hp-label">
            <span>Health: ${this.dhHp}/${this.dhMaxHp}</span>
            <span class="hp-percent">(${hpPercent}%)</span>
          </div>
          <sl-progress-bar
            id="dh-hp-bar"
            class=${!this.isOwn ? 'dh-hp-bar--enemy' : 'dh-hp-bar--own'}
            value=${hpPercent}
          ></sl-progress-bar>
        </div>

        <div id="center">${!this.isOwn ? html`` : html``}</div>
        
        <div id="actions-section">
          ${!this.isOwn ? html`
            <div class="action-description">
              <sl-icon name="sword"></sl-icon>
              <span>Attack this doghouse to gain XP and potentially destroy it!</span>
            </div>
            <sl-button
              id="attack-btn"
              @click=${this.attackDoghouse}
              size="large"
              ?loading=${this.btnLoading}
              ?disabled=${this.btnLoading}
            >
              <sl-icon slot="prefix" name="sword"></sl-icon>
              Attack - ${attackEnergy}
              <sl-icon slot="suffix" name="lightning-charge"></sl-icon>
            </sl-button>
          ` : html`
            <div class="section-title">
              <sl-icon name="tools"></sl-icon>
              <span>Maintenance & Buffs</span>
            </div>
            
            <div class="action-group">
              <div class="action-label">Basic Repair</div>
              <sl-button
                class="repair-btn"
                @click=${this.repairDoghouse}
                ?loading=${this.btnLoading}
                ?disabled=${this.btnLoading || isFullHealth}
                size="medium"
              >
                <sl-icon slot="prefix" name="wrench"></sl-icon>
                Repair - ${repairEnergy}
                <sl-icon slot="suffix" name="lightning-charge"></sl-icon>
              </sl-button>
            </div>

            <div class="buffs-section">
              <div class="action-label">Power Buffs</div>
              <div class="buff-buttons">
                <sl-button
                  class="buff-btn buff-btn--repair50"
                  @click=${() => this.applyBuff('repair50')}
                  ?loading=${this.buffLoading === 'repair50'}
                  ?disabled=${this.buffLoading !== null || isFullHealth}
                  size="medium"
                >
                  <sl-icon slot="prefix" name="heart-pulse"></sl-icon>
                  +50 HP Buff
                </sl-button>
                
                <sl-button
                  class="buff-btn buff-btn--repairmax"
                  @click=${() => this.applyBuff('repairMax')}
                  ?loading=${this.buffLoading === 'repairMax'}
                  ?disabled=${this.buffLoading !== null || isFullHealth}
                  size="medium"
                >
                  <sl-icon slot="prefix" name="heart-fill"></sl-icon>
                  Max HP Buff
                </sl-button>
              </div>
            </div>

            ${isFullHealth ? html`
              <div class="full-health-notice">
                <sl-icon name="check-circle-fill"></sl-icon>
                <span>Your doghouse is at full health!</span>
              </div>
            ` : ''}
          `}
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

      <div id="map-modal-container">
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