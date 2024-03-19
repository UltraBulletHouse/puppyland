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

  @property({ type: Boolean })
  isOwn: boolean = false;

  @property({ type: String })
  dogId?: string;

  @property({ type: String })
  dogName?: string;

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
    this.attackResult = null;

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
          color: var(--color-primary);
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
        #footer-btn {
          padding: 10px;
        }
        #center {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        #doghouse-icon {
          font-size: 80px;
        }
        #dog-icon {
          font-size: 80px;
        }
        #versus {
          display: flex;
          justify-content: center;
          margin: 30px 0px;
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
          <div id="close-btn" @click=${this.closeMapModal}>
            <sl-icon name="x"></sl-icon>
          </div>
        </div>
        <div id="dh-info">
          <div id="dh-name">${this.dhName}</div>
        </div>
        <div id="dh-hp-container">
          <sl-progress-bar id="dh-hp-bar" value=${hpPercent}>${this.dhHp}</sl-progress-bar>
        </div>

        <div id="center">
          ${!this.isOwn
            ? html`
                <div id="doghouse-icon"><svg-icon name="doghouseOne"></svg-icon></div>
                <div id="versus">vs</div>
                <div id="dog-icon">
                  <svg-icon name="dogFace"></svg-icon>
                </div>
                <div id="dog-info">
                  <div>${decodeURIComponent(this.dogName ?? '')}</div>
                </div>
              `
            : html`<div>BUU</div>`}
        </div>
        
        <div id="footer-btn">
        ${!this.isOwn
            ? html`<sl-button id="attack-btn" @click=${this.attackDoghouse} pill>Attack</sl-button>`
            : html`<sl-button id="heal-btn"  pill>Heal</sl-button>`}
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
