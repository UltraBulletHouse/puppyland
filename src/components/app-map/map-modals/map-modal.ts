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
  isLevelUp: boolean = true;

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

    const attackDoghouseResponse = await apiCall(this.accessToken).patch<RepairDoghouseResponse>(
      API_DOGHOUSE_REPAIR,
      { doghouseId: this.dhId, dogId: this.dogInfo.id }
    );

    const dogInfoResponse = attackDoghouseResponse?.data?.dog;

    if (dogInfoResponse) {
      updateDogInfoEvent(this, dogInfoResponse);
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
      <div id="map-modal-main-section">
        <div id="dh-info">
          <div id="dh-name">${this.dhName}</div>
          <div id="doghouse-icon"><svg-icon name="doghouseOne"></svg-icon></div>
        </div>
        <div id="dh-hp-container">
          <sl-progress-bar
            id="dh-hp-bar"
            class=${!this.isOwn ? 'dh-hp-bar--enemy' : ''}
            value=${hpPercent}
            >${this.dhHp}</sl-progress-bar
          >
        </div>
        <div id="center">${!this.isOwn ? html`` : html``}</div>
        <div id="footer-btn">
          ${!this.isOwn
            ? html`<sl-button
                id="attack-btn"
                @click=${this.attackDoghouse}
                pill
                ?loading=${this.btnLoading}
                ?disabled=${this.btnLoading}
                >Bite - ${attackEnergy}<sl-icon name="lightning-charge"></sl-icon
              ></sl-button>`
            : html`<sl-button id="heal-btn" @click=${this.repairDoghouse} pill
                >Repair - ${repairEnergy}<sl-icon name="lightning-charge"></sl-icon
              ></sl-button>`}
        </div>
      </div>
    `;

    const levelUpSection = html`
      <div id="map-modal-level-up">
        <h2>🎉 Level Up! 🎉</h2>
        <p>Your dog has leveled up!</p>
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
