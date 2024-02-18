import { consume } from '@lit/context';
import L from 'leaflet';
import 'leaflet-edgebuffer';
import { LitElement, PropertyValueMap, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/badge/badge.js';

import doghouseAttackPath from '../../assets/icons/marker-dh-new.svg';
import doghouseEnemyPath from '../../assets/icons/marker-dh-new.svg';
import doghouseOwnPath from '../../assets/icons/marker-dh-new.svg';
import { API_DOGHOUSES_NEAR_USER, API_DOGHOUSE_CREATE } from '../../constants/apiConstants';
import { dogInfoContext, updateDogInfoEvent } from '../../contexts/dogInfoContext';
import { accessTokenContext } from '../../contexts/userFirebaseContext';
import { userInfoContext } from '../../contexts/userInfoContext';
import { userPosContext } from '../../contexts/userPosContext';
import '../../scripts/leaflet-canvas-markers';
import { DogInfo } from '../../types/dog';
import {
  CreateDoghouseResponse,
  CreateResult,
  Doghouse,
  GetDoghouseNearUserResponse,
} from '../../types/doghouse';
import { Coords } from '../../types/geolocation';
import { TileLayerOptionsPlugins } from '../../types/map';
import { UserInfo } from '../../types/userInfo';
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

  @consume({ context: userPosContext, subscribe: true })
  @property({ attribute: false })
  userPos: Coords | null = null;

  @state()
  map?: L.Map;

  @state()
  userPosMarker?: L.Marker;

  @state()
  doghouses?: Doghouse[];

  @state()
  addDoghouseResponse: CreateResult | null = null;

  @state()
  isAddHouseModalOpen: boolean = false;

  @state()
  doghouseOwnPath: string | null = null;

  @state()
  doghouseEnemyPath: string | null = null;

  @state()
  doghouseAttackPath: string | null = null;

  closeModal = () => {
    this.isAddHouseModalOpen = false;
  };

  closePopup() {
    this.map?.closePopup();
  }

  centerPosition() {
    if (this.map && this.userPos) {
      this.map.setView([this.userPos.lat, this.userPos.lng], 17);
    }
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

  setDoghousesMarkers() {
    console.log('#SetMarkers', this.userPos);

    if (!this.map || !this.userPos || !this.doghouses) return;

    const dogInfoId = this.dogInfo?.id;

    this.doghouses.forEach((doghouse: Doghouse) => {
      if (!this.map || !this.userPos) return;
      const { id, dogId, name, lat, lng, hp, maxHp } = doghouse;
      const dhName = encodeURIComponent(name);

      const popupContent =
        dogId === dogInfoId
          ? `<map-popup isOwn=${true} dogId=${dogInfoId} dhId=${id} dhName=${dhName} dhHp=${hp} 
              dhMaxHp=${maxHp} dhCoords=${`${lat}/${lng}`} userCoords=${`${this.userPos.lat}/${this.userPos.lng}`}></map-popup>`
          : `<map-popup dogId=${dogInfoId} dhId=${id} dhName=${dhName} dhHp=${hp} dhMaxHp=${maxHp} 
              dhCoords=${`${lat}/${lng}`} userCoords=${`${this.userPos.lat}/${this.userPos.lng}`}></map-popup>`;

      drawMarker({
        self: this,
        coords: { lat, lng },
        popupContent,
        canvasMarkerImg: {
          url: dogId === dogInfoId ? doghouseOwnPath : doghouseEnemyPath,
        },
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
      this.addDoghouseResponse = createDoghouseResponse.data.createResult;
      this.isAddHouseModalOpen = true;

      const userDogRes = createDoghouseResponse.data.dog;
      updateDogInfoEvent(this, userDogRes);

      this.getDoghousesList();
    }
  }

  /* OK */
  willUpdate(changedProperties: PropertyValueMap<this>) {
    if (changedProperties.has('map') && this.map && this.userPos) {
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
  }

  render() {
    return html`
      <link rel="stylesheet" href="https://cdn.skypack.dev/leaflet/dist/leaflet.css" />
      <div id="container">
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

        <app-modal-addhouse
          .open=${this.isAddHouseModalOpen}
          .addDoghouseResponse=${this.addDoghouseResponse}
          @addhouseModal=${this.closeModal}
        ></app-modal-addhouse>
      </div>
    `;
  }
}
