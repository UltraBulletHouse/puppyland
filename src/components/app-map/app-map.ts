import { consume } from '@lit/context';
import L from 'leaflet';
import { LitElement, PropertyValueMap, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { API_DOGHOUSES_NEAR_USER, API_DOGHOUSE_CREATE } from '../../constants/apiConstants';
import { dogInfoContext, updateDogInfoEvent } from '../../contexts/dogInfoContext';
import { accessTokenContext } from '../../contexts/userFirebaseContext';
import { userInfoContext } from '../../contexts/userInfoContext';
import { userPosContext } from '../../contexts/userPosContext';
import { DogInfo } from '../../types/dog';
import { CreateDoghouseResponse, Doghouse } from '../../types/doghouse';
import { Coords } from '../../types/geolocation';
import { MarkersList } from '../../types/map';
import { UserInfo } from '../../types/userInfo';
import { apiCall } from '../../utils/apiUtils';
import {
  generateDoghouseIcon,
  generatePulsatingMarker,
  getClosestDoghouses,
} from '../../utils/mapUtils';
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
  markersList: MarkersList | null = null;

  @state()
  addDoghouseResponse: string | null = null;
  // addDoghouseResponse: CreateDoghouseResponse | null = null;//TODO: caly objekt jak P naprawi

  @state()
  isAddHouseModalOpen: boolean = false;

  closeModal = () => {
    this.isAddHouseModalOpen = false;
  };

  centerPosition() {
    if (this.map && this.userPos) {
      this.map.setView([this.userPos.lat, this.userPos.lng], 17);
    }
  }

  setUserPostion() {
    if (!this.map || !this.userPos) return;

    if (!this.doghouses) {
      this.setDoghousesMarkers(); //TODO: Przeniesc gdzies na update tylko raz
    }

    const { lat, lng } = this.userPos;
    if (this.userPosMarker) {
      this.userPosMarker.setLatLng([lat, lng]);
    } else {
      const pulsatingIcon = generatePulsatingMarker(L, 10, '#2e96f8');
      this.userPosMarker = L.marker([lat, lng], {
        icon: pulsatingIcon,
        zIndexOffset: 999999,
      }).addTo(this.map);
    }

    this.setDefaultDoghousesMarkers();
    this.updateClosestDoghousesMarkers();
  }

  willUpdate(changedProperties: PropertyValueMap<this>) {
    if (changedProperties.has('map') && this.map && this.userPos) {
      const { lat, lng } = this.userPos;
      this.map.setView([lat, lng], 17);
    }

    if (this.userPos && this.map) {
      // TODO: nie ustaiwac od nowa tylko iterowac po liscie i udate closest
      this.setUserPostion();
    }
  }

  updateClosestDoghousesMarkers() {
    if (!this.map || !this.userPos || !this.doghouses) return;

    const dogInfoId = this.dogInfo?.id;
    const closestDoghouses = getClosestDoghouses(this.userPos, this.doghouses, dogInfoId);
    // console.log('ClosestDoghouses = ', closestDoghouses);

    /* Update Closest Markers */
    closestDoghouses?.forEach(({ id, name }) => {
      const mark = this.markersList?.get(id);
      const doghouseIcon = generateDoghouseIcon({ isClose: true });
      const popupContent = `<app-map-popup-attack dogId=${dogInfoId} doghouseId=${id} doghouseName=${name}></app-map-popup-attack>`;
      mark?.setIcon(doghouseIcon).bindPopup(popupContent, {
        minWidth: 108,
      });
    });
  }

  setDefaultDoghousesMarkers() {
    const dogInfoId = this.dogInfo?.id;

    /* MarkersList Map */ //TODO: przerobic na reduce
    const markersList = new Map<string, L.Marker>();
    this.doghouses?.forEach((doghouse: Doghouse) => {
      if (!this.map) return;
      const { id, dogId, name, lat, lng, hp, maxHp } = doghouse;
      const popupContent = `<app-map-popup dhId=${id} dhName=${name} dhHp=${hp} dhMaxHp=${maxHp}></app-map-popup>`;

      const marker = L.marker([lat, lng], {
        icon: generateDoghouseIcon({ isOwn: dogId === dogInfoId }),
      })
        .bindPopup(popupContent, {
          minWidth: 108,
        })
        .addTo(this.map);

      markersList.set(id, marker);
    });
    this.markersList = markersList;

    this.updateClosestDoghousesMarkers();
  }

  async setDoghousesMarkers() {
    if (!this.map || !this.userPos) return;
    if (!this.accessToken) return; //TODO: Remove, allow without
    const {
      data: { doghousesList },
    } = await apiCall(this.accessToken).get(API_DOGHOUSES_NEAR_USER, {
      params: {
        lat: this.userPos.lat.toString(),
        lng: this.userPos.lng.toString(),
      },
    });

    if (!doghousesList) return;
    this.doghouses = doghousesList;

    this.setDefaultDoghousesMarkers();
  }

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

    // TODO: Dodac do doghouses i markerslist - zrobic util/controller updateujacy obie listy

    if (createDoghouseResponse.status === 200) {
      this.addDoghouseResponse = createDoghouseResponse.data.name;
      this.isAddHouseModalOpen = true;

      const userDogRes = createDoghouseResponse.data.dog;
      updateDogInfoEvent(this, userDogRes);

      this.setDoghousesMarkers();
    }
  }

  firstUpdated() {
    /* Create Map */
    const mapEl = this.shadowRoot?.querySelector('#map') as HTMLDivElement;
    if (!mapEl) return;
    let map = L.map(mapEl);
    this.map = map;

    let urlTemplate = 'https://{s}.tile.osm.org/{z}/{x}/{y}.png';
    map.addLayer(L.tileLayer(urlTemplate, { minZoom: 1, attribution: '© OpenStreetMap' }));
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
                <sl-icon name="house-add"></sl-icon>
              </sl-button>
            </div>
            <div id="center-position" @click=${this.centerPosition}>
              <sl-button variant="default" size="large" circle>
                <sl-icon name="record-circle"></sl-icon>
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
