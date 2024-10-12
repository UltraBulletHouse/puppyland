import { consume } from '@lit/context';
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

/**
 * @fires closeMapModal
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
    }, 4000);
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

    // const attackMessage = attackResult.isDoghouseDestroyed
    //   ? `You destroyed ${this.dhName}`
    //   : `You dealt ${attackResult.damageDealt} damages to ${this.dhName}`;

    alertNotifySuccess(`
      💥 ${attackResult.damageDealt} DMG  </br>
      🎓 ${attackResult.experienceGained} XP
      `, {
      duration: 5000,
    });

    if (dogInfoResponse) {
      updateDogInfoEvent(this, dogInfoResponse);
    }
    if (doghouseInfoResponse) {
      this.dhHp = doghouseInfoResponse.hp.toString();
    }
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

  render() {
    // WEBSOCKETS
    // this.runSignal()
    const hpPercent = Math.round((Number(this.dhHp) / Number(this.dhMaxHp)) * 100);

    const baseTemplate = html` <style>
        #map-modal-container {
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
      </style>
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
      </div>`;

    return html`<app-modal
      modalId="attack-doghouse"
      .open=${this.open}
      .element=${baseTemplate}
    ></app-modal>`;
  }
}
