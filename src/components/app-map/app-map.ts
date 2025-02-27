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
import { alertNotifySuccess } from '../../utils/alertsUtils';
import { apiCall } from '../../utils/apiUtils';
import '../../utils/mapUtils';
import { drawMarker, generatePulsatingMarker } from '../../utils/mapUtils';
import { AppMapStyles } from './app-map-styles';
import './map-popup/map-popup';

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

  @state()
  doghouseOwnPath: string | null = null;

  @state()
  doghouseEnemyPath: string | null = null;

  @state()
  doghouseAttackPath: string | null = null;

  @state()
  openPopupId: string | null = null;

  openPopup(id: string | null) {
    this.openPopupId = id;
  }

  closePopup() {
    this.map?.closePopup();
  }

  centerPosition() {
    if (this.map && this.userPos) {
      this.map.setView([this.userPos.lat, this.userPos.lng], 17);
    }
  }

  private geolocation = new GeolocationController(this);

  getUserPosition() {
    console.log('getUserPosition');

    this.geolocation.checkPermissions()

    const getUserPosCallback = (coords: Coords) => {
      console.log('getUserPositionCallback', coords);
      this.userPos = coords;
    };
    this.geolocation.getUserPosition(getUserPosCallback);
  }

  watchUserPos() {
    console.log('watchUserPos');
    const watchUserPosCallback = (coords: Coords) => {
      console.log('watchUserPosCallback', coords);
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
      const pulsatingIcon = generatePulsatingMarker(L, 10, 'var(--color-blue)');
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
    if (!this.map || !this.userPos || !this.doghouses) return;

    const dogInfoId = this.dogInfo?.id;

    this.doghouses.forEach((doghouse: Doghouse) => {
      if (!this.map || !this.userPos) return;
      const { id, dogId, dogName, name, lat, lng, hp, maxHp } = doghouse;
      const dhName = encodeURIComponent(name);
      const dhDogName = encodeURIComponent(dogName ?? '');

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
            dhCoords=${`${lat}/${lng}`}
            userCoords=${`${this.userPos.lat}/${this.userPos.lng}`}
            ></map-popup>
            `;

      drawMarker({
        self: this,
        coords: { lat, lng },
        popupContent,
        canvasMarkerImg: {
          url: dogId === dogInfoId ? doghouseOwnPath : doghouseEnemyPath,
        },
        openPopup: this.openPopupId === id,
        closePopupHandler: this.closePopupHandler,
      });
    });
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
    this.doghouses = doghousesList;

    const { latitudeMax, latitudeMin, longitudeMax, longitudeMin } = geoRange;
    const northEast = L.latLng(latitudeMax, longitudeMax);
    const southWest = L.latLng(latitudeMin, longitudeMin);
    const bounds = L.latLngBounds(southWest, northEast);
    this.map.setMaxBounds(bounds);
  }

  updateDoghousesHandler() {
    this.getDoghousesList();
  }

  /* OK - raczej */
  async addDoghouse() {
    if (!this.accessToken || !this.userPos || !this.dogInfo) return;
    const createDoghouseResponse = await apiCall(this.accessToken).post<CreateDoghouseResponse>(
      API_DOGHOUSE_CREATE,
      {
        dogId: this.dogInfo.id,
        lat: this.userPos.lat,
        lng: this.userPos.lng,
      }
    );

    if (createDoghouseResponse.status === 200) {
      const { createResult, dog } = createDoghouseResponse.data;

      updateDogInfoEvent(this, dog);

      alertNotifySuccess(`Your doghouse ${createResult.name} was created`);

      this.getDoghousesList();

      this.openPopup(createResult.id);
    }
  }

  protected willUpdate(_changedProperties: PropertyValues): void {
    console.log('WillUpdate', _changedProperties);
  }

  updated(changedProperties: PropertyValues<this>): void {
    console.log('updated', changedProperties);
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

    const urlTemplate = 'https://{s}.tile.osm.org/{z}/{x}/{y}.png';
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
  }

  render() {
    return html`
      <link rel="stylesheet" href="https://cdn.skypack.dev/leaflet/dist/leaflet.css" />
      <div id="container" @updateDoghouses=${this.updateDoghousesHandler}>
        <div id="info-box">
          <div id="info-box-line">
            <sl-icon id="info-box-icon" name="lightning-charge"></sl-icon>${this.dogInfo?.energy}
          </div>
        </div>

        <div id="map" @closePopup=${this.closePopup}></div>

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
            <div id="geolocation-position" @click=${this.getUserPosition}>
              <svg-icon name="accurate" id="geolocation-position-icon"></svg-icon>
              <p id="geolocation-position-text">Click to find your position</p>
            </div>
          </div>
        </div>`}
      </div>
    `;
  }
}
