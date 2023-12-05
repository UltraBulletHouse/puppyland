import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '../components/app-footer';
import '../components/app-header';
import { styles } from '../styles/shared-styles';
import '../components/app-map';

@customElement('app-map-view')
export class AppMapView extends LitElement {
  static styles = [
    styles,
    css`
      #container {
        flex: 1;
      }
    `,
  ];

  render() {
    return html`
      <main>
        <div id="container">
          <app-map></app-map>
        </div>
        <app-footer></app-footer>
      </main>
    `;
  }
}
