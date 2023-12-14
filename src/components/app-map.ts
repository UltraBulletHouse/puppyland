import { consume } from '@lit/context';
import L from 'leaflet';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import {
  API_DOGHOUSES_NEAR_USER,
  API_DOGHOUSE_ATTACK,
  API_DOGHOUSE_CREATE,
} from '../constants/apiConstants';
import { accessTokenContext } from '../contexts/userFirebaseContext';
import { userInfoContext } from '../contexts/userInfoContext';
import { sharedStyles } from '../styles/shared-styles';
import { AttackDoghouseResponse, CreateDoghouseResponse, Doghouse } from '../types/doghouse';
import { UserInfo } from '../types/userInfo';
import { alertNotifySuccess } from '../utils/alertsUtils';
import { apiCall } from '../utils/apiUtils';
import { getUserPostion, watchUserPosition } from '../utils/geolocation';
import {
  generateDoghouseIcon,
  generatePulsatingMarker,
  getClosestDoghouse,
} from '../utils/mapUtils';

@customElement('app-map')
export class AppMap extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #container {
        height: 100%;
      }
      #map {
        height: 100%;
        width: 100%;
        overflow: hidden;
      }
      .leaflet-top,
      .leaflet-bottom {
        z-index: 400;
      }
      .leaflet-control-attribution.leaflet-control {
        pointer-events: none;
      }
      .map-layer,
      .leaflet-tile-container {
        filter: grayscale(1);
      }
      .leaflet-touch .leaflet-control-layers,
      .leaflet-touch .leaflet-bar {
        box-shadow: 0px 0px 12px 0px #0000002b;
      }
      #controls {
        position: relative;
        display: flex;
        align-items: end;
        justify-content: space-between;
        height: 60px;
        bottom: 85px;
        padding: 0 10px;
        z-index: 9999;
      }
      #add-doghouse-btn::part(base) {
        border-color: var(--sl-color-green-300);
      }
      #add-doghouse-btn::part(base):hover {
        border-color: var(--sl-color-green-300);
      }
      #add-doghouse-btn::part(base):active {
        border-color: var(--sl-color-green-300);
      }
      #attack-doghouse-btn::part(base) {
        border-color: var(--sl-color-red-300);
      }
      #attack-doghouse-btn::part(base):hover {
        border-color: var(--sl-color-red-300);
      }
      #attack-doghouse-btn::part(base):active {
        border-color: var(--sl-color-red-300);
      }
      #pulse {
        display: block;
        border-radius: 50%;
        cursor: pointer;
        animation: pulse 4s infinite;
      }
      .control-counter {
        font-size: 16px;
        display: flex;
        justify-content: center;
        background: #ffffff;
        border-radius: 15px;
      }

      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0;
        }
        70% {
          box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
        }
      }
    `,
  ];

  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  @consume({ context: userInfoContext, subscribe: true })
  @property({ attribute: false })
  userInfo: UserInfo | null = null;

  @state()
  lat?: number;

  @state()
  lng?: number;

  @state()
  map?: L.Map;

  @state()
  userPosMarker?: L.Marker;

  @state()
  doghouses?: Doghouse[];

  @state()
  closestDoghouse: Doghouse | null = null;

  getUserPosition() {
    const getUserPositionSuccess = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      this.lat = lat;
      this.lng = lng;

      if (this.map) {
        this.map.setView([lat, lng], 17);
        this.setDoghousesMarkers();
      }

      alertNotifySuccess(`We found your location ${lat}, ${lng}`);
    };

    getUserPostion(getUserPositionSuccess);
  }

  watchUserPostion() {
    if (!this.doghouses) {
      this.setDoghousesMarkers();
    }

    const watchUserPositionSuccess = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      this.lat = lat;
      this.lng = lng;
      if (!this.map) return;

      if (this.userPosMarker) {
        this.map.removeLayer(this.userPosMarker);
      }
      // this.map.setView([lat, lng], 17);

      const pulsatingIcon = generatePulsatingMarker(L, 10, '#2e96f8');
      this.userPosMarker = L.marker([lat, lng], {
        icon: pulsatingIcon,
        zIndexOffset: 999999,
      }).addTo(this.map);

      const userInfoId = this.userInfo?.id;
      const closestDoghouse = getClosestDoghouse(lat, lng, this.doghouses, userInfoId);
      this.closestDoghouse = closestDoghouse;
    };

    watchUserPosition(watchUserPositionSuccess);
  }

  centerPosition() {
    if (this.map && this.lat && this.lng) {
      this.map.setView([this.lat, this.lng], 17);
    }
  }

  updateUserInfo(user: UserInfo) {
    const options: CustomEventInit<UserInfo> = {
      detail: user,
      bubbles: true,
      composed: true,
    };
    this.dispatchEvent(new CustomEvent<UserInfo>('updateUserInfo', options));
  }

  async setDoghousesMarkers() {
    if (!this.map || !this.lat || !this.lng) return;
    if (!this.accessToken) return;
    const {
      data: { doghousesList },
    } = await apiCall(this.accessToken).get(API_DOGHOUSES_NEAR_USER, {
      params: {
        lat: this.lat.toString(),
        lng: this.lng.toString(),
      },
    });

    console.log('MAP-VIEW-DoghousesList', doghousesList);
    if (!doghousesList) return;
    this.doghouses = doghousesList;

    const userInfoId = this.userInfo?.id;
    this.closestDoghouse = getClosestDoghouse(this.lat, this.lng, doghousesList, userInfoId);

    doghousesList.forEach((doghouse: Doghouse) => {
      if (!this.map) return;
      const { name, lat, lng, hp, maxHp, userId } = doghouse;

      L.marker([lat, lng], { icon: generateDoghouseIcon(userId === userInfoId) })
        .bindPopup(`${name} Hp: ${hp}/${maxHp}`)
        .addTo(this.map);
    });
  }

  async addDoghouse() {
    if (!this.accessToken) return;

    const createDoghouseResponse = await apiCall(this.accessToken).post<CreateDoghouseResponse>(
      API_DOGHOUSE_CREATE,
      {
        lat: this.lat,
        lng: this.lng,
      }
    );

    alertNotifySuccess('Your doghouse was created');

    const userInfoRes = createDoghouseResponse.data.user;
    if (userInfoRes) {
      this.updateUserInfo(userInfoRes);
    }
    if (createDoghouseResponse.status === 200) {
      this.setDoghousesMarkers();
    }
  }

  async attackDoghouse() {
    if (!this.lat || !this.lng || !this.doghouses) return;
    if (!this.accessToken) return;

    const userInfoId = this.userInfo?.id;
    const closestDoghouse = getClosestDoghouse(this.lat, this.lng, this.doghouses, userInfoId);

    if (!closestDoghouse) return;
    const attackDoghouseResponse = await apiCall(this.accessToken).patch<AttackDoghouseResponse>(
      API_DOGHOUSE_ATTACK,
      {
        doghouseId: closestDoghouse.id,
      }
    );

    const userInfoRes = attackDoghouseResponse.data.user;
    if (userInfoRes) {
      this.updateUserInfo(userInfoRes);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.getUserPosition();
    this.watchUserPostion();
  }

  firstUpdated() {
    /* Create Map */
    const mapEl = this.shadowRoot?.querySelector('#map') as HTMLDivElement;
    if (!mapEl) return;
    let map = L.map(mapEl);
    this.map = map;
    // map.locate({setView: true,enableHighAccuracy: true})

    let urlTemplate = 'https://{s}.tile.osm.org/{z}/{x}/{y}.png';
    map.addLayer(L.tileLayer(urlTemplate, { minZoom: 1, attribution: '© OpenStreetMap' }));
  }

  render() {
    return html`
      <link rel="stylesheet" href="https://cdn.skypack.dev/leaflet/dist/leaflet.css" />
      <div id="container">
        <div id="map"></div>
        <div id="controls">
          <div id="attack-doghouse" @click=${this.attackDoghouse}>
            <div class="control-counter">${this.userInfo?.availableAttacks ?? ''}</div>
            <sl-button
              id="attack-doghouse-btn"
              variant="default"
              size="large"
              circle
              ?disabled=${!this.closestDoghouse}
            >
              <sl-icon name="lightning-charge"></sl-icon>
            </sl-button>
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

