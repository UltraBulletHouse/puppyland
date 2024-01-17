import { consume } from '@lit/context';
import L from 'leaflet';
import 'leaflet-edgebuffer';
import { LitElement, PropertyValueMap, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

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
import { generatePulsatingMarker, getClosestDoghouses } from '../../utils/mapUtils';
import '../app-modal/app-modal-addhouse';
import './app-map-popup-attack/app-map-popup-attack';
import './app-map-popup/app-map-popup';
import { AppMapStyles } from './app-map-syles';

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
    console.log('#---setDoghousesMarkers');
    if (!this.map || !this.userPos || !this.doghouses) return;

    const dogInfoId = this.dogInfo?.id;
    const closestDoghouses = getClosestDoghouses(this.userPos, this.doghouses, dogInfoId);

    this.doghouses.forEach((doghouse: Doghouse) => {
      if (!this.map) return;
      const { id, dogId, name, lat, lng, hp, maxHp } = doghouse;
      const isClose = closestDoghouses?.find((dh) => dh.id === doghouse.id);

      if (isClose) {
        const popupContent = `<app-map-popup-attack dogId=${dogInfoId} doghouseId=${id} doghouseName=${name} dhHp=${hp} dhMaxHp=${maxHp}></app-map-popup-attack>`;
        const marker = (L as any).canvasMarker(L.latLng(lat, lng), {
          radius: 40, // WAZNE zeby nie bylo artefaktow
          img: {
            url: this.doghouseAttackPath,
            size: [40, 40],
            rotate: 0,
            offset: { x: 0, y: 0 },
          },
        });
        marker.addTo(this.map).bindPopup(popupContent, {
          minWidth: 108,
        });
      } else {
        const popupContent = `<app-map-popup dhId=${id} dhName=${name} dhHp=${hp} dhMaxHp=${maxHp}></app-map-popup>`;

        const marker = (L as any).canvasMarker(L.latLng(lat, lng), {
          radius: 40, // WAZNE zeby nie bylo artefaktow
          img: {
            url: dogId === dogInfoId ? this.doghouseOwnPath : this.doghouseEnemyPath,
            size: [40, 40],
            rotate: 0,
            offset: { x: 0, y: 0 },
          },
        });

        marker.addTo(this.map).bindPopup(popupContent, {
          minWidth: 108,
        });
      }
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

  /* ZMIANA - NIE DZIALA = Rysowac od nowa z doghouseList (uzyc util) */
  scaleOnZoom = () => {
    if (!this.map) return;
    const currentZoom = this.map.getZoom();
    // console.log(currentZoom);

    //TODO: Kasowac stare i malowac jeszcze raz
    if (currentZoom < 15) {
      // this.markersList.forEach((marker: Polygon) => {
      //   // (marker?.options as any).img.size = [20, 20];
      //   // (marker?.options as any).img.rotate = 45;
      //   (marker?.options as any).img = {
      //     // url: this.doghouseEnemyPath, //image link
      //     size: [10, 10], //image size ( default [40, 40] )
      //     rotate: 0, //image base rotate ( default 0 )
      //     offset: { x: 0, y: 0 }, //image offset ( default { x: 0, y: 0 } )
      //   };
      // });
    } else {
      // this.markersList.forEach((marker: Polygon) => {
      //   // (marker?.options as any).img.size = [40, 40];
      //   // (marker?.options as any).img.rotate = 0;
      //   (marker?.options as any).img = {
      //     // url: this.doghouseEnemyPath, //image link
      //     size: [40, 40], //image size ( default [40, 40] )
      //     rotate: 0, //image base rotate ( default 0 )
      //     offset: { x: 0, y: 0 }, //image offset ( default { x: 0, y: 0 } )
      //   };
      // });
    }
  };

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
    const doghouseOwnPath = await import('../../assets/icons/home-color.svg');
    this.doghouseOwnPath = doghouseOwnPath.default;

    const doghouseEnemyPath = await import('../../assets/icons/doghouse.svg');
    this.doghouseEnemyPath = doghouseEnemyPath.default;

    const doghouseAttackPath = await import('../../assets/icons/doghouse-attack.svg');
    this.doghouseAttackPath = doghouseAttackPath.default;

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
        minZoom: 11,
        maxZoom: 19,
        attribution: '© OpenStreetMap',
        edgeBufferTiles: 1,
        preferCanvas: true,
      } as TileLayerOptionsPlugins)
    );

    map.on('zoomend', this.scaleOnZoom);
  }

  render() {
    return html`
      <link rel="stylesheet" href="https://cdn.skypack.dev/leaflet/dist/leaflet.css" />
      <div id="container">
        <div id="map"></div>
        <div id="controls">
          <div id="dog-posibilities">
            <div class="control-counter">
              <sl-icon name="lightning-charge"></sl-icon> ${this.dogInfo?.attackPower ?? ''}
            </div>
            <div class="control-counter">
              <sl-icon name="heart-arrow"></sl-icon> ${this.dogInfo?.availableAttacks ?? ''}
            </div>
            <div class="control-counter">
              <sl-icon name="house-add"></sl-icon> ${this.dogInfo?.availableDoghouses ?? ''}
            </div>
          </div>
          <div id="right-side">
            <div id="add-doghouse" @click=${this.addDoghouse}>
              <sl-button
                id="add-doghouse-btn"
                variant="default"
                size="large"
                circle
                ?disabled=${!this.dogInfo?.availableDoghouses}
              >
                <sl-icon name="house-add" id="house-add-icon"></sl-icon>
              </sl-button>
            </div>
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
