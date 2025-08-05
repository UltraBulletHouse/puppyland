import { consume } from '@lit/context';
import { LitElement, PropertyValues, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { accessTokenContext } from '../../../contexts/userFirebaseContext';
import { viewContext } from '../../../contexts/viewContext';
import { Coords } from '../../../types/geolocation';
import { View } from '../../../types/view';
import { classNames } from '../../../utils/classNames';
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

  @consume({ context: viewContext, subscribe: true })
  @property({ attribute: false })
  currentView: View = View.MAP_VIEW;

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
  dhHpLocal?: string;

  @state()
  isClose: boolean = false;

  @state()
  isBlocked: boolean = false;

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
    const CLOSEST_DISTANCE = 2000;

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

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('dhHp')) {
      this.dhHpLocal = this.dhHp;
    }
    if (changedProperties.has('isClose')) {
      this.isBlocked = !this.isClose;
    }
    // Close modal when view changes away from MAP_VIEW
    if (changedProperties.has('currentView')) {
      if (this.currentView !== View.MAP_VIEW && this.isOpen) {
        this.closeMapModal();
      }
    }
  }

  updateDoghousesHandler(event: CustomEvent<string>) {
    this.dhHpLocal = event.detail;
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
          overflow: hidden;
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
          overflow: hidden;
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
        #next-btn.next-btn-is-blocked {
          background-color: var(--color-black-light);
          pointer-events: none;
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
        #close-btn.close-btn-is-own {
          color: var(--color-secondary);
        }
        .leaflet-popup-close-button {
          display: none;
        }
      </style>
      <div id="popup-container" @updateDoghouses=${this.updateDoghousesHandler}>
        <div id="doghouse-section">
          <p id="dh-name">${decodeURIComponent(this.dhName ?? '')}</p>
          <div id="dh-features">
            <div id="dh-features-wrapper">
              <span class="dh-features-item">
                <sl-icon name="heart" id="dh-features-icon-healh"></sl-icon>${this.dhHpLocal}
              </span>
              </span>
            </div>
          </div>
        </div>

        <div id="lower-section">
          <div id="owner-section">
            <div id="dog-icon">
              <svg-icon name="dogFace"></svg-icon>
            </div>
            <div id="dog-name">${decodeURIComponent(this.dogName ?? '')}</div>
          </div>
          <div id="popup-actions">
            <div
              id="close-btn"
              class=${classNames(this.isOwn && 'close-btn-is-own')}
              @click=${this.closePopup}
            >
              <sl-icon name="x"></sl-icon>
            </div>
            <div
              id="next-btn"
 
              class=${classNames(
                this.isOwn && 'next-btn-is-own',
                this.isBlocked && 'next-btn-is-blocked'
              )}
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
          .dhName=${decodeURIComponent(this.dhName ?? '')}
          .dhHp=${this.dhHp}
          .dhMaxHp=${this.dhMaxHp}
          @closeMapModal=${this.closeMapModal}
          @closePopup=${this.closePopup}
        ></map-modal>
      </div>`;
  }
}