// TODO: Remove

// #add-doghouse .btn-icon {
//   border-radius: 50%;
//   background: #fff;
//   border: 1px solid var(--sl-color-amber-600);
//   color: var(--sl-color-amber-600);
// }
// #add-doghouse sl-button::part(base),
// #add-doghouse sl-button::part(base):hover,
// #add-doghouse sl-button::part(base):active {
//   color: var(--sl-color-amber-600);
// }

//     const mapEl = this.shadowRoot?.querySelector('#map') as HTMLDivElement;
//     if (!mapEl) return;
//     let map = createMap(mapEl).setView([51.505, -0.09], 13);

// L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
//     attribution: '© OpenStreetMap'
// }).addTo(map);

// var myIcon = L.icon({
//   iconUrl: '../assets/icons/192x192.png',
//   iconSize: [192, 192],
//   iconAnchor: [100, 94],
//   popupAnchor: [-3, -76],
//   shadowSize: [68, 95],
//   shadowAnchor: [22, 94],
// });

// var circle = L.circle([51.5, -0.09], {
//   color: 'red',
//   fillColor: 'black',
//   fillOpacity: 0.5,
//   radius: 1000,
// }).addTo(map);

// L.marker([51.5, -0.09], { icon: myIcon }).addTo(map).bindPopup(newDiv).openPopup();

// map.on('click', function (ev) {
//   L.marker([ev.latlng.lat, ev.latlng.lng], { icon: myIcon }).addTo(map);
// });

// Set veiw to London
//     map.setView([51.505, -0.09], 13);
