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
    this.closePopup();
  };

  openMapModal() {
    this.isOpen = true;
  }

  closePopup = () => {
    sendEvent(this, 'closePopup');
  };

  firstUpdated() {
    const CLOSEST_DISTANCE = 5000;

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
        #stats {
          display: flex;
          gap: 16px;
          align-items: center;
          background-color: rgba(0, 0, 0, 0.1);
          padding: 4px 8px;
          border-radius: var(--border-radius-small);
        }
        #hp-stat,
        #date-stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          color: var(--color-white);
        }
        #hp-stat sl-icon {
          color: var(--color-white);
          font-size: 14px;
        }
        #date-stat sl-icon {
          color: var(--color-black-light);
          font-size: 14px;
        }
        #hp-bar {
          width: 60px;
          height: 8px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          overflow: hidden;
          margin-left: 4px;
        }
        #hp-fill {
          height: 100%;
          background: linear-gradient(90deg, #e74c3c 0%, #f39c12 50%, #27ae60 100%);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        #owner-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-basis: 50%;
          height: 100%;
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
        #next-btn.next-btn-is-own {
          background-color: var(--color-secondary);
        }
        #next-btn.next-btn-is-blocked {
          background-color: var(--color-black-light);
          pointer-events: none;
        }
        #close-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          padding: 4px;
          border-radius: 50%;
          font-size: 16px;
          color: var(--color-white);
          background-color: rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        #close-btn:hover {
          background-color: rgba(0, 0, 0, 0.4);
        }
        .leaflet-popup-close-button {
          display: none;
        }
        .own-doghouse #doghouse-section {
          background: linear-gradient(135deg, var(--color-secondary-light), var(--color-secondary));
          color: var(--color-white);
        }
        .enemy-doghouse #doghouse-section {
          background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
          color: var(--color-white);
        }
      </style>
      <div
        id="popup-container"
        class=${classNames(
          this.isOwn ? 'own-doghouse' : 'enemy-doghouse',
          'animate__animated',
          'animate__fadeIn'
        )}
        @updateDoghouses=${this.updateDoghousesHandler}
      >
        <div id="doghouse-section">
          <div id="close-btn" @click=${this.closePopup}>
            <sl-icon name="x"></sl-icon>
          </div>
          <p id="dh-name">${decodeURIComponent(this.dhName ?? '')}</p>
          <div id="stats">
            <div id="hp-stat">
              <sl-icon name="heart-pulse"></sl-icon>
              <span>${this.dhHpLocal}/${this.dhMaxHp}</span>
              <div id="hp-bar">
                <div
                  id="hp-fill"
                  style="width: ${(Number(this.dhHpLocal) / Number(this.dhMaxHp)) * 100}%"
                ></div>
              </div>
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
