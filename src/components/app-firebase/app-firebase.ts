import firebase from 'firebase/compat/app';
import * as firebaseui from 'firebaseui';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { auth } from '../../utils/firebase';

// import { auth } from '../../utils/firebase';

@customElement('app-firebase')
export class AppFirebase extends LitElement {
  static styles = [
    css`
      #firebaseui-container .firebaseui-idp-button {
        border-radius: 2.5rem;
      }
    `,
  ];

  @property({ type: Boolean }) stylesLoaded = false;
  @property({ type: firebaseui.auth.AuthUI}) uiFirebase;

  constructor() {
    super();
    this.uiFirebase = new firebaseui.auth.AuthUI(auth);
  }

  onLoadStyles() {
    this.stylesLoaded = true;
  }

  async signin() {
    await this.updateComplete; // in case called before firstUpdated
    const container = this.shadowRoot?.getElementById('firebaseui-container') as HTMLElement;
    // this.uiFirebase.start(container, { callbacks, privacyPolicyUrl, signInFlow, signInOptions, tosUrl });
    const uiConfig: firebaseui.auth.Config = {
      popupMode: true,
      signInSuccessUrl: self.location.href,
      signInOptions: [firebase.auth.GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD],
    };
    this.uiFirebase.start(container, uiConfig);
  }

  signout() {
    auth.signOut();
  }

  // signInSuccessWithAuthResult(authResult, _redirectUrl) {/*...*/}
  // async signInFailure(error) {/*...*/}

  connectedCallback() {
    super.connectedCallback();

    this.signin();
  }

  render() {
    return html`
      <link
        rel="stylesheet"
        href="https://www.gstatic.com/firebasejs/ui/4.3.0/firebase-ui-auth.css"
        @load="${this.onLoadStyles}"
      />
      <div id="firebaseui-container" ?hidden="${!this.stylesLoaded}"></div>
    `;
  }
}
