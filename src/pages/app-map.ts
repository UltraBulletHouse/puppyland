import { consume } from '@lit/context';
import L from 'leaflet';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { userContext } from '../contexts/user-context';
import { styles } from '../styles/shared-styles';
import { UserFirebase } from '../utils/firebase';
import { watchUserPosition } from '../utils/geolocation';

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
        width: 100%;
        height: 60px;
        bottom: 60px;
        z-index: 9999;

        justify-content: end;
      }
      #add-doghouse {
        font-size: 32px;
        margin-right: 10px;
      }
      #add-doghouse .btn-icon {
        border-radius: 50%;
        background: #fff;
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

  getUserPostion() {
    const watchUserPositionSuccess = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      // const accuracy = pos.coords.accuracy; // Accuracy in metres

      this.lat = lat;
      this.lng = lng;
    };
    /* Get user location */
    watchUserPosition(watchUserPositionSuccess);
  }

  async addDoghouse() {
    const accesToken = await this.userFirebase?.getIdToken();
    console.log('POST',accesToken);
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

  connectedCallback() {
    super.connectedCallback();
    this.getUserPostion();
  }

  async updated() {
        // console.log(this.lat, this.lng);
    if ((!this.map || !this.lat || !this.lng)) return

      this.map.setView([this.lat, this.lng], 20);
      L.circle([this.lat, this.lng], {
        color: '#0284c7',
        fillColor: '#0284c7',
        fillOpacity: 0.8,
        radius: 4,
      }).addTo(this.map);

    // GET
    const accesToken = await this.userFirebase?.getIdToken();
    // console.log('GET',accesToken);
    if (!accesToken) return;

    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': 'Bearer ' + accesToken,
    };

    const response = await fetch(
      apiUrl + 'DogHouses/NearUser' +
        '?' +
        new URLSearchParams({
          lat: this.lat.toString() ,
          lng: this.lng.toString(),
        }),
      {
        method: 'get',
        headers: headers,
      }
    );
    const houses = await response.json();
    console.log(houses);

    if (!houses) return
    var myIcon = L.icon({
      iconUrl: '../assets/icons/192x192.png',
      iconSize: [192, 192],
      iconAnchor: [100, 94],
      popupAnchor: [-3, -76],
      shadowSize: [68, 95],
      shadowAnchor: [22, 94],
    });

    houses.forEach((house: { lat: any; lng: any; }) => {
      const {lat, lng} = house
      if (!this.map) return
      L.marker([lat, lng],  { icon: myIcon }).addTo(this.map)
    });

  }

  firstUpdated() {
    /* Create Map */
    const mapEl = this.shadowRoot?.querySelector('#map') as HTMLDivElement;
    if (!mapEl) return;
    let map = L.map(mapEl);
    this.map = map;

    map.setView([51.505, -0.09], 13);

    let urlTemplate = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
    map.addLayer(L.tileLayer(urlTemplate, { minZoom: 10, attribution: '© OpenStreetMap' }));

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
          <div id="add-doghouse" @click=${this.addDoghouse}>
            <sl-icon-button name="house" class="btn-icon"></sl-icon-button>
          </div>
        </div>
      </div>
    `;
  }
}

// TODO: Remove

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
