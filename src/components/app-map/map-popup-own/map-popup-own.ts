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
        #popup-attack-container {
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
      </style>
      <div id="popup-attack-container">
        <div id="dog-icon">
          <svg-icon name="dogFace"></svg-icon>
        </div>
        <strong>${decodeURIComponent(this.dhName ?? '')}</strong>
        <p>HP: ${this.dhHp}/${this.dhMaxHp}</p>
        <div slot="footer">
          <sl-button id="attack-btn" @click=${this.openEnemyModal} pill>More</sl-button>
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
