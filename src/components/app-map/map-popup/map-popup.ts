import { consume } from '@lit/context';
import { LitElement, PropertyValues, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { dogInfoContext } from '../../../contexts/dogInfoContext';
import { accessTokenContext } from '../../../contexts/userFirebaseContext';
import { viewContext } from '../../../contexts/viewContext';
import { DogInfo } from '../../../types/dog';
import { Coords } from '../../../types/geolocation';
import { View } from '../../../types/view';
import { classNames } from '../../../utils/classNames';
import { sendEvent } from '../../../utils/eventUtils';
import { checkHowClose } from '../../../utils/mapUtils';
import { ti } from '../../../i18n';
import { toastWarning } from '../../../utils/toastUtils';
import '../../icon-svg/svg-icon';
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

  @consume({ context: dogInfoContext, subscribe: true })
  @property({ attribute: false })
  dogInfo: DogInfo | null = null;

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

  @property({ type: String })
  dogIcon?: string;

  @state()
  dhHpLocal?: string;

  @state()
  isClose: boolean = false;

  @state()
  isBlocked: boolean = false;

  @state()
  isOpen: boolean = false;

  @state()
  private lastDistanceMeters: number | null = null;

  @state()
  private currentReachMeters: number | null = null;

  handleOpenClick = (event: Event) => {
    if (this.isBlocked) {
      event.preventDefault();
      const distance = this.lastDistanceMeters ?? 0;
      const reach = this.currentReachMeters ?? this.getReachMeters();
      const roundedDistance = Math.max(0, Math.round(distance));
      const roundedReach = Math.max(0, Math.round(reach));
      toastWarning(
        ti('errors.reach.outOfReach', { distanceMeters: roundedDistance, reachMeters: roundedReach })
      );
      return;
    }

    this.openMapModal();
  };

  private static readonly BASE_REACH_DISTANCE = 200;
  private static readonly REACH_PER_POINT = 10;

  private getReachMeters(): number {
    const direct = this.dogInfo?.reachMeters;
    if (typeof direct === 'number' && Number.isFinite(direct)) {
      return direct;
    }

    const derivedReach =
      (this.dogInfo as any)?.derived?.reachMeters ?? (this.dogInfo as any)?.derivedStats?.reachMeters;
    if (typeof derivedReach === 'number' && Number.isFinite(derivedReach)) {
      return derivedReach;
    }

    const attributeReach = (this.dogInfo as any)?.attributes?.reach;
    if (typeof attributeReach === 'number' && Number.isFinite(attributeReach)) {
      return (
        MapPopup.BASE_REACH_DISTANCE + MapPopup.REACH_PER_POINT * Math.max(0, attributeReach)
      );
    }

    return MapPopup.BASE_REACH_DISTANCE;
  }

  private parseCoords(value: string | undefined | null): Coords | null {
    if (!value) return null;
    const parts = value.split('/');
    if (parts.length < 2) return null;
    const lat = Number(parts[0]);
    const lng = Number(parts[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }

  private updateProximity() {
    const doghouseCoords = this.parseCoords(this.dhCoords);
    const userCoords = this.parseCoords(this.userCoords);
    if (!doghouseCoords || !userCoords) {
      if (this.isClose) {
        this.isClose = false;
      }
      if (!this.isBlocked) {
        this.isBlocked = true;
      }
      this.lastDistanceMeters = null;
      this.currentReachMeters = null;
      return;
    }

    const distance = checkHowClose(userCoords, doghouseCoords);
    const reachMeters = this.getReachMeters();

    this.lastDistanceMeters = distance;
    this.currentReachMeters = reachMeters;

    const isClose = distance <= reachMeters;

    if (this.isClose !== isClose) {
      this.isClose = isClose;
    }

    const shouldBlock = !isClose;
    if (this.isBlocked !== shouldBlock) {
      this.isBlocked = shouldBlock;
    }
  }

  private decodeValue(value: string | undefined | null, preferredPrefix?: string): string {
    if (!value) return '';
    const decoded = decodeURIComponent(value);
    const prefixes = preferredPrefix
      ? [preferredPrefix, 'dhName=', 'dogName=']
      : ['dhName=', 'dogName='];
    const matched = prefixes.find((prefix) => decoded.startsWith(prefix));
    return matched ? decoded.slice(matched.length) : decoded;
  }

  private decodeDogIcon(value: string | undefined | null): string {
    if (!value) {
      return 'dogface-basic';
    }
    try {
      return decodeURIComponent(value);
    } catch (_error) {
      return 'dogface-basic';
    }
  }

  closeMapModal = (_e?: CustomEvent<{ manual?: boolean }>) => {
    this.isOpen = false;
    // Map refresh is emitted by map-modal on manual close to avoid duplicate events
    this.closePopup();
  };

  openMapModal() {
    this.isOpen = true;
  }

  closePopup = () => {
    sendEvent(this, 'closePopup');
  };

  firstUpdated() {
    this.updateProximity();
  }

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('dhHp')) {
      this.dhHpLocal = this.dhHp;
    }
    if (
      changedProperties.has('dhCoords') ||
      changedProperties.has('userCoords') ||
      changedProperties.has('dogInfo')
    ) {
      this.updateProximity();
    }
    // Close modal when view changes away from MAP_VIEW
    if (changedProperties.has('currentView')) {
      if (this.currentView !== View.MAP_VIEW && this.isOpen) {
        this.closeMapModal();
      }
    }
  }

  updateDoghousesHandler(event: CustomEvent<any>) {
    const detail = event.detail;

    if (detail && typeof detail === 'object') {
      if (detail.doghouseId && detail.doghouseId !== this.dhId) {
        return;
      }

      if (typeof detail.hp === 'number') {
        this.dhHpLocal = detail.hp.toString();
      } else if (typeof detail.hp === 'string') {
        this.dhHpLocal = detail.hp;
      }

      if (detail.isDestroyed) {
        this.dhHpLocal = '0';
      }

      return;
    }

    if (typeof detail === 'string') {
      this.dhHpLocal = detail;
    }
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
        #dog-icon svg-icon {
          width: 48px;
          height: 48px;
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
        .enemy-doghouse {
          --enemy-accent: #f3a248;
          --enemy-accent-light: color-mix(in srgb, var(--enemy-accent) 45%, #fff);
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
          background: linear-gradient(90deg, #9b0808 0%, #c62828 55%, #ff7a7a 100%);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        /* Ownership-specific HP colors share the same red gradient for consistency */
        .own-doghouse #hp-fill,
        .enemy-doghouse #hp-fill {
          background: linear-gradient(90deg, #9b0808 0%, #c62828 55%, #ff7a7a 100%);
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
        /* Swap colors: enemy secondary, own primary */
        .enemy-doghouse #next-btn {
          background-color: var(--enemy-accent);
        }
        .own-doghouse #next-btn {
          background-color: var(--color-primary);
        }
        #next-btn.next-btn-is-blocked {
          background-color: var(--color-black-light);
          cursor: not-allowed;
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
          background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
          color: var(--color-white);
        }
        .enemy-doghouse #doghouse-section {
          background: linear-gradient(135deg, var(--enemy-accent-light), var(--enemy-accent));
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
          <p id="dh-name">${this.decodeValue(this.dhName, 'dhName=')}</p>
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
              <svg-icon .name=${this.decodeDogIcon(this.dogIcon)}></svg-icon>
            </div>
            <div id="dog-name">${this.decodeValue(this.dogName, 'dogName=')}</div>
          </div>
          <div id="popup-actions">
            <div
              id="next-btn"
              class=${classNames(
                this.isOwn && 'next-btn-is-own',
                this.isBlocked && 'next-btn-is-blocked'
              )}
              @click=${this.handleOpenClick}
            >
              <sl-icon name="arrow-right"></sl-icon>
            </div>
          </div>
        </div>

        <map-modal
          .open=${this.isOpen}
          .isOwn=${Boolean(this.isOwn)}
          .dhId=${this.dhId}
          .dhName=${this.decodeValue(this.dhName, 'dhName=')}
          .dhHp=${this.dhHp}
          .dhMaxHp=${this.dhMaxHp}
          .lat=${Number(this.userCoords?.split('/')[0] ?? '0')}
          .lng=${Number(this.userCoords?.split('/')[1] ?? '0')}
          @closeMapModal=${this.closeMapModal}
          @closePopup=${this.closePopup}
        ></map-modal>
      </div>`;
  }
}
