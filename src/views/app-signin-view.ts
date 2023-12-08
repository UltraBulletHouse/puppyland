import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '../components/app-firebase';
import { sharedStyles } from '../styles/shared-styles';

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

  render() {
    return html`
      <main>
        <div id="container">
          <app-firebase></app-firebase>
          <sl-button pill>Visit as guest</sl-button>
        </div>
      </main>
    `;
  }
}
