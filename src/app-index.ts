import { provide } from '@lit/context';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

import './components/app-footer';
import { API_USER_INFO } from './constants/apiConstants';
import { accessTokenContext } from './contexts/userFirebaseContext';
import { userInfoContext } from './contexts/userInfoContext';
import { viewsContext } from './contexts/viewsContext';
import './styles/global.css';
import { sharedStyles } from './styles/shared-styles';
import { UserInfo } from './types/userInfo';
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

  /* Views context */
  @provide({ context: viewsContext })
  @property({ attribute: false })
  view: View = View.SINGIN_VIEW;

  /* UserFirebase context */
  // @provide({ context: userFirebaseContext })
  // @property({ attribute: false })
  // userFirebase: UserFirebase = null;

  /* AccessToken context */
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
        const accessToken = await userFirebase.getIdToken();
        const userInfo: UserInfo = await apiCall(accessToken).get(API_USER_INFO);
        // console.log('User', userInfo,userFirebase);

        // this.userFirebase = userFirebase;
        this.userInfo = userInfo;
        this.accessToken = accessToken;
        this.view = View.MAP_VIEW;
      } else {
        console.log('NO USER');
      }
    });
  }

  renderContent(view: View) {
    switch (view) {
      case View.SINGIN_VIEW: {
        import('./views/app-signin-view');
        return html`<app-signin-view></app-signin-view>`;
      }
      case View.MAP_VIEW: {
        import('./views/app-map-view');
        return html`<app-map-view></app-map-view>`;
      }
      default: {
        return html`<div><sl-spinner style="font-size: 3rem;"></sl-spinner></div>`;
      }
    }
  }

  render() {
    console.log('RENDER VIEW===============', this.view);

    const isSigninView = this.view === View.SINGIN_VIEW;

    return html` <div id="main-container">
      <div id="content">${this.renderContent(this.view)}</div>
      <app-footer ?hidden=${isSigninView}></app-footer>
    </div>`;
  }
}
