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
import './components/icon-svg/svg-icon';
import './components/icon-svg/svg-icon-button';
import { API_USER_INFO } from './constants/apiConstants';
import { dogInfoContext } from './contexts/dogInfoContext';
import { accessTokenContext } from './contexts/userFirebaseContext';
import { userInfoContext } from './contexts/userInfoContext';
import { viewContext } from './contexts/viewContext';
import './styles/global.css';
import { sharedStyles } from './styles/shared-styles';
import { DogInfo } from './types/dog';
import { UserInfo, UserInfoResponse } from './types/userInfo';
import { View } from './types/view';
import { apiCall } from './utils/apiUtils';
import { auth } from './utils/firebase';
import './views/app-loading-map-view';
import './views/app-loading-view';

// import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

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
        overflow: hidden;
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

  firstUpdated() {
    // TODO: https://stackoverflow.com/questions/54580414/how-can-i-detect-if-my-website-is-opened-inside-a-trusted-web-actvity
    // TODO: sprawdzac czy dziala sklep Google (to co w shop view)
    // console.log(document.referrer);

    auth.onAuthStateChanged(async (userFirebase) => {
      this.view = View.LOADING_VIEW;

      if (userFirebase) {
        const accessToken = await userFirebase.getIdToken();
        const userInfoResponse = await apiCall(accessToken).get<UserInfoResponse>(API_USER_INFO);

        this.userInfo = userInfoResponse?.data?.user;
        this.dogInfo = userInfoResponse?.data?.dog;
        this.accessToken = accessToken;

        /* DEFAULT VIEW */
        this.view = View.MAP_VIEW;
      } else {
        console.log('Please sign-in');
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
        import('./views/app-shop-view');
        return html`<app-shop-view></app-shop-view>`;
      }
      case View.DOG_VIEW: {
        import('./views/app-dog-view');
        return html`<app-dog-view></app-dog-view>`;
      }
      case View.DOGHOUSE_VIEW: {
        import('./views/app-doghouses-view');
        return html`<app-doghouses-view></app-doghouses-view>`;
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

    const hasShadowFooter = this.view === View.MAP_VIEW;

    return html`
      <div
        id="main-container"
        @updateView=${this.updateView}
        @updateUserInfo=${this.updateUserInfo}
        @updateDogInfo=${this.updateDogInfo}
      >
        <!-- <div id="content">${cache(
          this.renderContent(this.view)
        )}</div> // TODO: Sprawdzic czy lepiej czy gorzej - chyba lepiej bez-->
        <div id="content">${this.renderContent(this.view)}</div>
        <app-footer ?hidden=${isFooterHidden} .hasShadow=${hasShadowFooter}></app-footer>
      </div>
    `;
  }
}
