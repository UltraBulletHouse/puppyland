import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { accessTokenContext } from '../../../contexts/userFirebaseContext';
import '../map-modals/modal-enemy';

@customElement('map-popup-enemy')
export class MapPopupEnemy extends LitElement {
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
        #popup-enemy-container {
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
          background: var(--color-primary-light);
          padding: 7px;
          border-radius: 7px;
        }
        #dh-name {
          margin: 0;
          font-size: 16px;
          text-wrap: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          width: 100%;
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
          font-size: 14px;
          margin: 10px 0;
        }
        #hp-section sl-icon {
          margin-right: 4px;
        }
        #owner-section {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        #popup-footer {
          width: 100%;
          display: flex;
          justify-content: end;
        }
        #next-btn {
          display: flex;
          padding: 10px;
          border-radius: 50px;
          font-size: 22px;
          /* border-color: var(--color-primary); */
          background-color: var(--color-primary);
          color: #fff;
        }
        #close-btn {
          display: flex;
          padding: 10px;
          border-radius: 50px;
          font-size: 22px;
          /* border: 1px solid var(--color-primary); */
          color: var(--color-primary);
          background-color: #fff;
        }

        .leaflet-popup-close-button {
          display: none;
        }
      </style>
      <div id="popup-enemy-container">
        <div id="doghouse-section">
          <p id="dh-name">${decodeURIComponent(this.dhName ?? '')}</p>
          <p id="hp-section"><sl-icon name="heart"></sl-icon> ${this.dhHp}</p>
        </div>
        <div id="owner-section">
          <div id="dog-icon">
            <svg-icon name="dogFace"></svg-icon>
          </div>
          <div>Fafik pizdafik</div>
        </div>
        <div id="popup-footer">
          <div id="close-btn" @click=${this.openEnemyModal}><sl-icon name="x"></sl-icon></div>
          <div id="next-btn" @click=${this.openEnemyModal}>
            <sl-icon name="arrow-right"></sl-icon>
          </div>
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
