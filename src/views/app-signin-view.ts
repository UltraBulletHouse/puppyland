import { signInWithPopup } from 'firebase/auth';
import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { sharedStyles } from '../styles/shared-styles';
import { auth, googleProvider } from '../utils/firebase';

@customElement('app-signin-view')
export class AppSignin extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #container {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        height: 100%;
      }
    `,
  ];

  async signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    console.log(result);
  }

  render() {
    return html`
      <main>
        <div id="container">
          <sl-button pill @click=${this.signInWithGoogle}>GOOGLE</sl-button>
          <sl-button pill>Visit as guest</sl-button>
        </div>
      </main>
    `;
  }
}
