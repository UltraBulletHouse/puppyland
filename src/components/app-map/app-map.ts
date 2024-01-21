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
import { drawMarker, generatePulsatingMarker, getClosestDoghouses } from '../../utils/mapUtils';
import '../app-modal/app-modal-addhouse';
import './app-map-popup-attack/app-map-popup-attack';
import './app-map-popup/app-map-popup';
import { AppMapStyles } from './app-map-syles';

import doghouseOwnPath from '../../assets/icons/home-color.svg'
import doghouseEnemyPath from  '../../assets/icons/doghouse.svg'
import doghouseAttackPath from '../../assets/icons/doghouse-attack.svg'

interface SetDoghousesMarkers {
  size?: [number, number]
}

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

  // @state()
  // doghouseOwnPath: string | null = null;

  // @state()
  // doghouseEnemyPath: string | null = null;

  // @state()
  // doghouseAttackPath: string | null = null;

  @state()
  prevZoom: number = 17;

  @state()
  markerSize: number = 40;

  @state()
  prevSize: number = 40;

  @state()
  firstDraw: boolean = true;

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
      // console.log('setUserPostion');
      
      this.userPosMarker.setLatLng([lat, lng]);
      this.setDoghousesMarkers({});
    } else {
      const pulsatingIcon = generatePulsatingMarker(L, 10, 'var(--color-blue)');
      this.userPosMarker = L.marker([lat, lng], {
        icon: pulsatingIcon,
        zIndexOffset: 999999,
      }).addTo(this.map);
    }
  }



  setDoghousesMarkers({size}:SetDoghousesMarkers) {
    console.log('#---setDoghousesMarkers', size?.[0], this.markerSize);
    this.firstDraw = false


    if (!this.map || !this.userPos || !this.doghouses) return;
    const dogInfoId = this.dogInfo?.id;
    const closestDoghouses = getClosestDoghouses(this.userPos, this.doghouses, dogInfoId);

    this.doghouses.forEach((doghouse: Doghouse) => {
      if (!this.map) return;
      const { id, dogId, name, lat, lng, hp, maxHp } = doghouse;
      const isClose = closestDoghouses?.find((dh) => dh.id === doghouse.id);

      if (isClose) {
        const popupAttackContent = `<app-map-popup-attack dogId=${dogInfoId} doghouseId=${id} doghouseName=${name} dhHp=${hp} dhMaxHp=${maxHp}></app-map-popup-attack>`;

        // drawMarker({
        //   self: this,
        //   coords: { lat, lng },
        //   popupContent: popupAttackContent,
        //   canvasMarkerImg: {
        //     url: doghouseAttackPath,
        //     // url: this.markerSize === 40 ? doghouseOwnPath : doghouseEnemyPath ,
        //     // url: doghouseOwnPath ,
        //     size: [this.markerSize,this.markerSize],
        //   },
        // });
      } else {

//-----------------------------------------
        const coords = { lat: lat, lng: lng };
      const coords2 = { lat: lat + 0.0003, lng: lng}
      const coords3 = { lat: lat + 0.0003, lng: lng + 0.0003}
      const coords4 = { lat: lat, lng: lng + 0.0003}
      // // const marker = L.circle(coords, { renderer: this.myRenderer });
      // const marker = L.polygon([coords, coords2,coords3,coords4], {smoothFactor:2, color: '#f97a2c' });

      // marker.addTo(this.map).bindPopup(`${name}`);

//------------------------------------------------------
      L.circle(coords, { radius: this.markerSize}).addTo(this.map);
      L.polygon([coords, coords2,coords3,coords4], { color: 'orange'}).addTo(this.map);


//-----------------------------------------------------------------

        // const popupContent = `<app-map-popup dhId=${id} dhName=${name} dhHp=${hp} dhMaxHp=${maxHp}></app-map-popup>`;

        // drawMarker({
        //   self: this,
        //   coords: { lat, lng },
        //   popupContent,
        //   canvasMarkerImg: {
        //     url: dogId === dogInfoId ? doghouseOwnPath : doghouseEnemyPath,
        //     size: [this.markerSize,this.markerSize]
        //   },
        // });





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
    // console.log(this.firstDraw);
    if (this.firstDraw) return
    if (!this.map) return;
    const currentZoom = this.map.getZoom();
    // console.log(this.prevZoom, currentZoom);



    const needUpdateSmaller = this.prevZoom > 15 && currentZoom <= 15
    const needUpdateBigger = this.prevZoom <= 15 && currentZoom > 15
// console.log(needUpdateSmaller, needUpdateBigger);

    //TODO: Kasowac stare i malowac jeszcze raz
    if (needUpdateSmaller) {
    // const ctx = (this.map.options as any).renderer._container
    // if (ctx) {
    //   const mapCtx = ctx.getContext('2d');
    //   mapCtx.save()
    // }

      // this.setDoghousesMarkers({size:[10,10]})
      this.markerSize = 20
    } else if (needUpdateBigger) {
      // const ctx = (this.map.options as any).renderer._container
      // if (ctx) {
      //   const mapCtx = ctx.getContext('2d');
      //   mapCtx.save()
      // }

      // this.setDoghousesMarkers({})
      this.markerSize = 40
    }
    
this.prevZoom = currentZoom

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
    // const doghouseOwnPath = await import('../../assets/icons/home-color.svg');
    // this.doghouseOwnPath = doghouseOwnPath.default;

    // const doghouseEnemyPath = await import('../../assets/icons/doghouse.svg');
    // this.doghouseEnemyPath = doghouseEnemyPath.default;

    // const doghouseAttackPath = await import('../../assets/icons/doghouse-attack.svg');
    // this.doghouseAttackPath = doghouseAttackPath.default;

    /* Create Map */
    const mapEl = this.shadowRoot?.querySelector('#map') as HTMLDivElement;
    const canvasLayer = L.canvas()

    if (!mapEl) return;
    const map = L.map(mapEl, {
      renderer: canvasLayer
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
        zoomSnap: 1
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

        <img id="lamp" src=${doghouseOwnPath}>

      </div>
    `;
  }
}
