import { consume } from '@lit/context';
import L from 'leaflet';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { userContext } from '../contexts/user-context';
import { styles } from '../styles/shared-styles';
import { UserFirebase } from '../utils/firebase';
import { getUserPostion, watchUserPosition } from '../utils/geolocation';

// const corsAny = 'https://cors-anywhere.herokuapp.com/'
const apiUrl = 'https://testaccount1rif-001-site1.anytempurl.com/';

@customElement('app-map')
export class AppMap extends LitElement {
  static styles = [
    styles,
    css`
      #container {
        height: 100%;
      }
      #map {
        height: 100%;
        width: 100%;
        overflow: hidden;
      }
      #controls {
        position: relative;
        display: flex;
        justify-content: space-between;
        height: 60px;
        bottom: 70px;
        padding: 0 10px;
        z-index: 9999;
      }
      #add-doghouse {
        font-size: 32px;
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
    `,
  ];

  @state()
  map?: L.Map;

  @state()
  lat?: number;

  @state()
  lng?: number;

  @consume({ context: userContext, subscribe: true })
  @property({ attribute: false })
  userFirebase?: UserFirebase;

  constructor() {
    super();
    this.getUserPosition();
  }

  connectedCallback() {
    super.connectedCallback();
    this.watchUserPostion();
  }

  getUserPosition() {
    const watchUserPositionSuccess = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      this.lat = lat;
      this.lng = lng;
      console.log('getUserPosition', lat, lng);

      if (this.map && this.lat && this.lng) {
        this.map.setView([this.lat, this.lng], 20);
      }
    };
    getUserPostion(watchUserPositionSuccess);
  }

  watchUserPostion() {
    const watchUserPositionSuccess = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      this.lat = lat;
      this.lng = lng;

      if (!this.map) return;
      L.circle([lat, lng], {
        color: '#0284c7',
        fillColor: '#0284c7',
        fillOpacity: 0.8,
        radius: 4,
      }).addTo(this.map);
    };
    /* Get user location */
    watchUserPosition(watchUserPositionSuccess);
  }

  centerPosition() {
    if (this.map && this.lat && this.lng) {
      this.map.setView([this.lat, this.lng], 20);
    }
  }

  async addDoghouse() {
    const accesToken = await this.userFirebase?.getIdToken();
    if (!accesToken) return;

    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': 'Bearer ' + accesToken,
    };

    // POST
    await fetch(apiUrl + 'DogHouses', {
      method: 'post',
      headers: headers,
      body: JSON.stringify({
        lat: this.lat,
        lng: this.lng,
      }),
    });
  }

  async attackDoghouse() {
    console.log('ATTACK');
  }

  async updated() {
    if (!this.map || !this.lat || !this.lng) return;

    // GET
    const accesToken = await this.userFirebase?.getIdToken();
    if (!accesToken) return;

    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': 'Bearer ' + accesToken,
    };

    const response = await fetch(
      apiUrl +
        'DogHouses/NearUser' +
        '?' +
        new URLSearchParams({
          lat: this.lat.toString(),
          lng: this.lng.toString(),
        }),
      {
        method: 'get',
        headers: headers,
      }
    );
    const houses = await response.json();
    console.log(houses);
    if (!houses) return;

    var myIcon = L.icon({
      iconUrl: '../assets/icons/192x192.png',
      iconSize: [192, 192],
      iconAnchor: [100, 94],
      popupAnchor: [-3, -76],
      shadowSize: [68, 95],
      shadowAnchor: [22, 94],
    });

    houses.forEach((house: { lat: any; lng: any }) => {
      const { lat, lng } = house;
      if (!this.map) return;
      L.marker([lat, lng], { icon: myIcon }).addTo(this.map);
    });
  }

  firstUpdated() {
    /* Create Map */
    const mapEl = this.shadowRoot?.querySelector('#map') as HTMLDivElement;
    if (!mapEl) return;
    let map = L.map(mapEl);
    this.map = map;

    let urlTemplate = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
    map.addLayer(L.tileLayer(urlTemplate, { minZoom: 1, attribution: '© OpenStreetMap' }));

    const newDiv = document.createElement('input');
    const newContent = document.createTextNode('Hi there and greetings!');
    newDiv.appendChild(newContent);
  }

  render() {
    return html`
      <link rel="stylesheet" href="https://cdn.skypack.dev/leaflet/dist/leaflet.css" />
      <div id="container">
        <div id="map"></div>
        <div id="controls">
          <div id="attack-doghouse" @click=${this.attackDoghouse}>
            <sl-button variant="default" size="large" circle>
              <sl-icon name="lightning-charge"></sl-icon>
            </sl-button>
          </div>
          <div id="center-position" @click=${this.centerPosition}>
            <sl-button variant="default" size="large" circle>
              <sl-icon name="record-circle"></sl-icon>
            </sl-button>
          </div>
          <div id="add-doghouse" @click=${this.addDoghouse}>
            <sl-button variant="default" size="large" circle>
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
