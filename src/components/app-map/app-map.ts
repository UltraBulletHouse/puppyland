import { consume } from '@lit/context';
import L, { Polygon } from 'leaflet';
import 'leaflet-canvas-markers';
import 'leaflet-edgebuffer';
import { LitElement, PropertyValueMap, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { API_DOGHOUSES_NEAR_USER, API_DOGHOUSE_CREATE } from '../../constants/apiConstants';
import { dogInfoContext, updateDogInfoEvent } from '../../contexts/dogInfoContext';
import { accessTokenContext } from '../../contexts/userFirebaseContext';
import { userInfoContext } from '../../contexts/userInfoContext';
import { userPosContext } from '../../contexts/userPosContext';
import { DogInfo } from '../../types/dog';
import { CreateDoghouseResponse, CreateResult, Doghouse } from '../../types/doghouse';
import { Coords } from '../../types/geolocation';
import { MarkersList, TileLayerOptionsPlugins } from '../../types/map';
import { UserInfo } from '../../types/userInfo';
import { apiCall } from '../../utils/apiUtils';
import '../../utils/mapUtils';
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
  userPosMarker?: L.Circle;

  @state()
  doghouses?: Doghouse[];

  @state()
  markersList: MarkersList | null = null;

  @state()
  addDoghouseResponse: CreateResult | null = null;

  @state()
  isAddHouseModalOpen: boolean = false;

  @state()
  arrowMarkerPath: string | null = null;

  @state()
  doghouseMarkerPath: string | null = null;

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
      //TODO: Test if drawing arrow marker costs a lot, revert it or go back to pulse icon 
      // this.userPosMarker.setLatLng([lat, lng]);
    } else {
      // const pulsatingIcon = generatePulsatingMarker(L, 10, 'var(--color-blue)');
      // this.userPosMarker = L.marker([lat, lng], {
      //   icon: pulsatingIcon,
      //   zIndexOffset: 999999,
      // }).addTo(this.map);
      // ------------------------------------------------

      if (!this.markersList || !this.arrowMarkerPath) return;

      const marker = (L as any).canvasMarker(L.latLng(lat, lng), {
        radius: 30,
        img: {
          url: this.arrowMarkerPath, //image link
          size: [40, 40], //image size ( default [40, 40] )
          rotate: 0, //image base rotate ( default 0 )
          offset: { x: 0, y: 0 }, //image offset ( default { x: 0, y: 0 } )
        },
      });

      marker.addTo(this.map);
      this.userPosMarker = marker;
    }

    //TODO: Revert back
    // this.setDefaultDoghousesMarkers();
    // this.updateClosestDoghousesMarkers();
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

    // const dogInfoId = this.dogInfo?.id;
    // const closestDoghouses = getClosestDoghouses(this.userPos, this.doghouses, dogInfoId);

    /* Update Closest Markers */
    // closestDoghouses?.forEach(({ id, name }) => {
    // const mark = this.markersList?.get(id);
    // const doghouseIcon = generateDoghouseIcon({ isClose: true });
    // const popupContent = `<app-map-popup-attack dogId=${dogInfoId} doghouseId=${id} doghouseName=${name}></app-map-popup-attack>`;
    // mark?.setIcon(doghouseIcon).bindPopup(popupContent, {
    //   minWidth: 108,
    // });
    // });
  }

  setDefaultDoghousesMarkers() {
    // const dogInfoId = this.dogInfo?.id;
    /* MarkersList Map */ //TODO: przerobic na reduce
    // const markersList = new Map<string, L.Circle | L.Polyline | L.Polygon>();
    const markersList = new Map<string, L.Polygon>();
    this.doghouses?.forEach((doghouse: Doghouse) => {
      if (!this.map) return;
      // const { id, dogId, name, lat, lng, hp, maxHp } = doghouse;
      const { name, id, lat, lng } = doghouse;
      // const popupContent = `<app-map-popup dhId=${id} dhName=${name} dhHp=${hp} dhMaxHp=${maxHp}></app-map-popup>`;

      // const marker = L.marker([lat, lng], {
      //   icon: generateDoghouseIcon({ isOwn: dogId === dogInfoId }),
      // })
      //   .bindPopup(popupContent, {
      //     minWidth: 108,
      //   })
      //   .addTo(this.map);
      //------------------------------------------------------------------------
      // const coords = { lat: lat, lng: lng };
      // const coords2 = { lat: lat + 0.0002, lng: lng}
      // const coords3 = { lat: lat + 0.0002, lng: lng + 0.0002}
      // const coords4 = { lat: lat, lng: lng + 0.0002}
      // // const marker = L.circle(coords, { renderer: this.myRenderer });
      // const marker = L.polygon([coords, coords2,coords3,coords4], { renderer: this.myRenderer, smoothFactor:2, color: '#f97a2c' });

      const marker = (L as any).canvasMarker(L.latLng(lat, lng), {
        radius: 10,
        img: {
          url: this.doghouseMarkerPath, //image link
          size: [40, 40], //image size ( default [40, 40] )
          rotate: 0, //image base rotate ( default 0 )
          offset: { x: 0, y: 0 }, //image offset ( default { x: 0, y: 0 } )
        },
      });

      marker.addTo(this.map).bindPopup(`${name}`);

      markersList.set(id, marker);
    });
    this.markersList = markersList;
  }

  scaleOnZoom = () => {
    if (!this.map || !this.markersList) return;
    const currentZoom = this.map.getZoom();

    //TODO: Kasowac stare i malowac jeszcze raz
    if (currentZoom < 15) {
      this.markersList.forEach((marker: Polygon) => {
        // (marker?.options as any).img.size = [20, 20];
        // (marker?.options as any).img.rotate = 45;

        (marker?.options as any).img = {
          url: this.doghouseMarkerPath, //image link
          size: [20, 20], //image size ( default [40, 40] )
          rotate: 0, //image base rotate ( default 0 )
          offset: { x: 0, y: 0 }, //image offset ( default { x: 0, y: 0 } )
        };

        marker.redraw();
      });
    } else {
      this.markersList.forEach((marker: Polygon) => {
        // (marker?.options as any).img.size = [40, 40];
        // (marker?.options as any).img.rotate = 0;

        (marker?.options as any).img = {
          url: this.doghouseMarkerPath, //image link
          size: [40, 40], //image size ( default [40, 40] )
          rotate: 0, //image base rotate ( default 0 )
          offset: { x: 0, y: 0 }, //image offset ( default { x: 0, y: 0 } )
        };

        marker.redraw();
      });
    }
  };

  async setDoghousesMarkers() {
    if (!this.map || !this.userPos) return;

    const {
      data: { doghousesList },
    } = await apiCall().get(API_DOGHOUSES_NEAR_USER, {
      params: {
        lat: this.userPos.lat.toString(),
        lng: this.userPos.lng.toString(),
      },
    });

    if (!doghousesList) return;
    this.doghouses = doghousesList;

    this.setDefaultDoghousesMarkers();

    //TODO: zeby wysylal w NearMe coordynaty i wrzucic tu zamiast this.map.getBounds()
    // this.map.setMaxBounds(this.map.getBounds());
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
      this.addDoghouseResponse = createDoghouseResponse.data.createResult;
      this.isAddHouseModalOpen = true;

      const userDogRes = createDoghouseResponse.data.dog;
      updateDogInfoEvent(this, userDogRes);

      this.setDoghousesMarkers();
    }
  }

  async firstUpdated() {
    const arrowPath = await import('../../assets/icons/direction-top-position-icon.svg');
    this.arrowMarkerPath = arrowPath.default;
    const doghousePath = await import('../../assets/icons/doghouse.svg');
    this.doghouseMarkerPath = doghousePath.default;

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
        edgeBufferTiles: 2,
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
