import { provide } from '@lit/context';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { User } from 'firebase/auth';
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
import { API_SUBSCRIPTION_REFRESH, API_USER_INFO } from './constants/apiConstants';
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
import { idbGet, idbSet } from './utils/idb';
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

  @property({ type: Boolean })
  isLoading: boolean = true;

  updateDogInfo(event: CustomEvent<DogInfo>) {
    this.dogInfo = event.detail;
  }

  async firstUpdated() {
    // Request persistent storage to improve offline reliability (best effort)
    try {
      await (navigator as any).storage?.persist?.();
    } catch {}

    auth.onAuthStateChanged(async (userFirebase: User | null) => {
      this.isLoading = true;

      if (userFirebase) {
        const accessToken = await userFirebase.getIdToken();
        // Attempt to refresh subscription status on app start (server uses stored token if available)
        const lastChecked = Number(localStorage.getItem('premiumRefreshTs') || '0');
        const now = Date.now();
        if (now - lastChecked > 30 * 60 * 1000) {
          try {
            await apiCall(accessToken).post(API_SUBSCRIPTION_REFRESH, {});
          } catch {}
          localStorage.setItem('premiumRefreshTs', String(now));
        }
        // Try last-known user/dog from IDB first for instant UI, then refresh from network
        const cacheKey = 'user-info';
        try {
          const cached = await idbGet<UserInfoResponse>(cacheKey);
          if (cached?.value) {
            this.userInfo = cached.value.user;
            this.dogInfo = cached.value.dog;
          }
        } catch {}

        const userInfoResponse = await apiCall(accessToken).get<UserInfoResponse>(API_USER_INFO);
        this.userInfo = userInfoResponse?.data?.user;
        this.dogInfo = userInfoResponse?.data?.dog;
        try {
          await idbSet<UserInfoResponse>(cacheKey, userInfoResponse.data);
        } catch {}

        this.accessToken = accessToken;

        this.view = View.MAP_VIEW;

        // Idle prefetch other views to speed up navigation (progressive enhancement)
        const idle = (cb: () => void) =>
          'requestIdleCallback' in window
            ? (window as any).requestIdleCallback(cb)
            : setTimeout(cb, 0);
        idle(() => {
          import('./views/app-dog-view').catch(() => {});
          import('./views/app-doghouses-view').catch(() => {});
          import('./views/app-shop-view').catch(() => {});
          import('./views/app-user-view').catch(() => {});
        });
      } else {
        this.view = View.SIGNIN_VIEW;
      }
      this.isLoading = false;
    });

    auth.onIdTokenChanged(async (user) => {
      if (user) {
        const newAccessToken = await user.getIdToken();
        this.accessToken = newAccessToken;
      }
    });
  }

  connectedCallback() {
    super.connectedCallback();
    // Refresh subscription in background when app/window regains focus, with cooldown
    const handler = async () => {
      const lastChecked = Number(localStorage.getItem('premiumRefreshTs') || '0');
      const now = Date.now();
      if (now - lastChecked > 30 * 60 * 1000 && this.accessToken) {
        try {
          await apiCall(this.accessToken).post(API_SUBSCRIPTION_REFRESH, {});
          const userInfoResponse = await apiCall(this.accessToken).get<UserInfoResponse>(
            API_USER_INFO
          );
          this.userInfo = userInfoResponse?.data?.user;
        } catch {}
        localStorage.setItem('premiumRefreshTs', String(now));
      }
    };
    window.addEventListener('visibilitychange', handler);
    window.addEventListener('focus', handler);
  }

  renderContent(view: View) {
    if (this.isLoading) {
      return html`<app-loading-view></app-loading-view>`;
    }

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
      default: {
        return html`<app-loading-view></app-loading-view>`;
      }
    }
  }

  render() {
    /* TEST 3*/
    const isFooterHidden = this.view === View.SIGNIN_VIEW || this.isLoading || !this.view;

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
