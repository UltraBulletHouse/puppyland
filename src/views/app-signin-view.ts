import { signInWithPopup } from 'firebase/auth';
import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { t } from '../i18n';
import { sharedStyles } from '../styles/shared-styles';
import { alertNotifyDanger } from '../utils/alertsUtils';
import { auth, googleProvider } from '../utils/firebase';

/**
 * @fires updateView
 */
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
        background: var(--app-bg);
      }
      #signpost-icon {
        font-size: 50px;
        margin-bottom: 40px;
      }
      #google-btn {
        margin-bottom: 10px;
      }
    `,
  ];

  async signInWithGoogle() {
    await signInWithPopup(auth, googleProvider).catch((err) => {
      alertNotifyDanger(err.message);
    });
  }

  render() {
    return html`
      <div id="container">
        <div><sl-icon id="signpost-icon" name="signpost-split"></sl-icon></div>
        <sl-button id="google-btn" pill @click=${this.signInWithGoogle}>
          <sl-icon name="google"></sl-icon> ${t('signInWithGoogle')}</sl-button
        >
      </div>
    `;
  }
}
