import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/progress-bar/progress-bar.js';

import { API_DOGHOUSE_ATTACK } from '../../../constants/apiConstants';
import { updateDogInfoEvent } from '../../../contexts/dogInfoContext';
import { accessTokenContext } from '../../../contexts/userFirebaseContext';
import { AttackDoghouseResponse, AttackResult } from '../../../types/doghouse';
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

  @property({ type: Boolean })
  open: boolean = false;

  @property({ type: String })
  dogId?: string;

  @property({ type: String })
  dhId?: string;

  @property({ type: String })
  dhName?: string;

  @property({ type: String })
  dhHp?: string;

  @property({ type: String })
  dhMaxHp?: string;

  @state()
  attackResult: AttackResult | null = null;

  closeMapModal = () => {
    sendEvent(this, 'closeMapModal');
  };

  attackDoghouse = async () => {
    this.attackResult = null;

    if (!this.accessToken || !this.dhId || !this.dogId) return;

    const attackDoghouseResponse = await apiCall(this.accessToken).patch<AttackDoghouseResponse>(
      API_DOGHOUSE_ATTACK,
      { doghouseId: this.dhId, dogId: this.dogId }
    );

    const dogInfoResponse = attackDoghouseResponse?.data?.dog;
    const attackResult = attackDoghouseResponse?.data?.attackResult;

    this.attackResult = attackResult;

    if (dogInfoResponse) {
      updateDogInfoEvent(this, dogInfoResponse);
    }
  };

  render() {
    const hpPercent = Math.round((Number(this.dhHp) / Number(this.dhMaxHp)) * 100);

    const baseTemplate = html` <style>
        #map-modal-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          width: 100%;
          padding-top: 20px;
        }
        #dh-name {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          font-weight: 600;
          font-size: 17px;
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
          --indicator-color: var(--color-primary);
          --height: 12px;
        }
        #attack-btn {
          align-self: flex-end;
        }
        #center {
          flex: 1;
        }
      </style>
      <div id="map-modal-container">
        <div id="dh-info">
          <div id="dh-name">${this.dhName}</div>
        </div>
        <div id="dh-hp-container">
          <sl-progress-bar id="dh-hp-bar" value=${hpPercent}>${this.dhHp}</sl-progress-bar>
        </div>

        <div id="center"></div>

        <div id="attack-btn">
          <sl-button @click=${this.attackDoghouse} pill>Attack</sl-button>
          <sl-button @click=${this.closeMapModal} pill>Close</sl-button>
        </div>
      </div>`;

    const attackResultTemplate = html` <style>
        #map-modal-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          width: 100%;
        }
      </style>
      <div id="map-modal-container">
        <h3>Congratulation!!!</h3>
        <p>You dealt ${this.attackResult?.damageDealt} damages!</p>
        <p>You gained ${this.attackResult?.experienceGained} experience!</p>
        <p>Doghouse is ${this.attackResult?.isDoghouseDestroyed ? 'destroyed' : 'not destroyed'}</p>
        <sl-button @click=${this.closeMapModal} pill>Close</sl-button>
      </div>`;

    const modalTemplate = this.attackResult ? attackResultTemplate : baseTemplate;

    return html`<app-modal
      modalId="attack-doghouse"
      .open=${this.open}
      .element=${modalTemplate}
    ></app-modal>`;
  }
}
