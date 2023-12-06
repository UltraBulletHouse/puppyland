import { provide } from '@lit/context';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

import { userFirebaseContext } from './contexts/userFirebaseContext';
import { userInfoContext } from './contexts/userInfoContext';
import './styles/global.css';
import { UserInfo } from './types/userInfo';
import { apiCall } from './utils/apiUtils';
import { UserFirebase, auth } from './utils/firebase';
import { router } from './utils/router';

setBasePath(import.meta.env.BASE_URL + 'shoelace/');

@customElement('app-index')
export class AppIndex extends LitElement {
  /* UserFirebase context */
  @provide({ context: userFirebaseContext })
  @property({ attribute: false })
  userFirebase: UserFirebase = null;

  /* UserInfo context */
  @provide({ context: userInfoContext })
  @property({ attribute: false })
  userInfo: UserInfo | null = null;

  firstUpdated() {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log('UserFirebase', user);
        this.userFirebase = user;

        const accesToken = await user.getIdToken();
        const userInfo: UserInfo = await apiCall(accesToken).get('User');
        this.userInfo = userInfo;
        console.log('UserInfo',userInfo);

        router.navigate('map-view');
      } else {
        router.navigate('');
      }
    });

    router.addEventListener('route-changed', () => {
      if ('startViewTransition' in document) {
        (document as any).startViewTransition(() => this.requestUpdate());
      } else {
        this.requestUpdate();
      }
    });
  }

  createRenderRoot() {
    return this;
  }

  render() {
    return html` <div>${router.render()}</div>`;
  }
}
