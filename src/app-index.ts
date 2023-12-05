import { provide } from '@lit/context';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

import { userContext } from './contexts/user-context';
import './styles/global.css';
import { UserFirebase, auth } from './utils/firebase';
import { router } from './utils/router';

setBasePath(import.meta.env.BASE_URL + 'shoelace/');

@customElement('app-index')
export class AppIndex extends LitElement {
  /* UserFirebase context */
  @provide({ context: userContext })
  @property({ attribute: false })
  userFirebase: UserFirebase = null;

  firstUpdated() {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log('UserFirebase', user);
        this.userFirebase = user;
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
