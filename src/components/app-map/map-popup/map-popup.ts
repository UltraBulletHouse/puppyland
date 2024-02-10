import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { accessTokenContext } from '../../../contexts/userFirebaseContext';
import { sendEvent } from '../../../utils/eventUtils';
import '../map-modals/map-modal';

/**
 * @fires closePopup
 */
@customElement('map-popup')
export class MapPopup extends LitElement {
  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

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
  isOpen: boolean = false;

  closeMapModal = () => {
    this.isOpen = false;
  };

  openMapModal() {
    this.isOpen = true;
  }

  closePopup = () => {
    sendEvent(this, 'closePopup');
  };

  protected createRenderRoot() {
    return this;
  }

  render() {
    return html` <style>
        #popup-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }
        #doghouse-section {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          background: var(--color-primary-light);
          padding: 7px;
          border-radius: var(--border-radius-small);
        }
        #dh-name {
          display: flex;
          justify-content: center;
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          text-wrap: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          width: 100%;
        }
        #dog-icon {
          display: flex;
          justify-content: center;
          font-size: 40px;
        }
        #dog-name {
          font-size: 12px;
        }
        #hp-section {
          display: flex;
          align-items: center;
          font-size: 14px;
          margin: 10px 0;
        }
        #hp-section sl-icon {
          margin-right: 4px;
        }
        #owner-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-basis: 50%;
          height: 100%;
          background: var(--color-primary-light);
          border-radius: var(--border-radius-small);
        }
        #lower-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex: 1;
          margin-top: 8px;
          width: 100%;
        }
        #popup-actions {
          display: flex;
          justify-content: center;
          flex-basis: 50%;
        }
        #next-btn {
          display: flex;
          padding: 10px 14px;
          border-radius: 50px;
          font-size: 22px;
          background-color: var(--color-primary);
          color: var(--color-white);
        }
        #close-btn {
          display: flex;
          padding: 10px 10px;
          border-radius: 50px;
          font-size: 22px;
          color: var(--color-primary);
          background-color: var(--color-white);
        }

        .leaflet-popup-close-button {
          display: none;
        }
      </style>
      <div id="popup-container">
        <div id="doghouse-section">
          <p id="dh-name">${decodeURIComponent(this.dhName ?? '')}</p>
          <p id="hp-section"><sl-icon name="heart"></sl-icon> ${this.dhHp}</p>
        </div>

        <div id="lower-section">
          <div id="owner-section">
            <div id="dog-icon">
              <svg-icon name="dogFace"></svg-icon>
            </div>
            <div id="dog-name">ReksioPizdeksio</div>
          </div>
          <div id="popup-actions">
            <div id="close-btn" @click=${this.closePopup}><sl-icon name="x"></sl-icon></div>
            <div id="next-btn" @click=${this.openMapModal}>
              <sl-icon name="arrow-right"></sl-icon>
            </div>
          </div>
        </div>

        <map-modal
          .open=${this.isOpen}
          .dhId=${this.dhId}
          .dhName=${decodeURIComponent(this.dhName ?? '')}
          .dhHp=${this.dhHp}
          .dhMaxHp=${this.dhMaxHp}
          .dogId=${this.dogId}
          @closeMapModal=${this.closeMapModal}
        ></map-modal>
      </div>`;
  }
}