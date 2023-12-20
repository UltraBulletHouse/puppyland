import { provide } from '@lit/context';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';

/* Common components loaded here */
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

import './components/app-footer/app-footer';
import { API_USER_INFO } from './constants/apiConstants';
import { dogInfoContext } from './contexts/dogInfoContext';
import { accessTokenContext } from './contexts/userFirebaseContext';
import { userInfoContext } from './contexts/userInfoContext';
import { userPosContext } from './contexts/userPosContext';
import { viewContext } from './contexts/viewContext';
import { GeolocationController } from './controllers/GeolocationController';
import './styles/global.css';
import { sharedStyles } from './styles/shared-styles';
import { DogInfo } from './types/dog';
import { Coords } from './types/geolocation';
import { UserInfo, UserInfoResponse } from './types/userInfo';
import { View } from './types/view';
import { apiCall } from './utils/apiUtils';
import { auth } from './utils/firebase';
import './views/app-loading-view';

setBasePath(import.meta.env.BASE_URL + 'shoelace/');

@customElement('app-index')
export class AppIndex extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #main-container {
        height: 100vh;
        width: 100vw;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      #content {
        flex: 1;
      }
    `,
  ];

  /* Views context */
  @provide({ context: viewContext })
  @property({ attribute: false })
  view: View = View.LOADING_VIEW;

  updateView(event: CustomEvent<View>) {
    this.view = event.detail;
  }

  /* AccessToken context */
  @provide({ context: accessTokenContext })
  @property({ attribute: false })
  accessToken: string | null = null;

  /* UserInfo context */
  @provide({ context: userInfoContext })
  @property({ attribute: false })
  userInfo: UserInfo | null = null;

  updateUserInfo(event: CustomEvent<UserInfo>) {
    this.userInfo = event.detail;
  }

  /* DogInfo context */
  @provide({ context: dogInfoContext })
  @property({ attribute: false })
  dogInfo: DogInfo | null = null;

  updateDogInfo(event: CustomEvent<DogInfo>) {
    this.dogInfo = event.detail;
  }

  /* UserPosition context */
  @provide({ context: userPosContext })
  @property({ attribute: false })
  userPos: Coords | null = null;

  private geolocation = new GeolocationController(this);

  connectedCallback() {
    super.connectedCallback();

    const watchUserPos = (coords: Coords) => {
      console.log(coords);
      this.userPos = coords;
    };
    this.geolocation.watchUserPostion(watchUserPos);
  }

  updated(changedProperties: PropertyValueMap<this>) {
    if (changedProperties.has('view')) {
      return;
    }

    if (this.geolocation.permissionGeolocation && this.userPos && this.userInfo) {
      this.view = View.MAP_VIEW;
    }
  }

  firstUpdated() {
    auth.onAuthStateChanged(async (userFirebase) => {
      this.view = View.LOADING_VIEW;

      if (userFirebase) {
        const accessToken = await userFirebase.getIdToken();
        const userInfoResponse = await apiCall(accessToken).get<UserInfoResponse>(API_USER_INFO);

        this.userInfo = userInfoResponse.data.user;
        this.dogInfo = userInfoResponse.data.dog;
        this.accessToken = accessToken;
      } else {
        console.log('NO USER');
        this.view = View.SIGNIN_VIEW;
      }
    });
  }

  renderContent(view: View) {
    switch (view) {
      case View.SIGNIN_VIEW: {
        import('./views/app-signin-view');
        return html`<app-signin-view></app-signin-view>`;
      }
      case View.MAP_VIEW: {
        import('./views/app-map-view');
        return html`<app-map-view @updateDogInfo=${this.updateDogInfo}></app-map-view>`;
      }
      case View.USER_VIEW: {
        import('./views/app-user-view');
        return html`<app-user-view></app-user-view>`;
      }
      case View.SHOP_VIEW: {
        return html`<div>SHOP VIEW</div>`;
      }
      case View.DOG_VIEW: {
        return html`<div>DOG VIEW</div>`;
      }
      case View.DOGHOUSE_VIEW: {
        return html`<div>DOGHOUSE VIEW</div>`;
      }
      case View.LOADING_VIEW: {
        return html`<app-loading-view></app-loading-view>`;
      }
      default: {
        return html`<div>NULL</div>`;
      }
    }
  }

  render() {
    const isFooterHidden =
      this.view === View.SIGNIN_VIEW || this.view === View.LOADING_VIEW || !this.view;

    return html`
      <div id="main-container" @updateView=${this.updateView}>
        <div id="content">${cache(this.renderContent(this.view))}</div>
        <app-footer ?hidden=${isFooterHidden}></app-footer>
      </div>
    `;
  }
}
