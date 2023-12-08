import { provide } from '@lit/context';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

import { USER_INFO } from './constants/apiConstants';
import { Views } from './constants/viewsConstants';
import { accessTokenContext } from './contexts/userFirebaseContext';
import { userInfoContext } from './contexts/userInfoContext';
import { viewsContext } from './contexts/viewsContext';
import './styles/global.css';
import { UserInfo } from './types/userInfo';
import { apiCall } from './utils/apiUtils';
import { auth } from './utils/firebase';

setBasePath(import.meta.env.BASE_URL + 'shoelace/');

@customElement('app-index')
export class AppIndex extends LitElement {
  /* Views context */
  @provide({ context: viewsContext })
  @property({ attribute: false })
  view: Views = Views.SINGIN_VIEW;

  /* UserFirebase context */
  // @provide({ context: userFirebaseContext })
  // @property({ attribute: false })
  // userFirebase: UserFirebase = null;

  /* accessTokenContext context */
  @provide({ context: accessTokenContext })
  @property({ attribute: false })
  accessToken: string | null = null;

  /* UserInfo context */
  @provide({ context: userInfoContext })
  @property({ attribute: false })
  userInfo: UserInfo | null = null;

  firstUpdated() {
    auth.onAuthStateChanged(async (userFirebase) => {
      if (userFirebase) {
        // this.userFirebase = userFirebase;

        const accessToken = await userFirebase.getIdToken();
        const userInfo: UserInfo = await apiCall(accessToken).get(USER_INFO);
        // console.log('User', userInfo,userFirebase);

        this.userInfo = userInfo;
        this.accessToken = accessToken;
        this.view = Views.MAP_VIEW;
      } else {
        console.log('NO USER');
      }
    });
  }

  createRenderRoot() {
    return this;
  }

  render() {
    console.log('RENDER VIEW===============', this.view);

    switch (this.view) {
      case Views.SINGIN_VIEW: {
        import('./views/app-signin-view');
        return html`<app-sign-view></app-sign-view>`;
      }
      case Views.MAP_VIEW: {
        import('./views/app-map-view');
        return html`<app-map-view></app-map-view>`;
      }
      default:
        return html`<div>DEFUALT</div>`;
    }
  }
}
