import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { accessTokenContext } from '../../../contexts/userFirebaseContext';
import { Coords } from '../../../types/geolocation';
import { sendEvent } from '../../../utils/eventUtils';
import { checkHowClose } from '../../../utils/mapUtils';
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
  dhCoords?: string;

  @property({ type: String })
  userCoords?: string;

  @property({ type: Boolean })
  isOwn?: boolean;

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
  isClose: boolean = false;

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

  firstUpdated() {
    const CLOSEST_DISTANCE = 20;

    const dhCoordsArr = this.dhCoords?.split('/');
    let dhCoordsObj: Coords = { lat: 0, lng: 0 };
    if (dhCoordsArr?.[0] && dhCoordsArr?.[1]) {
      dhCoordsObj = { lat: parseFloat(dhCoordsArr[0]), lng: parseFloat(dhCoordsArr[1]) };
    }

    const userCoordsArr = this.userCoords?.split('/');
    let userCoordsObj: Coords = { lat: 0, lng: 0 };
    if (userCoordsArr?.[0] && userCoordsArr?.[1]) {
      userCoordsObj = { lat: parseFloat(userCoordsArr[0]), lng: parseFloat(userCoordsArr[1]) };
    }

    const dhProximity = checkHowClose(userCoordsObj, dhCoordsObj);
    this.isClose = dhProximity < CLOSEST_DISTANCE;
  }

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
          width: 100%;
          margin: 0;
          font-weight: 600;
          font-size: 17px;
          text-wrap: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        #dog-icon {
          display: flex;
          justify-content: center;
          font-size: 40px;
        }
        #dog-name {
          font-size: 12px;
        }
        #dh-features {
          display: flex;
          align-items: center;
          font-size: 14px;
          margin: 14px 0 6px;
        }
        #dh-features-wrapper {
          display: flex;
          border: 1px solid var(--color-black-light);
          border-radius: var(--border-radius-big);
        }
        .dh-features-item {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1px 8px;
        }
        .dh-features-item-middle {
          border-left: 1px solid var(--color-black-light);
          color: var(--color-black-light);
        }
        .dh-features-item-is-close {
          color: var(--color-black);
        }
        #dh-features-icon-healh {
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
        #close-btn.close-btn-is-own {
          color: var(--color-secondary);
        }
        #next-btn.next-btn-is-own {
          background-color: var(--color-secondary);
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
          <div id="dh-features">
            <div id="dh-features-wrapper">
              <span class="dh-features-item">
                <sl-icon name="heart" id="dh-features-icon-healh"></sl-icon>${this.dhHp}
              </span>
              <span
                class="dh-features-item dh-features-item-middle ${this.isClose
                  ? 'dh-features-item-is-close'
                  : ''}"
              >
                <sl-icon name="hammer" id="dh-features-icon-repair"></sl-icon>
              </span>
              <span
                class="dh-features-item dh-features-item-middle ${this.isClose
                  ? 'dh-features-item-is-close'
                  : ''}"
              >
                <sl-icon name="heart-arrow" id="dh-features-icon-attack"></sl-icon>
              </span>
            </div>
          </div>
        </div>

        <div id="lower-section">
          <div id="owner-section">
            <div id="dog-icon">
              <svg-icon name="dogFace"></svg-icon>
            </div>
            <div id="dog-name">ReksioPizdeksio</div>
          </div>
          <div id="popup-actions">
            <div
              id="close-btn"
              class=${this.isOwn ? 'close-btn-is-own' : ''}
              @click=${this.closePopup}
            >
              <sl-icon name="x"></sl-icon>
            </div>
            <div
              id="next-btn"
              class=${this.isOwn ? 'next-btn-is-own' : ''}
              @click=${this.openMapModal}
            >
              <sl-icon name="arrow-right"></sl-icon>
            </div>
          </div>
        </div>

        <map-modal
          .open=${this.isOpen}
          .isOwn=${Boolean(this.isOwn)}
          .dhId=${this.dhId}
          .dogName=${this.dogName}
          .dhName=${decodeURIComponent(this.dhName ?? '')}
          .dhHp=${this.dhHp}
          .dhMaxHp=${this.dhMaxHp}
          .dogId=${this.dogId}
          @closeMapModal=${this.closeMapModal}
        ></map-modal>
      </div>`;
  }
}
