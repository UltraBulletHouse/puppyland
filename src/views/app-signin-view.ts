import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '../components/app-firebase';
import { styles } from '../styles/shared-styles';
import { resolveRouterPath } from '../utils/router';

@customElement('app-signin-view')
export class AppSignin extends LitElement {
  static styles = [
    styles,
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
          <sl-button href="${resolveRouterPath('map-view')}" pill>Visit as guest</sl-button>
        </div>
      </main>
    `;
  }
}