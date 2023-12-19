import { provide } from '@lit/context';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';

/* Common components loaded here */
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

import './components/app-footer/app-footer';
import { API_USER_INFO } from './constants/apiConstants';
import { accessTokenContext } from './contexts/userFirebaseContext';
import { userInfoContext } from './contexts/userInfoContext';
import { userPosContext } from './contexts/userPosContext';
import { viewContext } from './contexts/viewContext';
import { GeolocationController } from './controllers/GeolocationController';
import './styles/global.css';
import { sharedStyles } from './styles/shared-styles';
import { Coords } from './types/geolocation';
import { UserInfo, UserInfoResponse } from './types/userInfo';
import { View } from './types/view';
import { apiCall } from './utils/apiUtils';
import { auth } from './utils/firebase';

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

  /* UserFirebase context */
  // @provide({ context: userFirebaseContext })
  // @property({ attribute: false })
  // userFirebase: UserFirebase = null;

  /* Views context */
  @provide({ context: viewContext })
  @property({ attribute: false })
  view: View = View.SIGNIN_VIEW;

  /* AccessToken context */
  @provide({ context: accessTokenContext })
  @property({ attribute: false })
  accessToken: string | null = null;

  /* UserInfo context */
  @provide({ context: userInfoContext })
  @property({ attribute: false })
  userInfo: UserInfo | null = null;

  /* UserPosition context */
  @provide({ context: userPosContext })
  @property({ attribute: false })
  userPos: Coords | null = null;

  updateView(event: CustomEvent<View>) {
    this.view = event.detail;
  }

  updateUserInfo(event: CustomEvent<UserInfo>) {
    this.userInfo = event.detail;
  }

  private geolocation = new GeolocationController(this);

  connectedCallback() {
    super.connectedCallback();
    const watchUserPos = (coords: Coords) => {
      this.userPos = coords;
    };
    this.geolocation.watchUserPostion(watchUserPos);
  }

  firstUpdated() {
    auth.onAuthStateChanged(async (userFirebase) => {
      if (userFirebase) {
        const accessToken = await userFirebase.getIdToken();
        const userInfoResponse = await apiCall(accessToken).get<UserInfoResponse>(API_USER_INFO);

        this.userInfo = userInfoResponse.data.user;
        this.accessToken = accessToken;
        this.view = View.MAP_VIEW;
      } else {
        console.log('NO USER');
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
        return html`<app-map-view @updateUserInfo=${this.updateUserInfo}></app-map-view>`;
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
      default: {
        return html`<div><sl-spinner style="font-size: 3rem;"></sl-spinner></div>`;
      }
    }
  }

  render() {
    const isSigninView = this.view === View.SIGNIN_VIEW;

    return html`
      <div id="main-container">
        <div id="content">${cache(this.renderContent(this.view))}</div>
        <app-footer ?hidden=${isSigninView} @updateView=${this.updateView}></app-footer>
      </div>
    `;
  }
}
