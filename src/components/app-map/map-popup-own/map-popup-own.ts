import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { accessTokenContext } from '../../../contexts/userFirebaseContext';
import '../map-modals/modal-enemy';

@customElement('map-popup-own')
export class MapPopupOwn extends LitElement {
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

  closeModal = () => {
    this.isOpen = false;
  };

  openEnemyModal() {
    this.isOpen = true;
  }

  protected createRenderRoot() {
    return this;
  }

  render() {
    return html` <style>
        #popup-own-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }
        #dog-icon {
          display: flex;
          justify-content: center;
          font-size: 40px;
          margin-bottom: 10px;
        }
        #hp-section {
          display: flex;
          align-items: center;
          font-size: 20px;
          margin: 10px 0;
          color: var(--color-orange);
        }
        #hp-section sl-icon {
          margin-right: 4px;
        }
        #more-btn::part(base) {
          border-color: var(--color-orange);
          color: var(--color-orange);
        }
        /* .leaflet-popup-content-wrapper{
          background: linear-gradient(180deg, rgb(245 225 191) 0%, rgb(230 171 69) 100%);
        }
        .leaflet-popup-tip {
          background: rgb(230 171 69);
        } */
      </style>
      <div id="popup-own-container">
        <div id="dog-icon">
          <svg-icon name="dogFace"></svg-icon>
        </div>
        <strong>${decodeURIComponent(this.dhName ?? '')}</strong>
        <div id="hp-section">
          <sl-icon name="heart-pulse"></sl-icon> ${this.dhHp}/${this.dhMaxHp}
        </div>
        <div slot="footer">
          <sl-button id="more-btn" @click=${this.openEnemyModal} pill>More</sl-button>
        </div>

        <modal-enemy
          .open=${this.isOpen}
          .dhId=${this.dhId}
          .dhName=${this.dhName}
          .dhHp=${this.dhHp}
          .dhMaxHp=${this.dhMaxHp}
          .dogId=${this.dogId}
          @enemyModal=${this.closeModal}
        ></modal-enemy>
      </div>`;
  }
}
