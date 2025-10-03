import { consume } from '@lit/context';
import L from 'leaflet';
import 'leaflet-edgebuffer';
import { LitElement, PropertyValues, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/badge/badge.js';

import doghouseEnemyPath from '../../assets/icons/marker-dh-enemy.svg';
import doghouseOwnPath from '../../assets/icons/marker-dh-own.svg';
import { API_DOGHOUSES_NEAR_USER, API_DOGHOUSE_CREATE } from '../../constants/apiConstants';
import { dogInfoContext, updateDogInfoEvent } from '../../contexts/dogInfoContext';
import { accessTokenContext } from '../../contexts/userFirebaseContext';
import { userInfoContext } from '../../contexts/userInfoContext';
import { GeolocationController } from '../../controllers/GeolocationController';
import { t } from '../../i18n';
import '../../scripts/leaflet-canvas-markers';
import { DogInfo } from '../../types/dog';
import {
  CreateDoghouseResponse,
  Doghouse,
  GetDoghouseNearUserResponse,
} from '../../types/doghouse';
import { Coords } from '../../types/geolocation';
import { TileLayerOptionsPlugins } from '../../types/map';
import { UserInfo } from '../../types/userInfo';
import { apiCall } from '../../utils/apiUtils';
import { getI18nMessage } from '../../utils/errorUtils';
import { sendEvent } from '../../utils/eventUtils';
import '../../utils/mapUtils';
import { drawMarker, generatePulsatingMarker } from '../../utils/mapUtils';
import { toastDanger, toastWarning } from '../../utils/toastUtils';
import '../level-up-modal/level-up-modal';
import { AppMapStyles } from './app-map-styles';
import './map-popup/map-popup';
import '../walkthrough/walkthrough-overlay';

/**
 * @fires updateDogInfo
 */
@customElement('app-map')
export class AppMap extends LitElement {
  static styles = AppMapStyles;

  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  @consume({ context: userInfoContext, subscribe: true })
  @property({ attribute: false })
  userInfo: UserInfo | null = null;

  @consume({ context: dogInfoContext, subscribe: true })
  @property({ attribute: false })
  dogInfo: DogInfo | null = null;

  @state()
  userPos: Coords | null = null;

  @state()
  map?: L.Map;

  @state()
  userPosMarker?: L.Marker;

  @state()
  doghouses?: Doghouse[];

  private doghouseMarkers: L.Marker[] = [];

  @state()
  doghouseOwnPath: string | null = null;

  @state()
  doghouseEnemyPath: string | null = null;

  @state()
  doghouseAttackPath: string | null = null;

  @state()
  openPopupId: string | null = null;

  @state()
  isLevelUp: boolean = false;

  @state()
  isWalkthroughOpen: boolean = false;

  @property({ attribute: false })
  focusTarget: Doghouse | null = null;

  private pendingFocus: Doghouse | null = null;

  private hasCenteredForPendingFocus = false;

  private lastFocusedDoghouse: Doghouse | null = null;

  openPopup(id: string | null) {
    this.openPopupId = id;
  }

  closePopup() {
    this.map?.closePopup();
  }

  private ensureDoghousePresent(target: Doghouse) {
    if (!target) return;
    if (!this.doghouses) {
      this.doghouses = [target];
      this.setDoghousesMarkers();
      return;
    }

    const index = this.doghouses.findIndex((doghouse) => doghouse.id === target.id);
    if (index === -1) {
      this.doghouses = [...this.doghouses, target];
      this.setDoghousesMarkers();
      return;
    }

    const existing = this.doghouses[index];
    if (
      existing.lat !== target.lat ||
      existing.lng !== target.lng ||
      existing.hp !== target.hp ||
      existing.maxHp !== target.maxHp ||
      existing.name !== target.name
    ) {
      const next = [...this.doghouses];
      next[index] = target;
      this.doghouses = next;
      this.setDoghousesMarkers();
    }
  }

  private ensureBoundsInclude(lat: number, lng: number) {
    if (!this.map) return;
    const targetLatLng = L.latLng(lat, lng);
    const currentBounds = this.map.options.maxBounds as L.LatLngBounds | undefined | null;
    if (currentBounds && !currentBounds.contains(targetLatLng)) {
      const expanded = L.latLngBounds(currentBounds.getSouthWest(), currentBounds.getNorthEast());
      expanded.extend(targetLatLng);
      this.map.setMaxBounds(expanded);
    }
  }

  private attemptPendingFocus() {
    if (!this.pendingFocus || !this.map) return;

    const target = this.pendingFocus;

    if (!this.hasCenteredForPendingFocus) {
      this.ensureBoundsInclude(target.lat, target.lng);
      const currentZoom = this.map.getZoom();
      const desiredZoom = Number.isFinite(currentZoom) ? Math.max(currentZoom, 17) : 17;
      this.map.flyTo([target.lat, target.lng], desiredZoom, { animate: true });
      this.hasCenteredForPendingFocus = true;
    }

    if (!this.doghouses || !this.doghouses.some((doghouse) => doghouse.id === target.id)) {
      return;
    }

    this.openPopup(target.id);
    this.pendingFocus = null;
    this.hasCenteredForPendingFocus = false;
    this.setDoghousesMarkers();
    sendEvent(this, 'mapFocusConsumed', { id: target.id });
  }

  centerPosition() {
    if (this.map && this.userPos) {
      this.map.setView([this.userPos.lat, this.userPos.lng], 17);
    }
  }

  private geolocation = new GeolocationController(this);

  watchUserPos() {
    this.geolocation.resetController();

    const watchUserPosCallback = (coords: Coords) => {
      this.userPos = coords;
    };
    this.geolocation.watchUserPostion(watchUserPosCallback);
  }

  /* ZMIANA - malowac markery (setDoghousesMarkers) co iles metrow */
  setUserPostion() {
    if (!this.map || !this.userPos) return;

    const { lat, lng } = this.userPos;
    if (this.userPosMarker) {
      this.userPosMarker.setLatLng([lat, lng]);

      this.setDoghousesMarkers();
    } else {
      const pulsatingIcon = generatePulsatingMarker(L, 10, 'var(--sky)');
      this.userPosMarker = L.marker([lat, lng], {
        icon: pulsatingIcon,
        zIndexOffset: 999999,
      }).addTo(this.map);
    }
  }

  closePopupHandler = () => {
    this.openPopup(null);
  };

  setDoghousesMarkers() {
    if (!this.map) return;

    // Remove any previously rendered doghouse markers before drawing replacements
    this.doghouseMarkers.forEach((marker) => marker.remove());
    this.doghouseMarkers = [];

    if (!this.userPos || !this.doghouses) return;

    const dogInfoId = this.dogInfo?.id;

    this.doghouses.forEach((doghouse: Doghouse) => {
      if (!this.map || !this.userPos) return;
      const { id, dogId, dogName, name, lat, lng, hp, maxHp, dogIcon } = doghouse;
      const dhName = encodeURIComponent(name);
      const dhDogName = encodeURIComponent(dogName ?? '');
      const dhDogIcon = encodeURIComponent(dogIcon ?? 'dogface-basic');

      const popupContent =
        dogId === dogInfoId
          ? `<map-popup
            isOwn=${true}
            dogId=${dogInfoId}
            dhId=${id}
            dogName=${dhDogName}
            dhName=${dhName}
            dhHp=${hp} 
            dhMaxHp=${maxHp}
            dogIcon=${dhDogIcon}
            dhCoords=${`${lat}/${lng}`}
            userCoords=${`${this.userPos.lat}/${this.userPos.lng}`}
            ></map-popup>
            `
          : `<map-popup
            dogId=${dogInfoId}
            dogName=${dhDogName}
            dhId=${id}
            dhName=${dhName}
            dhHp=${hp}
            dhMaxHp=${maxHp} 
            dogIcon=${dhDogIcon}
            dhCoords=${`${lat}/${lng}`}
            userCoords=${`${this.userPos.lat}/${this.userPos.lng}`}
            ></map-popup>
            `;

      const marker = drawMarker({
        self: this,
        coords: { lat, lng },
        popupContent,
        canvasMarkerImg: {
          url: dogId === dogInfoId ? doghouseOwnPath : doghouseEnemyPath,
        },
        openPopup: this.openPopupId === id,
        closePopupHandler: this.closePopupHandler,
      });

      if (marker) {
        this.doghouseMarkers.push(marker);
      }
    });

    this.attemptPendingFocus();
  }

  async getDoghousesList() {
    if (!this.map || !this.userPos) return;

    const {
      data: { doghousesList, geoRange },
    } = await apiCall().get<GetDoghouseNearUserResponse>(API_DOGHOUSES_NEAR_USER, {
      params: {
        lat: this.userPos.lat.toString(),
        lng: this.userPos.lng.toString(),
      },
    });

    if (!doghousesList) return;
    let mergedDoghouses = [...doghousesList];
    if (this.lastFocusedDoghouse) {
      const exists = mergedDoghouses.some(
        (doghouse) => doghouse.id === this.lastFocusedDoghouse?.id
      );
      if (!exists) {
        mergedDoghouses = [...mergedDoghouses, this.lastFocusedDoghouse];
      }
    }
    this.doghouses = mergedDoghouses;
    this.setDoghousesMarkers();
    this.attemptPendingFocus();

    const { latitudeMax, latitudeMin, longitudeMax, longitudeMin } = geoRange;
    const northEast = L.latLng(latitudeMax, longitudeMax);
    const southWest = L.latLng(latitudeMin, longitudeMin);
    const bounds = L.latLngBounds(southWest, northEast);
    this.map.setMaxBounds(bounds);
  }

  updateDoghousesHandler(event: CustomEvent<any>) {
    const detail = event.detail;

    // Manual refresh request or legacy events without detail
    if (!detail) {
      this.getDoghousesList();
      return;
    }

    if (typeof detail !== 'object') {
      this.getDoghousesList();
      return;
    }

    const { doghouseId, hp, isDestroyed } = detail as {
      doghouseId?: string;
      hp?: number;
      isDestroyed?: boolean;
    };

    if (!doghouseId) {
      this.getDoghousesList();
      return;
    }

    if (!this.doghouses) {
      this.getDoghousesList();
      return;
    }

    if (isDestroyed) {
      this.doghouses = this.doghouses.filter((doghouse) => doghouse.id !== doghouseId);
      if (this.openPopupId === doghouseId) {
        this.openPopupId = null;
        this.closePopup();
      }
      this.setDoghousesMarkers();
      return;
    }

    if (typeof hp !== 'number') {
      this.getDoghousesList();
      return;
    }

    let hasMatch = false;
    this.doghouses = this.doghouses.map((doghouse) => {
      if (doghouse.id === doghouseId) {
        hasMatch = true;
        return { ...doghouse, hp };
      }
      return doghouse;
    });

    if (!hasMatch) {
      this.getDoghousesList();
      return;
    }

    this.setDoghousesMarkers();
  }

  /* OK - raczej */
  async addDoghouse() {
    if (!this.accessToken || !this.userPos || !this.dogInfo) return;
    try {
      const createDoghouseResponse = await apiCall(this.accessToken).post<CreateDoghouseResponse>(
        API_DOGHOUSE_CREATE,
        {
          dogId: this.dogInfo.id,
          lat: this.userPos.lat,
          lng: this.userPos.lng,
        }
      );

      if (createDoghouseResponse.status === 200) {
        const { createResult, dog, isLevelUp } = createDoghouseResponse.data;

        if (isLevelUp) {
          this.isLevelUp = isLevelUp;
        }

        updateDogInfoEvent(this, dog);

        this.getDoghousesList();

        this.openPopup(createResult.id);
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const i18nMsg = getI18nMessage(err);
      const fallbackTooClose = 'Too close to another doghouse. Move a bit farther and try again.';
      const fallbackGeneric = 'Failed to create doghouse. Please try again.';
      if (status === 409) {
        toastWarning(i18nMsg || fallbackTooClose);
      } else {
        toastDanger(i18nMsg || fallbackGeneric);
      }
    }
  }

  updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('focusTarget')) {
      if (this.focusTarget) {
        const target = { ...this.focusTarget };
        this.pendingFocus = target;
        this.lastFocusedDoghouse = target;
        this.hasCenteredForPendingFocus = false;
        this.ensureDoghousePresent(target);
        this.attemptPendingFocus();
      } else {
        this.pendingFocus = null;
        this.hasCenteredForPendingFocus = false;
      }
    }

    if (changedProperties.has('doghouses')) {
      this.attemptPendingFocus();
    }

    if (changedProperties.has('userPos') && this.map && this.userPos) {
      const { lat, lng } = this.userPos;
      this.map.setView([lat, lng], 17);

      if (!this.doghouses) {
        this.getDoghousesList();
      }
    }

    if (this.userPos && this.map) {
      this.setUserPostion();
    }
  }

  /* OK */
  async firstUpdated() {
    /* Create Map */
    const mapEl = this.shadowRoot?.querySelector('#map') as HTMLDivElement;
    if (!mapEl) return;
    const map = L.map(mapEl, {
      renderer: L.canvas(),
    });
    this.map = map;

    const urlTemplate = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    map.addLayer(
      L.tileLayer(urlTemplate, {
        minZoom: 13,
        maxZoom: 19,
        attribution: '© OpenStreetMap',
        edgeBufferTiles: 1,
        preferCanvas: true,
        zoomSnap: 0.5,
      } as TileLayerOptionsPlugins)
    );

    this.map.attributionControl.setPosition('topright');

    this.watchUserPos();
    this.attemptPendingFocus();
  }

  closeLevelUpModal = () => {
    this.isLevelUp = false;
  };

  openWalkthrough = () => {
    this.isWalkthroughOpen = true;
  };
  closeWalkthrough = () => {
    this.isWalkthroughOpen = false;
  };

  render() {
    return html`
      <link rel="stylesheet" href="/leaflet/leaflet.css" />
      <div id="container" @updateDoghouses=${this.updateDoghousesHandler}>
        ${this.isLevelUp
          ? html`
              <div class="level-up-modal-wrapper">
                <level-up-modal
                  .dogInfo=${this.dogInfo}
                  @close=${this.closeLevelUpModal}
                ></level-up-modal>
              </div>
            `
          : ''}
        <div id="info-box">
          <div id="info-box-line">
            <sl-icon id="info-box-icon" name="lightning-charge"></sl-icon>${this.dogInfo?.energy}
          </div>
        </div>

        <div id="map" @closePopup=${this.closePopup}></div>

       <button id="help-btn" class="help-btn" type="button" @click=${this.openWalkthrough} aria-label="Help and walkthrough">
         <span class="help-icon">?</span>
       </button>

        <div id="controls">
          <div id="left-side">
            <div id="add-doghouse" @click=${this.addDoghouse}>
              <sl-button
                id="add-doghouse-btn"
                variant="default"
                size="large"
                circle
                ?disabled=${!this.dogInfo?.availableDoghouses}
              >
                <sl-badge id="add-doghouse-badge" variant="warning" pill
                  >${this.dogInfo?.availableDoghouses}</sl-badge
                >
                <sl-icon name="house-add" id="add-doghouse-icon"></sl-icon>
              </sl-button>
            </div>
          </div>

          <div id="right-side">
            <div id="center-position" @click=${this.centerPosition}>
              <sl-button id="center-position-btn" variant="default" size="large" circle>
                <svg-icon name="accurate" id="center-position-icon"></svg-icon>
              </sl-button>
            </div>
          </div>
        </div>

        ${!this.userPos &&
        html`<div id="geolocation-overlay">
          <div id="geolocation-overlay-content">
            <div id="geolocation-position" @click=${this.watchUserPos}>
              <svg-icon name="accurate" id="geolocation-position-icon"></svg-icon>
              <p id="geolocation-position-text">${t('turnOnGpsWait')}</p>
            </div>
          </div>
        </div>`}

        <walkthrough-overlay
          .open=${this.isWalkthroughOpen}
          @close=${this.closeWalkthrough}
        ></walkthrough-overlay>
      </div>
    `;
  }
}
