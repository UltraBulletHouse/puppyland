import { consume } from '@lit/context';
import L from 'leaflet';
import { LitElement, PropertyValueMap, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { API_DOGHOUSES_NEAR_USER, API_DOGHOUSE_CREATE } from '../../constants/apiConstants';
import { accessTokenContext } from '../../contexts/userFirebaseContext';
import {
  updateUserInfoEvent,
  userInfoContext,
} from '../../contexts/userInfoContext/userInfoContext';
import { userPosContext } from '../../contexts/userPosContext';
import { CreateDoghouseResponse, Doghouse } from '../../types/doghouse';
import { Coords } from '../../types/geolocation';
import { MarkersList } from '../../types/map';
import { UserInfo } from '../../types/userInfo';
import { alertNotifySuccess } from '../../utils/alertsUtils';
import { apiCall } from '../../utils/apiUtils';
import {
  generateDoghouseIcon,
  generatePulsatingMarker,
  getClosestDoghouses,
} from '../../utils/mapUtils';
import './app-map-popup-attack/app-map-popup-attack';
import { AppMapStyles } from './app-map-syles';

@customElement('app-map')
export class AppMap extends LitElement {
  static styles = AppMapStyles;

  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  @consume({ context: userInfoContext, subscribe: true })
  @property({ attribute: false })
  userInfo: UserInfo | null = null;

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

    this.updateDoghousesMarkers();

    // TODO: nie dodawac za kazdym razem tylko zmienaic pozcyje
    if (this.userPosMarker) {
      this.map.removeLayer(this.userPosMarker);
    }

    const { lat, lng } = this.userPos;
    const pulsatingIcon = generatePulsatingMarker(L, 10, '#2e96f8');
    this.userPosMarker = L.marker([lat, lng], {
      icon: pulsatingIcon,
      zIndexOffset: 999999,
    }).addTo(this.map);

    // const userInfoId = this.userInfo?.id;
    // const closestDoghouse = getClosestDoghouse(this.userPos, this.doghouses, userInfoId);
    // this.closestDoghouse = closestDoghouse;
  }

  updated(changedProperties: PropertyValueMap<this>) {
    if (changedProperties.has('map') && this.map && this.userPos) {
      const { lat, lng } = this.userPos;
      this.map.setView([lat, lng], 17);
    }
    if (changedProperties.has('userPos') && this.userPos && this.map) {
      // TODO: nie ustaiwac od nowa tylko iterowac po liscie i udate closest
      this.setUserPostion();
    }
  }

  updateDoghousesMarkers() {
    if (!this.map || !this.userPos || !this.doghouses) return;

    const userInfoId = this.userInfo?.id;
    const closestDoghouses = getClosestDoghouses(this.userPos, this.doghouses, userInfoId);
    console.log('ClosestDoghouses = ', closestDoghouses);

    /* Update Closest Markers */
    closestDoghouses?.forEach(({ id }) => {
      const mark = this.markersList?.get(id);
      const doghouseIcon = generateDoghouseIcon({ isClose: true });
      const popupContent = `<app-map-popup-attack doghouseId=${id}>`;
      mark?.setIcon(doghouseIcon).setPopupContent(popupContent);
    });
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
    // console.log('DoghousesList = ', doghousesList);

    if (!doghousesList) return;
    this.doghouses = doghousesList;
    const userInfoId = this.userInfo?.id;

    /* MarkersList Map */ //TODO: przerobic na reduce
    const markersList = new Map<string, L.Marker>();
    doghousesList.forEach((doghouse: Doghouse) => {
      if (!this.map) return;
      const { id, userId, name, lat, lng, hp, maxHp } = doghouse;
      const marker = L.marker([lat, lng], {
        icon: generateDoghouseIcon({ isOwn: userId === userInfoId }),
      })
        .bindPopup(`${name} Hp: ${hp}/${maxHp} Coords: ${lat}, ${lng}`)
        .addTo(this.map);

      markersList.set(id, marker);
    });
    this.markersList = markersList;

    this.updateDoghousesMarkers();

    // const userInfoId = this.userInfo?.id;
    // const closestDoghouses = getClosestDoghouses(this.userPos, doghousesList, userInfoId);
    // console.log('ClosestDoghouses = ', closestDoghouses);

    // /* MarkersList Map */ //TODO: przerobic na reduce
    // const markersList = new Map<string, L.Marker>();
    // doghousesList.forEach((doghouse: Doghouse) => {
    //   if (!this.map) return;
    //   const { id, userId, name, lat, lng, hp, maxHp } = doghouse;
    //   const marker = L.marker([lat, lng], {
    //     icon: generateDoghouseIcon({ isOwn: userId === userInfoId }),
    //   })
    //     .bindPopup(`${name} Hp: ${hp}/${maxHp} Coords: ${lat}, ${lng}`)
    //     .addTo(this.map);

    //   markersList.set(id, marker);
    // });
    // this.markersList = markersList;

    // console.log(markersList);

    // /* Update Closest Markers */
    // closestDoghouses?.forEach((doghouse) => {
    //   const mark = markersList.get(doghouse.id);
    //   const doghouseIcon = generateDoghouseIcon({ isClose: true });
    //   mark?.setIcon(doghouseIcon).setPopupContent('ATACK');
    // });
  }

  async addDoghouse() {
    if (!this.accessToken || !this.userPos) return;
    const createDoghouseResponse = await apiCall(this.accessToken).post<CreateDoghouseResponse>(
      API_DOGHOUSE_CREATE,
      {
        lat: this.userPos.lat,
        lng: this.userPos.lng,
      }
    );

    // TODO: Dodac do doghouses i markerslist - zrobic util/controller updateujacy obie listy

    alertNotifySuccess('Your doghouse was created');

    const userInfoRes = createDoghouseResponse.data.user;
    if (userInfoRes) {
      updateUserInfoEvent(this, userInfoRes);
    }
    if (createDoghouseResponse.status === 200) {
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
          <div id="attack-doghouse">
            <div class="control-counter">
              <sl-icon name="lightning-charge"></sl-icon> ${this.userInfo?.availableAttacks ?? ''}
            </div>
          </div>
          <div id="center-position" @click=${this.centerPosition}>
            <sl-button variant="default" size="large" circle>
              <sl-icon name="record-circle"></sl-icon>
            </sl-button>
          </div>
          <div id="add-doghouse" @click=${this.addDoghouse}>
            <div class="control-counter">${this.userInfo?.availableDoghouses ?? ''}</div>
            <sl-button
              id="add-doghouse-btn"
              variant="default"
              size="large"
              circle
              ?disabled=${!this.userInfo?.availableDoghouses}
            >
              <sl-icon name="house-add"></sl-icon>
            </sl-button>
          </div>
        </div>
      </div>
    `;
  }
}
